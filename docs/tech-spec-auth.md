# Evals_app - Technical Specification: Full Auth Implementation

**Author:** BMad
**Date:** 2025-12-22
**Project Level:** Quick-Flow (Single Story)
**Change Type:** Security Fix / Feature Completion
**Development Context:** Brownfield (existing codebase)
**Branch:** `feature/full-auth-completion`

---

## Context

### Available Documents

| Document | Status | Key Insights |
|----------|--------|--------------|
| Product Brief | Loaded | Open Coding platform for AI evaluation |
| Security Model | Loaded | **PRIMARY REFERENCE** - Full remediation guide |
| Architecture Overview | Available | Clean separation of concerns |
| Current auth.py | Analyzed | 3 critical issues identified |

### Project Stack

| Component | Version | Source |
|-----------|---------|--------|
| **Runtime** | Python 3.11+ | pyproject.toml |
| **Framework** | FastAPI 0.115.0+ | requirements.txt |
| **Database** | MongoDB (Motor 3.3.2) | requirements.txt |
| **Auth Provider** | Clerk | Frontend integrated |
| **HTTP Client** | httpx 0.25.2 | requirements.txt |
| **Deployment** | Railway | Live at evalsapp-production.up.railway.app |

### Existing Codebase Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── auth.py          # AUTH FIXES GO HERE
│   │   ├── annotations.py   # 3 demo-user occurrences
│   │   └── traces.py        # 5 demo-user occurrences
│   ├── core/
│   │   └── config.py        # Settings (Clerk keys)
│   ├── db/
│   │   └── mongodb.py       # Database connection
│   └── main.py              # FastAPI app
├── requirements.txt         # Dependencies (needs svix, PyJWT)
└── tests/
```

---

## The Change

### Problem Statement

The authentication system is **non-functional**, creating three critical security vulnerabilities that block multi-user support:

1. **AUTH-001: Token Verification Bypassed**
   - Location: `backend/app/api/auth.py:98-124`
   - Issue: `verify_clerk_token()` calls non-existent Clerk endpoint
   - Impact: Any malformed token accepted, unauthorized access possible

2. **AUTH-002: Webhook Signature Verification Disabled**
   - Location: `backend/app/api/auth.py:126-149`
   - Issue: `verify_webhook_signature()` always returns `True`
   - Impact: Attackers can POST to webhook and manipulate user data

3. **AUTH-003: Hardcoded Demo User**
   - Location: 8 endpoints across `annotations.py` and `traces.py`
   - Issue: All requests use `{"user_id": "demo-user"}`
   - Impact: No user isolation, all annotations collide

### Proposed Solution

1. **Implement proper JWT verification** using PyJWT with Clerk's JWKS public keys
2. **Implement Svix webhook verification** using the official `svix` package
3. **Create reusable `get_current_user` FastAPI dependency** that extracts and verifies user from JWT
4. **Replace all 8 demo-user patterns** with the new dependency
5. **Configure Clerk webhook** in dashboard and add secret to Railway

### Scope

**In Scope:**
- Fix AUTH-001: Implement JWT verification with PyJWT + JWKS
- Fix AUTH-002: Implement Svix webhook signature verification
- Fix AUTH-003: Replace 8 demo-user occurrences with real auth
- Add dependencies: `svix`, `PyJWT`
- Update Railway environment: Add `CLERK_WEBHOOK_SECRET`
- Set up Clerk webhook endpoint in dashboard

**Out of Scope:**
- Role-based access control (Phase 2)
- Rate limiting (Story 3)
- HTTPS enforcement (Railway handles)
- User management UI

---

## Implementation Details

### Source Tree Changes

| File | Action | Changes |
|------|--------|---------|
| `backend/requirements.txt` | MODIFY | Add `svix>=1.0.0`, `PyJWT>=2.8.0` |
| `backend/app/api/auth.py` | MODIFY | Rewrite `verify_clerk_token()`, `verify_webhook_signature()`, add `get_current_user_dependency()` |
| `backend/app/api/annotations.py` | MODIFY | Replace demo-user on lines 20, 85, 111 |
| `backend/app/api/traces.py` | MODIFY | Replace demo-user on lines 37, 142, 186, 232, 304 |
| `backend/app/core/config.py` | MODIFY | Add `clerk_jwks_url` setting |

### Technical Approach

#### 1. JWT Verification (AUTH-001 Fix)

**Current (Broken):**
```python
async def verify_clerk_token(token: str) -> Dict[str, Any]:
    response = await client.get(
        f"https://api.clerk.com/v1/sessions/{token}/verify",  # Wrong endpoint
        ...
    )
```

**New Implementation:**
```python
import jwt
from jwt import PyJWKClient

# Clerk publishes public keys at this URL
CLERK_JWKS_URL = "https://clerk.your-domain.com/.well-known/jwks.json"

# Cache the JWKS client (reuse across requests)
_jwks_client = None

def get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(settings.clerk_jwks_url)
    return _jwks_client

async def verify_clerk_token(token: str) -> Dict[str, Any]:
    """Verify Clerk JWT token using JWKS public keys"""
    try:
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # Clerk doesn't always set audience
        )

        return {
            "user_id": claims.get("sub"),
            "email": claims.get("email"),
            "session_id": claims.get("sid")
        }
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid JWT: {e}")
        return None
```

#### 2. Webhook Signature Verification (AUTH-002 Fix)

**Current (Broken):**
```python
def verify_webhook_signature(payload, signature, secret) -> bool:
    return True  # Always returns True!
```

**New Implementation:**
```python
from svix.webhooks import Webhook, WebhookVerificationError

@router.post("/webhook")
async def clerk_webhook(request: Request):
    payload = await request.body()
    headers = {
        "svix-id": request.headers.get("svix-id"),
        "svix-timestamp": request.headers.get("svix-timestamp"),
        "svix-signature": request.headers.get("svix-signature"),
    }

    if not settings.clerk_webhook_secret:
        logger.error("CLERK_WEBHOOK_SECRET not configured")
        raise HTTPException(status_code=500, detail="Webhook not configured")

    wh = Webhook(settings.clerk_webhook_secret)
    try:
        event = wh.verify(payload, headers)
    except WebhookVerificationError as e:
        logger.error(f"Webhook verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # Process verified event
    event_type = event.get("type")
    event_data = event.get("data")

    if event_type in ("user.created", "user.updated"):
        await sync_user(event_data)
    elif event_type == "user.deleted":
        await delete_user(event_data.get("id"))

    return {"status": "success"}
```

#### 3. Reusable Auth Dependency (AUTH-003 Fix)

**New `get_current_user` Dependency:**
```python
from fastapi import Depends, HTTPException, Request

async def get_current_user(request: Request) -> Dict[str, str]:
    """
    FastAPI dependency that extracts and verifies the current user from JWT.
    Use this in all protected endpoints.
    """
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )

    token = auth_header.split(" ")[1]
    user_data = await verify_clerk_token(token)

    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return {
        "user_id": user_data["user_id"],
        "email": user_data.get("email")
    }
```

**Usage in Endpoints (replace demo-user):**
```python
# Before (broken):
current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})

# After (fixed):
from app.api.auth import get_current_user
current_user: Dict = Depends(get_current_user)
```

### Existing Patterns to Follow

From `backend/app/api/auth.py`:
- Use `logger.error()` for error logging
- Raise `HTTPException` with status codes (401 for auth, 500 for server errors)
- Use `async def` for all endpoint handlers
- Use `get_database()` for MongoDB access

From `backend/app/core/config.py`:
- Settings use `pydantic-settings` with environment variables
- Access via `settings.clerk_backend_api_key`, `settings.clerk_webhook_secret`

### Integration Points

| Integration | Type | Details |
|-------------|------|---------|
| Clerk Frontend | Token Source | `window.Clerk.session.getToken()` |
| Clerk JWKS | Public Keys | `https://<clerk-domain>/.well-known/jwks.json` |
| Clerk Webhook | User Sync | POST to `/api/auth/webhook` |
| MongoDB | User Storage | `users` collection |
| MongoDB | Annotations | `annotations` collection with `user_id` field |

---

## Development Context

### Relevant Existing Code

| File | Lines | Reference For |
|------|-------|---------------|
| `backend/app/api/auth.py` | 54-96 | Current `get_current_user` route (rename to avoid conflict) |
| `backend/app/api/auth.py` | 98-124 | Token verification to replace |
| `backend/app/api/auth.py` | 126-149 | Webhook verification to replace |
| `backend/app/api/annotations.py` | 17-43 | Demo-user pattern to replace |
| `docs/architecture/security-model.md` | 128-177 | Correct implementation examples |

### Dependencies

**Framework/Libraries (to add):**

| Package | Version | Purpose |
|---------|---------|---------|
| `svix` | >=1.0.0 | Webhook signature verification |
| `PyJWT` | >=2.8.0 | JWT decoding and verification |

**Internal Modules:**

| Module | Import | Purpose |
|--------|--------|---------|
| `app.core.config` | `settings` | Access Clerk keys |
| `app.db.mongodb` | `get_database` | MongoDB access |
| `app.api.auth` | `get_current_user` | Auth dependency (new) |

### Configuration Changes

**Environment Variables (Railway):**

| Variable | Value | Notes |
|----------|-------|-------|
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | Get from Clerk dashboard after creating webhook |
| `CLERK_JWKS_URL` | `https://<clerk-domain>/.well-known/jwks.json` | Your Clerk frontend API URL |

**config.py Addition:**
```python
clerk_jwks_url: str = ""  # e.g., "https://your-app.clerk.accounts.dev/.well-known/jwks.json"
```

### Existing Conventions

| Convention | Pattern | Example |
|------------|---------|---------|
| Logging | `logger.error(f"message: {e}")` | `logger.error(f"Token verification failed: {e}")` |
| Exceptions | `HTTPException(status_code, detail)` | `raise HTTPException(status_code=401, detail="Invalid token")` |
| Async | All handlers use `async def` | `async def get_current_user(...)` |
| Type hints | Full typing | `-> Dict[str, Any]` |
| Docstrings | Triple quotes | `"""Verify Clerk JWT token"""` |

### Test Framework & Standards

| Aspect | Standard |
|--------|----------|
| Framework | pytest + pytest-asyncio |
| Test location | `backend/tests/` |
| Naming | `test_*.py` |
| Async tests | `@pytest.mark.asyncio` |

---

## Implementation Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Python | 3.11+ |
| Framework | FastAPI | 0.115.0+ |
| Auth | Clerk + PyJWT | Latest |
| Webhook | Svix | 1.0.0+ |
| Database | MongoDB (Motor) | 3.3.2 |
| HTTP | httpx | 0.25.2 |
| Deployment | Railway | N/A |

---

## Technical Details

### JWT Verification Flow

```
1. Frontend: User logs in via Clerk UI
2. Frontend: Gets JWT from Clerk session
3. Frontend: Adds JWT to Authorization header
4. Backend: Extract token from "Bearer <token>"
5. Backend: Fetch Clerk's public keys from JWKS endpoint (cached)
6. Backend: Verify JWT signature using RS256
7. Backend: Extract user_id from "sub" claim
8. Backend: Use user_id for all database queries
```

### Webhook Verification Flow

```
1. Clerk: User created/updated/deleted
2. Clerk: POST to /api/auth/webhook with Svix headers
3. Backend: Extract svix-id, svix-timestamp, svix-signature
4. Backend: Verify signature using svix.Webhook
5. Backend: Process event (sync_user or delete_user)
6. Backend: Return {"status": "success"}
```

### Error Handling

| Error | Status | Response |
|-------|--------|----------|
| Missing auth header | 401 | `{"detail": "Missing or invalid authorization header"}` |
| Invalid/expired token | 401 | `{"detail": "Invalid or expired token"}` |
| Invalid webhook signature | 401 | `{"detail": "Invalid webhook signature"}` |
| Webhook not configured | 500 | `{"detail": "Webhook not configured"}` |

### Edge Cases

1. **Token expired mid-session**: Return 401, frontend refreshes token via Clerk
2. **JWKS endpoint unavailable**: Cache JWKS client, retry logic
3. **Webhook replay attack**: Svix handles timestamp validation
4. **Missing CLERK_WEBHOOK_SECRET**: Log error, return 500 (fail safe)

---

## Development Setup

```bash
# 1. Activate virtual environment
cd backend
source venv/bin/activate

# 2. Install new dependencies
pip install svix PyJWT

# 3. Update requirements.txt
pip freeze | grep -E "svix|PyJWT" >> requirements.txt

# 4. Add environment variables to .env
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=whsec_your_secret_here

# 5. Run development server
uvicorn app.main:app --reload --port 8000

# 6. Run tests
pytest -v
```

---

## Implementation Guide

### Setup Steps

1. [ ] Create feature branch (already done: `feature/full-auth-completion`)
2. [ ] Install dependencies: `pip install svix PyJWT`
3. [ ] Update `requirements.txt`
4. [ ] Get Clerk JWKS URL from dashboard
5. [ ] Add `CLERK_JWKS_URL` to local `.env`

### Implementation Steps

**Step 1: Update requirements.txt**
```
svix>=1.0.0
PyJWT>=2.8.0
```

**Step 2: Update config.py**
- Add `clerk_jwks_url` setting

**Step 3: Rewrite auth.py**
- Replace `verify_clerk_token()` with JWT/JWKS implementation
- Replace `verify_webhook_signature()` with Svix implementation
- Add `get_current_user()` dependency function
- Rename existing `/me` route to avoid conflict

**Step 4: Update annotations.py**
- Import `get_current_user` from auth
- Replace 3 demo-user patterns (lines 20, 85, 111)

**Step 5: Update traces.py**
- Import `get_current_user` from auth
- Replace 5 demo-user patterns (lines 37, 142, 186, 232, 304)

**Step 6: Test locally**
- Verify JWT auth works with Clerk token
- Test annotation creation with real user_id

**Step 7: Deploy to Railway**
- Push changes
- Add `CLERK_JWKS_URL` environment variable
- Verify deployment

**Step 8: Set up Clerk webhook**
- Go to Clerk Dashboard > Webhooks
- Create webhook pointing to `https://evalsapp-production.up.railway.app/api/auth/webhook`
- Select events: `user.created`, `user.updated`, `user.deleted`
- Copy webhook secret
- Add `CLERK_WEBHOOK_SECRET` to Railway

### Testing Strategy

**Unit Tests:**
- `test_verify_clerk_token_valid()` - Valid JWT returns user data
- `test_verify_clerk_token_expired()` - Expired JWT returns None
- `test_verify_clerk_token_invalid()` - Malformed JWT returns None
- `test_webhook_valid_signature()` - Valid Svix signature accepted
- `test_webhook_invalid_signature()` - Invalid signature rejected

**Integration Tests:**
- Create annotation with real Clerk token
- Verify annotation has correct user_id
- Verify user isolation (user A can't see user B's annotations)

**Manual Testing:**
1. Log in to frontend with Clerk
2. Create annotation (Pass)
3. Check MongoDB - verify user_id is Clerk ID (not "demo-user")
4. Log in as different user
5. Verify previous annotation not visible

### Acceptance Criteria

- [ ] **AC1:** JWT tokens are verified using Clerk's JWKS public keys
- [ ] **AC2:** Invalid/expired tokens return 401 Unauthorized
- [ ] **AC3:** Webhook signatures are verified using Svix
- [ ] **AC4:** Invalid webhook signatures return 401
- [ ] **AC5:** All 8 endpoints use real user_id from JWT (not "demo-user")
- [ ] **AC6:** Annotations created by User A are not visible to User B
- [ ] **AC7:** User stats (`/api/annotations/user/stats`) are per-user
- [ ] **AC8:** Clerk webhook syncs user data to MongoDB

---

## Developer Resources

### File Paths Reference

| File | Purpose |
|------|---------|
| `/backend/requirements.txt` | Add svix, PyJWT |
| `/backend/app/core/config.py` | Add clerk_jwks_url |
| `/backend/app/api/auth.py` | Main auth implementation |
| `/backend/app/api/annotations.py` | Replace demo-user (3 places) |
| `/backend/app/api/traces.py` | Replace demo-user (5 places) |
| `/docs/architecture/security-model.md` | Reference implementation |

### Key Code Locations

| Function | File | Line |
|----------|------|------|
| `verify_clerk_token` | auth.py | 98 |
| `verify_webhook_signature` | auth.py | 126 |
| `clerk_webhook` | auth.py | 18 |
| `create_or_update_annotation` | annotations.py | 17 |
| `get_annotation_for_trace` | annotations.py | 82 |
| `get_user_annotation_stats` | annotations.py | 109 |
| `get_traces` | traces.py | 34 |

### Testing Locations

| Test Type | Location |
|-----------|----------|
| Unit tests | `backend/tests/api/test_auth.py` (create) |
| Integration | `backend/tests/api/test_annotations.py` |
| E2E | Manual via frontend |

### Documentation to Update

| Document | Update |
|----------|--------|
| `backend/API.md` | Remove demo-user references |
| `docs/architecture/security-model.md` | Mark issues as resolved |
| `docs/sprint-status.yaml` | Mark AUTH blockers resolved |

---

## UX/UI Considerations

**No UI changes required.** This is a backend-only security fix.

Frontend already:
- Injects Clerk tokens via axios interceptor
- Handles 401 responses (redirects to login)
- Displays user info from Clerk

---

## Testing Approach

### Test Framework

- **Framework:** pytest 7.4.3 + pytest-asyncio 0.21.1
- **Location:** `backend/tests/`
- **Run:** `pytest -v`

### Test Cases

```python
# tests/api/test_auth.py

import pytest
from unittest.mock import patch, MagicMock
from app.api.auth import verify_clerk_token, get_current_user

@pytest.mark.asyncio
async def test_verify_clerk_token_valid():
    """Valid JWT should return user data"""
    # Mock PyJWKClient and jwt.decode
    with patch('app.api.auth.get_jwks_client') as mock_jwks:
        mock_key = MagicMock()
        mock_jwks.return_value.get_signing_key_from_jwt.return_value = mock_key

        with patch('jwt.decode') as mock_decode:
            mock_decode.return_value = {"sub": "user_123", "email": "test@example.com"}

            result = await verify_clerk_token("valid.jwt.token")

            assert result["user_id"] == "user_123"
            assert result["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_verify_clerk_token_expired():
    """Expired JWT should return None"""
    with patch('app.api.auth.get_jwks_client'):
        with patch('jwt.decode') as mock_decode:
            import jwt
            mock_decode.side_effect = jwt.ExpiredSignatureError()

            result = await verify_clerk_token("expired.jwt.token")

            assert result is None
```

---

## Deployment Strategy

### Deployment Steps

1. **Merge to feature branch** (already on `feature/full-auth-completion`)
2. **Test locally** with real Clerk tokens
3. **Push to GitHub** - triggers Railway deployment
4. **Add environment variables** in Railway dashboard:
   - `CLERK_JWKS_URL`
   - `CLERK_WEBHOOK_SECRET` (after webhook setup)
5. **Verify Railway deployment** - check health endpoint
6. **Set up Clerk webhook** in Clerk dashboard
7. **Test webhook** - create user, check MongoDB

### Rollback Plan

1. **If auth broken:** Revert to previous commit
   ```bash
   git revert HEAD
   git push
   ```
2. **If partial failure:** Can temporarily re-add demo-user as fallback
3. **Railway auto-rollback:** Previous deployment available in Railway dashboard

### Monitoring

| Metric | How to Check |
|--------|--------------|
| Auth failures | Railway logs: `401` responses |
| Webhook failures | Railway logs: "Webhook verification failed" |
| User sync | MongoDB: Check `users` collection |
| Annotations | MongoDB: Check `user_id` values (should be Clerk IDs) |

---

## Related Documents

- [Security Model](./architecture/security-model.md) - Primary reference
- [Architecture Overview](./architecture/architecture-overview.md)
- [Database Design](./architecture/database-design.md)
- [Sprint Status](./sprint-status.yaml)
