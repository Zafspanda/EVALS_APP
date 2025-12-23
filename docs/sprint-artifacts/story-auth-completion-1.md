# Story AUTH.1: Implement Full Clerk Authentication

**Status:** Approved
**Epic:** AUTH - Full Auth Completion
**Branch:** `feature/full-auth-completion`
**Created:** 2025-12-22

---

## User Story

As a **platform administrator**,
I want **the authentication system to properly verify Clerk JWT tokens and isolate user data**,
So that **multiple evaluators can safely work on the same dataset with their annotations kept separate**.

---

## Acceptance Criteria

### AC1: JWT Token Verification
**Given** a user is logged in via Clerk and makes an API request
**When** the request includes a valid JWT token in the Authorization header
**Then** the token is verified using Clerk's JWKS public keys and the request proceeds

### AC2: Invalid Token Handling
**Given** a user makes an API request
**When** the JWT token is missing, invalid, or expired
**Then** the API returns 401 Unauthorized with an appropriate error message

### AC3: Webhook Signature Verification
**Given** Clerk sends a webhook event to `/api/auth/webhook`
**When** the request includes valid Svix signature headers
**Then** the webhook is processed and user data is synced to MongoDB

### AC4: Invalid Webhook Rejection
**Given** an attacker sends a POST request to `/api/auth/webhook`
**When** the Svix signature is invalid or missing
**Then** the request is rejected with 401 Unauthorized

### AC5: Real User IDs in Annotations
**Given** a user creates or retrieves an annotation
**When** the request is processed
**Then** the `user_id` is the user's Clerk ID (not "demo-user")

### AC6: User Data Isolation
**Given** User A creates an annotation for trace X
**When** User B requests their annotation for trace X
**Then** User B sees their own annotation (or none), not User A's

### AC7: Per-User Statistics
**Given** a user requests their annotation statistics
**When** the `/api/annotations/user/stats` endpoint is called
**Then** only that user's annotations are counted

### AC8: User Sync from Webhook
**Given** a new user is created in Clerk
**When** the `user.created` webhook event is received
**Then** the user is added to the MongoDB `users` collection

---

## Implementation Details

### Tasks / Subtasks

- [x] **Task 1: Add Dependencies** ✅
  - [x] Add `svix>=1.0.0` to requirements.txt
  - [x] Add `PyJWT>=2.8.0` to requirements.txt
  - [x] Run `pip install -r requirements.txt`

- [x] **Task 2: Update Configuration** ✅
  - [x] Add `clerk_jwks_url` to `app/core/config.py`
  - [x] Document required environment variables

- [x] **Task 3: Implement JWT Verification (AUTH-001)** ✅
  - [x] Create `get_jwks_client()` function with caching
  - [x] Rewrite `verify_clerk_token()` to use PyJWT + JWKS
  - [x] Handle expired/invalid token errors gracefully

- [x] **Task 4: Implement Webhook Verification (AUTH-002)** ✅
  - [x] Import `svix.webhooks.Webhook`
  - [x] Rewrite `clerk_webhook()` to use Svix verification
  - [x] Extract svix headers correctly
  - [x] Handle verification errors

- [x] **Task 5: Create Auth Dependency (AUTH-003)** ✅
  - [x] Create `get_current_user()` FastAPI dependency
  - [x] Rename existing `/me` route to `get_current_user_info`
  - [x] Export dependency for use in other modules

- [x] **Task 6: Update annotations.py** ✅
  - [x] Import `get_current_user` from auth
  - [x] Replace demo-user on line 20 (`create_or_update_annotation`)
  - [x] Replace demo-user on line 85 (`get_annotation_for_trace`)
  - [x] Replace demo-user on line 111 (`get_user_annotation_stats`)

- [x] **Task 7: Update traces.py** ✅
  - [x] Import `get_current_user` from auth
  - [x] Replace demo-user on line 37 (`import_csv`)
  - [x] Replace demo-user on line 142 (`list_traces`)
  - [x] Replace demo-user on line 186 (`get_trace`)
  - [x] Replace demo-user on line 232 (`get_adjacent_traces`)
  - [x] Replace demo-user on line 304 (`get_next_unannotated`)

- [x] **Task 8: Local Testing** ✅
  - [x] Test with invalid token (expect 401) - PASSED
  - [ ] Test with valid Clerk token - Requires CLERK_JWKS_URL
  - [ ] Verify annotation has Clerk user_id - Requires deployment

- [ ] **Task 9: Deploy to Railway** ⏳ MANUAL
  - [x] Push changes to GitHub (commit 839fd68)
  - [ ] Merge to main branch
  - [ ] Add `CLERK_JWKS_URL` to Railway environment
  - [ ] Verify deployment successful

- [ ] **Task 10: Set Up Clerk Webhook** ⏳ MANUAL
  - [ ] Create webhook in Clerk dashboard
  - [ ] Point to `https://evalsapp-production.up.railway.app/api/auth/webhook`
  - [ ] Select events: user.created, user.updated, user.deleted
  - [ ] Copy webhook secret
  - [ ] Add `CLERK_WEBHOOK_SECRET` to Railway environment

- [ ] **Task 11: Production Testing** ⏳ MANUAL
  - [ ] Test annotation creation with real user
  - [ ] Verify user isolation between accounts
  - [ ] Test webhook by creating a test user

### Technical Summary

This story fixes three critical authentication vulnerabilities:

1. **AUTH-001:** JWT token verification is broken (calls non-existent endpoint)
   - Fix: Use PyJWT with Clerk's JWKS public keys

2. **AUTH-002:** Webhook signature verification always returns True
   - Fix: Use Svix package for proper signature verification

3. **AUTH-003:** All endpoints hardcode "demo-user" as user_id
   - Fix: Create `get_current_user` dependency, use in 8 endpoints

### Project Structure Notes

- **Files to modify:**
  - `backend/requirements.txt` - Add svix, PyJWT
  - `backend/app/core/config.py` - Add clerk_jwks_url
  - `backend/app/api/auth.py` - Rewrite verify functions, add dependency
  - `backend/app/api/annotations.py` - Replace 3 demo-user occurrences
  - `backend/app/api/traces.py` - Replace 5 demo-user occurrences

- **Expected test locations:**
  - `backend/tests/api/test_auth.py` (create)

- **Estimated effort:** 3 story points (~2-3 hours)

- **Prerequisites:**
  - Clerk account with API keys configured
  - Railway deployment access
  - Local development environment set up

### Key Code References

| Reference | Location | Purpose |
|-----------|----------|---------|
| Security Model | `docs/architecture/security-model.md` | Full remediation guide with code examples |
| Current auth.py | `backend/app/api/auth.py` | Code to replace |
| JWT verification example | security-model.md:159-177 | Correct implementation |
| Svix verification example | security-model.md:248-274 | Correct implementation |
| Demo-user pattern | annotations.py:20 | Pattern to replace |

---

## Context References

**Tech-Spec:** [tech-spec-auth.md](../tech-spec-auth.md) - Primary context document containing:

- Brownfield codebase analysis
- Framework and library details with versions (FastAPI 0.115.0+, PyJWT 2.8.0+, svix 1.0.0+)
- Existing patterns to follow (logger.error, HTTPException, async def)
- Integration points (Clerk JWKS, Svix webhooks, MongoDB)
- Complete implementation guidance with code examples

**Architecture:**
- [Security Model](../architecture/security-model.md) - Detailed vulnerability analysis and fixes
- [Architecture Overview](../architecture/architecture-overview.md) - System context
- [Database Design](../architecture/database-design.md) - User and annotation schemas

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101) via Claude Code

### Session Date

2025-12-23

### Completion Notes

**Code implementation complete.** All 8 tasks involving code changes are done. Manual deployment tasks (9-11) require user action.

**What was done:**
- Added PyJWT and svix dependencies
- Implemented proper JWT verification using Clerk JWKS public keys (AUTH-001)
- Implemented Svix webhook signature verification (AUTH-002)
- Created `get_current_user` FastAPI dependency
- Replaced all 8 demo-user occurrences with real auth (AUTH-003)
- Local testing confirmed 401 responses for unauthenticated requests

**What's pending (manual steps):**
- Merge `feature/full-auth-completion` to main
- Add `CLERK_JWKS_URL` to Railway environment
- Create Clerk webhook in dashboard
- Add `CLERK_WEBHOOK_SECRET` to Railway environment
- Production verification

See: `docs/sprint-artifacts/auth-completion-checklist.md` for detailed instructions.

### Files Modified

| File | Changes |
|------|---------|
| `backend/requirements.txt` | Added PyJWT>=2.8.0, svix>=1.0.0 |
| `backend/app/core/config.py` | Added clerk_jwks_url setting |
| `backend/app/api/auth.py` | Complete rewrite: JWKS client, verify_clerk_token, get_current_user dependency, Svix webhook |
| `backend/app/api/annotations.py` | Replaced 3 demo-user with Depends(get_current_user) |
| `backend/app/api/traces.py` | Replaced 5 demo-user with Depends(get_current_user) |

### Test Results

**Local Testing:**
- ✅ All imports successful
- ✅ FastAPI app loads correctly
- ✅ `GET /api/traces` without auth → 401 "Missing or invalid authorization header"
- ✅ `GET /api/traces` with invalid token → 401 "Invalid or expired token"
- ✅ `GET /api/annotations/user/stats` without auth → 401

**Production Testing:** Pending deployment

### Git Reference

- **Branch:** `feature/full-auth-completion`
- **Commit:** `839fd68`
- **Message:** feat(auth): Implement full Clerk authentication (AUTH-001, AUTH-002, AUTH-003)

---

## Review Notes

<!-- Will be populated during code review -->
