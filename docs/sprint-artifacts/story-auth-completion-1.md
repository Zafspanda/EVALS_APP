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

- [ ] **Task 1: Add Dependencies**
  - [ ] Add `svix>=1.0.0` to requirements.txt
  - [ ] Add `PyJWT>=2.8.0` to requirements.txt
  - [ ] Run `pip install -r requirements.txt`

- [ ] **Task 2: Update Configuration**
  - [ ] Add `clerk_jwks_url` to `app/core/config.py`
  - [ ] Document required environment variables

- [ ] **Task 3: Implement JWT Verification (AUTH-001)**
  - [ ] Create `get_jwks_client()` function with caching
  - [ ] Rewrite `verify_clerk_token()` to use PyJWT + JWKS
  - [ ] Handle expired/invalid token errors gracefully

- [ ] **Task 4: Implement Webhook Verification (AUTH-002)**
  - [ ] Import `svix.webhooks.Webhook`
  - [ ] Rewrite `clerk_webhook()` to use Svix verification
  - [ ] Extract svix headers correctly
  - [ ] Handle verification errors

- [ ] **Task 5: Create Auth Dependency (AUTH-003)**
  - [ ] Create `get_current_user()` FastAPI dependency
  - [ ] Rename existing `/me` route to avoid conflict
  - [ ] Export dependency for use in other modules

- [ ] **Task 6: Update annotations.py**
  - [ ] Import `get_current_user` from auth
  - [ ] Replace demo-user on line 20 (`create_or_update_annotation`)
  - [ ] Replace demo-user on line 85 (`get_annotation_for_trace`)
  - [ ] Replace demo-user on line 111 (`get_user_annotation_stats`)

- [ ] **Task 7: Update traces.py**
  - [ ] Import `get_current_user` from auth
  - [ ] Replace demo-user on line 37 (`get_traces`)
  - [ ] Replace demo-user on line 142 (`get_trace`)
  - [ ] Replace demo-user on line 186 (`get_trace_with_context`)
  - [ ] Replace demo-user on line 232 (`get_adjacent_traces`)
  - [ ] Replace demo-user on line 304 (`get_next_unannotated`)

- [ ] **Task 8: Local Testing**
  - [ ] Test with valid Clerk token
  - [ ] Verify annotation has Clerk user_id
  - [ ] Test with invalid token (expect 401)

- [ ] **Task 9: Deploy to Railway**
  - [ ] Push changes to GitHub
  - [ ] Add `CLERK_JWKS_URL` to Railway environment
  - [ ] Verify deployment successful

- [ ] **Task 10: Set Up Clerk Webhook**
  - [ ] Create webhook in Clerk dashboard
  - [ ] Point to `https://evalsapp-production.up.railway.app/api/auth/webhook`
  - [ ] Select events: user.created, user.updated, user.deleted
  - [ ] Copy webhook secret
  - [ ] Add `CLERK_WEBHOOK_SECRET` to Railway environment

- [ ] **Task 11: Production Testing**
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

<!-- Will be populated during dev-story execution -->

### Debug Log References

<!-- Will be populated during dev-story execution -->

### Completion Notes

<!-- Will be populated during dev-story execution -->

### Files Modified

<!-- Will be populated during dev-story execution -->

### Test Results

<!-- Will be populated during dev-story execution -->

---

## Review Notes

<!-- Will be populated during code review -->
