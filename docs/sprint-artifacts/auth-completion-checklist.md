# AUTH Story Completion Checklist

**Story:** AUTH.1 - Implement Full Clerk Authentication
**Branch:** `feature/full-auth-completion`
**Last Updated:** 2025-12-23

---

## Code Implementation Status

| Task | Status | Notes |
|------|--------|-------|
| Add PyJWT + svix dependencies | ✅ Done | `backend/requirements.txt` |
| Add clerk_jwks_url config | ✅ Done | `backend/app/core/config.py` |
| Implement JWT verification (AUTH-001) | ✅ Done | Uses PyJWT + JWKS |
| Implement webhook verification (AUTH-002) | ✅ Done | Uses Svix |
| Create get_current_user dependency (AUTH-003) | ✅ Done | `backend/app/api/auth.py` |
| Replace demo-user in annotations.py | ✅ Done | 3 occurrences |
| Replace demo-user in traces.py | ✅ Done | 5 occurrences |
| Local testing | ✅ Done | 401 returned for unauthenticated requests |
| Git commit + push | ✅ Done | Commit `839fd68` |

---

## Manual Steps Required

### Step 1: Deploy to Railway

**Option A: Merge to main (recommended)**
```bash
cd /path/to/Evals_app
git checkout main
git merge feature/full-auth-completion
git push origin main
```

**Option B: Deploy feature branch directly**
- Go to Railway Dashboard
- Select backend service
- Change deployment branch to `feature/full-auth-completion`

---

### Step 2: Add Environment Variables in Railway

Go to **Railway Dashboard → Backend Service → Variables** and add:

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `CLERK_JWKS_URL` | `https://YOUR-CLERK-DOMAIN.clerk.accounts.dev/.well-known/jwks.json` | Clerk Dashboard → API Keys → Show API URLs |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | Created in Step 3 |

**To find your Clerk JWKS URL:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys**
4. Click **Show API URLs**
5. Copy the **JWKS URL** (ends with `/.well-known/jwks.json`)

---

### Step 3: Set Up Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
2. Click **Add Endpoint**
3. Configure:
   - **Endpoint URL:** `https://evalsapp-production.up.railway.app/api/auth/webhook`
   - **Events:** Select these:
     - `user.created`
     - `user.updated`
     - `user.deleted`
4. Click **Create**
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add this secret as `CLERK_WEBHOOK_SECRET` in Railway (Step 2)

---

### Step 4: Production Testing

After Railway redeploys with the new environment variables:

1. **Test Authentication:**
   - Go to https://frontend-production-52ba.up.railway.app
   - Log in with Clerk
   - Navigate to a trace and create an annotation (Pass or Fail)

2. **Verify User ID:**
   - Connect to MongoDB
   - Check the `annotations` collection
   - Verify `user_id` is your Clerk ID (format: `user_xxxxx`), NOT "demo-user"

3. **Test Webhook (Optional):**
   - Create a new user in Clerk Dashboard
   - Check MongoDB `users` collection for the new user record

4. **Test User Isolation (Optional):**
   - Log in as a different Clerk user
   - Create an annotation for the same trace
   - Verify each user sees only their own annotation

---

## Verification Checklist

- [ ] Railway deployment successful (backend starts without errors)
- [ ] `CLERK_JWKS_URL` set in Railway
- [ ] `CLERK_WEBHOOK_SECRET` set in Railway
- [ ] Clerk webhook created and pointing to production backend
- [ ] Can log in to frontend
- [ ] Can create annotations
- [ ] Annotations have real Clerk user_id (not "demo-user")
- [ ] Webhook test successful (optional)

---

## Troubleshooting

**401 "CLERK_JWKS_URL not configured"**
- The JWKS URL environment variable is missing in Railway
- Add it and redeploy

**401 "Invalid or expired token"**
- Token might be expired - refresh the page to get a new token
- Check that the JWKS URL matches your Clerk application

**401 "Invalid webhook signature"**
- Webhook secret doesn't match - verify it's copied correctly
- Make sure you're using the secret from the correct webhook endpoint

**500 "Webhook not configured"**
- `CLERK_WEBHOOK_SECRET` is missing in Railway
- Add it after creating the webhook in Clerk Dashboard

---

## Once Complete

After all verification passes:

1. Update `docs/sprint-status.yaml`:
   - Change `story-auth-completion-1` status to `done`
   - Update AUTH-001, AUTH-002, AUTH-003 blocker statuses to `resolved`
   - Change `story-coding-platform-2` status to `ready-for-dev`

2. Mark the story as done:
   - Run `/bmad:bmm:workflows:story-done`
   - Or manually update `docs/sprint-artifacts/story-auth-completion-1.md` status to `Done`
