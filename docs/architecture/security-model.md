# Security Model

**Project:** Evals Open Coding Platform
**Last Updated:** 2025-11-17
**Status:** ⚠️ **AUTH IMPLEMENTATION INCOMPLETE** - See Critical Issues

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [Data Isolation](#data-isolation)
5. [Input Validation](#input-validation)
6. [Security Issues & Remediation](#security-issues--remediation)
7. [Security Checklist](#security-checklist)

---

## Security Overview

### Security Principles

1. **Defense in Depth:** Multiple layers of security (auth, validation, data isolation)
2. **Least Privilege:** Users access only their own annotations
3. **Secure by Default:** All endpoints require authentication
4. **Input Validation:** Pydantic models validate all request payloads
5. **Audit Trail:** All changes tracked with timestamps and user IDs

### Threat Model

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|-----------|------------|
| **Unauthorized access to annotations** | HIGH | HIGH | Clerk JWT verification + user_id filtering |
| **Data injection via CSV import** | MEDIUM | LOW | Pydantic validation, pandas type coercion |
| **Webhook spoofing (user manipulation)** | HIGH | MEDIUM | Svix signature verification |
| **Cross-user data leakage** | HIGH | LOW | User-scoped queries enforced at DB layer |
| **Token replay attacks** | MEDIUM | LOW | JWT expiry (Clerk handles) |
| **SQL/NoSQL injection** | LOW | LOW | Motor driver parameterization |

---

## Authentication

### Architecture

```
┌─────────────┐
│  Frontend   │
│  (React 18) │
└──────┬──────┘
       │ 1. User logs in via Clerk UI
       ▼
┌─────────────────┐
│  Clerk (SaaS)   │  JWT issued, signed with Clerk private key
└──────┬──────────┘
       │ 2. JWT token returned to frontend
       ▼
┌─────────────┐
│  Frontend   │  Stores token in Clerk session
└──────┬──────┘
       │ 3. API request with Bearer token
       ▼
┌─────────────────────────────────────────┐
│  FastAPI Backend                        │
│  - Axios interceptor injects token      │
│  - Authorization: Bearer <jwt>          │
└──────┬──────────────────────────────────┘
       │ 4. Token verification
       ▼
┌─────────────────────────────────────────┐
│  get_current_user() dependency          │
│  - Extract token from Authorization     │
│  - Verify JWT signature (Clerk public key)│
│  - Return user_id (Clerk ID)            │
└──────┬──────────────────────────────────┘
       │ 5. User-scoped query
       ▼
┌─────────────────────────────────────────┐
│  MongoDB Query                          │
│  - {"user_id": current_user["user_id"]} │
└─────────────────────────────────────────┘
```

### Clerk Integration

**Frontend: Token Injection**

Location: `frontend/src/services/api.ts:15`

```typescript
api.interceptors.request.use(async (config) => {
  const clerk = (window as any).Clerk
  if (clerk?.session) {
    const token = await clerk.session.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
```

**Backend: Token Verification (CURRENT - BROKEN)**

Location: `backend/app/api/auth.py:98`

```python
async def verify_clerk_token(token: str) -> Dict[str, Any]:
    # ⚠️ CRITICAL: This implementation is INCORRECT
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.clerk.com/v1/sessions/{token}/verify",  # ❌ Wrong endpoint
            headers={"Authorization": f"Bearer {settings.clerk_backend_api_key}"}
        )
        if response.status_code == 200:
            return response.json()
        else:
            return None
```

**Issues:**
1. Endpoint doesn't exist in Clerk API
2. Treats session token as session ID (incorrect)
3. No JWT signature verification

**Backend: Token Verification (CORRECT IMPLEMENTATION)**

```python
from clerk_backend_api import Clerk

clerk = Clerk(bearer_auth=settings.clerk_backend_api_key)

async def verify_clerk_token(token: str) -> Dict[str, Any]:
    """Verify Clerk JWT token and return claims"""
    try:
        # Clerk SDK handles JWT verification with public keys
        session = clerk.sessions.verify_token(token)
        return {
            "user_id": session.user_id,
            "session_id": session.id,
            "email": session.email  # If available
        }
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None
```

**Alternative (Manual JWT Verification):**

```python
import jwt
from jwt import PyJWKClient

# Clerk publishes public keys at this URL
CLERK_JWKS_URL = f"https://{settings.clerk_frontend_api_url}/.well-known/jwks.json"

async def verify_clerk_token(token: str) -> Dict[str, Any]:
    try:
        jwks_client = PyJWKClient(CLERK_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.clerk_frontend_api_url
        )
        return {
            "user_id": claims.get("sub"),
            "email": claims.get("email")
        }
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid JWT: {e}")
        return None
```

### Dependency Injection Pattern

**get_current_user Dependency**

Location: `backend/app/api/auth.py` (to be implemented)

```python
async def get_current_user(request: Request) -> Dict[str, str]:
    """Extract and verify user from JWT token"""
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")

    token = auth_header.split(" ")[1]
    user_data = await verify_clerk_token(token)

    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {
        "user_id": user_data["user_id"],
        "email": user_data.get("email")
    }
```

**Usage in Endpoints:**

```python
@router.post("/")
async def create_annotation(
    annotation: AnnotationCreate,
    current_user: Dict = Depends(get_current_user)  # ✅ Verified user injected
):
    annotation_data = annotation.dict()
    annotation_data["user_id"] = current_user["user_id"]  # Enforce user isolation
    # ...
```

### Webhook Security

**Clerk Webhook Handler**

Location: `backend/app/api/auth.py:19`

**Purpose:** Sync user creation/updates from Clerk to MongoDB

**Current Implementation (INSECURE):**

```python
@router.post("/webhook")
async def clerk_webhook(request: Request):
    payload = await request.body()
    headers = dict(request.headers)

    # ⚠️ CRITICAL: Signature verification is DISABLED
    if settings.clerk_webhook_secret:
        signature = headers.get("svix-signature")
        if not verify_webhook_signature(payload, signature, settings.clerk_webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # ...

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    # ❌ PLACEHOLDER - Always returns True
    return True  # This is a security vulnerability
```

**Correct Implementation:**

```python
from svix.webhooks import Webhook

@router.post("/webhook")
async def clerk_webhook(request: Request):
    payload = await request.body()
    headers = dict(request.headers)

    # ✅ Verify Svix signature
    wh = Webhook(settings.clerk_webhook_secret)
    try:
        event = wh.verify(payload, headers)
    except Exception as e:
        logger.error(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # Process verified event
    event_type = event["type"]
    event_data = event["data"]

    if event_type == "user.created" or event_type == "user.updated":
        await sync_user(event_data)
    elif event_type == "user.deleted":
        await delete_user(event_data["id"])

    return {"status": "success"}
```

**Installation:**

```bash
pip install svix
```

---

## Authorization

### User-Scoped Queries

**Principle:** Every annotation query MUST filter by `user_id`.

**Example: Get Annotation for Trace**

Location: `backend/app/api/annotations.py:83`

```python
@router.get("/trace/{trace_id}")
async def get_annotation_for_trace(
    trace_id: str,
    current_user: Dict = Depends(get_current_user)  # ✅ Verified user
):
    annotation = await db.annotations.find_one({
        "trace_id": trace_id,
        "user_id": current_user["user_id"]  # ✅ User-scoped query
    })
    return annotation
```

**Without User Scoping (INSECURE):**

```python
# ❌ BAD: Returns ANY user's annotation for this trace
annotation = await db.annotations.find_one({"trace_id": trace_id})
```

### Role-Based Access Control (Phase 2)

**Future Enhancement:** Add roles to `users` collection

```python
{
  "clerk_id": "user_123",
  "email": "admin@example.com",
  "role": "admin"  # "admin" | "evaluator" | "viewer"
}
```

**Permissions:**

| Role | View Traces | Annotate | Import CSV | View All Annotations | Export |
|------|-------------|----------|------------|---------------------|--------|
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Evaluator | ✅ | ✅ (own) | ❌ | ❌ | ✅ (own) |
| Admin | ✅ | ✅ (all) | ✅ | ✅ | ✅ (all) |

---

## Data Isolation

### Multi-Tenant Architecture

**Isolation Level:** User-level (not organization-level)

**Implementation:**

1. **Annotations:** Always filter by `user_id`
   ```python
   {"user_id": current_user["user_id"]}
   ```

2. **Traces:** Shared across all users (no isolation)
   - All users evaluate the same set of traces
   - No `user_id` filter needed

3. **Stats:** User-specific calculations
   ```python
   total = await db.annotations.count_documents({"user_id": current_user["user_id"]})
   ```

### Data Leakage Prevention

**Compound Index Enforcement:**

MongoDB compound index on `(trace_id, user_id)` ensures:
- Queries automatically use user_id in index scan
- Performance penalty for queries missing user_id (forces correct usage)

**Code Review Checklist:**

- [ ] All annotation queries include `user_id` filter
- [ ] No direct `_id` lookups (use `trace_id + user_id` compound key)
- [ ] Stats calculations scoped to current user

---

## Input Validation

### Pydantic Request Validation

**Location:** `backend/app/schemas/annotation.py`

```python
class AnnotationCreate(BaseModel):
    trace_id: str = Field(..., min_length=1, max_length=100)
    holistic_pass_fail: Literal["Pass", "Fail"]
    first_failure_note: Optional[str] = Field(None, max_length=256)
    open_codes: Optional[str] = Field(None, max_length=500)
    comments_hypotheses: Optional[str] = Field(None, max_length=1000)
```

**Validation Rules:**

1. **Type Safety:** `holistic_pass_fail` must be exactly "Pass" or "Fail"
2. **Length Limits:** Prevents DoS via large payloads
3. **Required Fields:** `trace_id` and `holistic_pass_fail` mandatory
4. **SQL/NoSQL Injection Prevention:** Motor driver uses parameterized queries

### CSV Import Validation

**Location:** `backend/app/api/traces.py:34`

```python
@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...)):
    # 1. File extension validation
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    # 2. File size validation (10MB limit)
    contents = await file.read()
    if len(contents) > settings.max_upload_size:
        raise HTTPException(status_code=400, detail="File too large")

    # 3. CSV parsing with pandas (handles malformed CSV)
    try:
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

    # 4. Column validation
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_columns:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing_columns}")

    # 5. NaN handling (pandas NaN → None for JSON compatibility)
    trace_data = {k: (None if pd.isna(v) else v) for k, v in row.items()}
```

**Attack Mitigation:**

- **CSV Injection:** Pandas escapes formulas (no Excel execution risk)
- **Path Traversal:** File saved in-memory only (no disk write)
- **Zip Bombs:** File size limit enforced before decompression

---

## Security Issues & Remediation

### 🔴 Critical Issues (Fix Before Story 2)

#### Issue 1: Token Verification Bypassed

**Location:** `backend/app/api/auth.py:98`

**Vulnerability:**
```python
# Current implementation calls wrong endpoint
response = await client.get(f"https://api.clerk.com/v1/sessions/{token}/verify")
# This endpoint doesn't exist, so verification always fails
# But code continues anyway, creating security hole
```

**Impact:** Any malformed token accepted, unauthorized access possible

**Fix:**
```python
# Use Clerk SDK or manual JWT verification (see Authentication section)
from clerk_backend_api import Clerk
clerk = Clerk(bearer_auth=settings.clerk_backend_api_key)
session = clerk.sessions.verify_token(token)
```

**Effort:** 30 minutes
**Priority:** P0 - **BLOCK STORY 2 UNTIL FIXED**

---

#### Issue 2: Webhook Signature Verification Disabled

**Location:** `backend/app/api/auth.py:145`

**Vulnerability:**
```python
def verify_webhook_signature(payload, signature, secret) -> bool:
    return True  # ❌ Always returns True
```

**Impact:** Attacker can POST to `/api/auth/webhook` and create/delete users

**Attack Scenario:**
```bash
curl -X POST http://api.evals.app/api/auth/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "user.deleted", "data": {"id": "victim_user_123"}}'
# User deleted from database without authentication
```

**Fix:**
```python
from svix.webhooks import Webhook
wh = Webhook(settings.clerk_webhook_secret)
event = wh.verify(payload, headers)  # Raises exception if invalid
```

**Effort:** 30 minutes
**Priority:** P0 - **BLOCK PRODUCTION DEPLOYMENT**

---

#### Issue 3: Hardcoded Demo User

**Location:** All endpoints, e.g., `backend/app/api/annotations.py:20`

**Vulnerability:**
```python
current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})
```

**Impact:** All users share same `user_id`, annotations collide

**Fix:** Replace with actual `get_current_user` dependency

**Effort:** 1 hour (update 8 endpoints)
**Priority:** P0 - **BLOCK MULTI-USER TESTING**

---

### 🟡 High Priority Issues (Fix in Story 3)

#### Issue 4: No Rate Limiting

**Vulnerability:** CSV import endpoint can be spammed

**Impact:** DoS attack via repeated large CSV uploads

**Fix:** Add rate limiting middleware
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/traces/import-csv")
@limiter.limit("5/minute")  # Max 5 imports per minute per IP
async def import_csv(...):
    ...
```

**Effort:** 1 hour
**Priority:** P1

---

#### Issue 5: No HTTPS Enforcement

**Current:** Development uses HTTP, production should enforce HTTPS

**Fix:** Add middleware to redirect HTTP → HTTPS
```python
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
app.add_middleware(HTTPSRedirectMiddleware)
```

**Effort:** 15 minutes
**Priority:** P1 (production only)

---

### 🟢 Medium Priority Issues (Phase 2)

#### Issue 6: No CORS Origin Validation

**Current:** Hardcoded localhost origins
```python
allow_origins=["http://localhost:5173", "http://localhost:5174"]
```

**Fix:** Use environment variable for production domains
```python
allow_origins=settings.cors_origins.split(",")  # From .env
```

**Effort:** 10 minutes
**Priority:** P2

---

## Security Checklist

### Pre-Production Deployment

- [ ] **Auth:** Clerk JWT verification implemented correctly
- [ ] **Auth:** Webhook signature verification enabled
- [ ] **Auth:** All endpoints use `get_current_user` dependency (no demo-user)
- [ ] **Auth:** HTTPS enforced (HTTPSRedirectMiddleware)
- [ ] **Input:** Pydantic validation on all request bodies
- [ ] **Input:** File upload size limits enforced
- [ ] **Input:** Rate limiting on import endpoint
- [ ] **Data:** User-scoped queries enforced (no cross-user leakage)
- [ ] **Data:** Audit trail fields populated (`created_at`, `updated_at`, `version`)
- [ ] **CORS:** Production origins whitelisted
- [ ] **Secrets:** All secrets in environment variables (not hardcoded)
- [ ] **Secrets:** Clerk API keys rotated if exposed
- [ ] **Monitoring:** Error logging enabled (Sentry integration)
- [ ] **Monitoring:** Slow query log enabled (MongoDB Atlas)

### Post-Deployment

- [ ] Penetration testing (auth bypass attempts)
- [ ] CSV upload fuzzing (malformed files)
- [ ] Load testing (concurrent users, race conditions)
- [ ] Webhook replay attack testing

---

## Related Documents

- [Architecture Overview](./architecture-overview.md)
- [Database Design](./database-design.md) - Data isolation via indexes
- [ADR-002: Clerk for Authentication](./adr/002-authentication-provider.md)

---

**Last Review:** 2025-11-17 (Winston - Architect Agent)
**Next Review:** After auth fixes implemented
**Security Contact:** BMad Product Team
