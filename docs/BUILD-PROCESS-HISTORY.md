# Build Process History

This document tracks the development progress across chat sessions. Each session summary helps the next Claude instance understand where to pick up.

---

## Session 1 - 2025-12-22

### Completed Tasks

#### 1. SDS Vercel Conversion (COMPLETE)
- **Problem**: The app used `@sendle/sds-ui` via npm link which doesn't work in Vercel's build environment
- **Solution**: Copied SDS components locally to `frontend/src/sds/`
- **Changes**:
  - Created `frontend/src/sds/` with components, icons, scss, and tokens
  - Updated all TypeScript imports from `@sendle/sds-ui` to relative `./sds` paths
  - Updated all SCSS imports from `@sendle/sds-ui/scss/tokens` to relative paths
  - Removed `@sendle/sds-ui` from package.json
  - Added `prop-types` and `classnames` as direct dependencies
- **Commits**:
  - `75c9892` - feat: Replace npm-linked SDS with local components for Vercel deployment
  - `9dd313a` - feat: Add API Docs dropdown with Swagger UI and ReDoc links
- **Branch**: `feature/sds-vercel-conversion` merged to `main`

#### 2. API Docs Navigation (COMPLETE)
- Added dropdown in header navigation with links to:
  - Swagger UI (`/docs`)
  - ReDoc (`/redoc`)
- Fixed nav item spacing (removed redundant margin-right, using gap only)

#### 3. CLAUDE.md Updates (COMPLETE)
- Updated Tech Stack to reference local SDS components
- Updated Design System section with local import examples
- Added API Documentation section with Swagger/ReDoc links
- Added Vercel deployment info

### In Progress

#### 4. Railway Deployment Setup (IN PROGRESS)
- **Status**: Project created, services partially configured
- **Railway Project**: https://railway.com/project/f16731a0-d2f1-4e1e-81bc-053c29647850
- **Railway CLI**: Installed and logged in as Andrew Zaf (me@andrewzaf.com)

**What's been done:**
- Railway project "evals-app" created
- User added MongoDB and Redis via Railway dashboard

**What still needs to be done:**
1. Deploy backend service:
   - Run `cd backend && railway up` in terminal (needs interactive input)
   - Select/create service named "backend"
   - Set environment variables:
     - `MONGODB_URL` → Reference MongoDB's `MONGO_URL`
     - `MONGODB_DB_NAME` → `eval_platform`
     - `REDIS_URL` → Reference Redis's `REDIS_URL`
     - `CLERK_BACKEND_API_KEY` → From Clerk dashboard
     - `CLERK_WEBHOOK_SECRET` → Skip for now, add after deploy

2. Deploy frontend service:
   - Add via Railway dashboard: "+ New" → "GitHub Repo" → `Zafspanda/EVALS_APP` → root: `frontend`
   - Set environment variables:
     - `VITE_API_BASE_URL` → Backend's public URL (after backend deploys)
     - `VITE_CLERK_PUBLISHABLE_KEY` → From Clerk dashboard

3. After both deploy:
   - Get backend public URL from Railway
   - Create Clerk webhook pointing to `https://<backend-url>/api/auth/webhook`
   - Add `CLERK_WEBHOOK_SECRET` to backend service

### Files Modified This Session
- `frontend/package.json` - Removed @sendle/sds-ui, added prop-types/classnames
- `frontend/src/sds/**` - New local SDS components (80 files)
- `frontend/src/components/AppHeader/AppHeader.tsx` - Added API Docs dropdown
- `frontend/src/components/AppHeader/AppHeader.scss` - Dropdown styles, spacing fixes
- Multiple component files - Updated imports to local SDS
- `CLAUDE.md` - Updated for local SDS and API docs

### Current Branch
`main` (feature branch merged)

### Local Dev Environment
- Backend runs on: `http://localhost:8000`
- Frontend runs on: `http://localhost:5175`
- MongoDB: Docker container `eval_mongodb` on port 27017
- Redis: Docker container `eval_redis` on port 6379

---

## Session 2 - 2025-12-22 (Continuation)

### Completed Tasks

#### 1. Backend Deployment Configuration (COMPLETE)
- **Problem**: Railway couldn't detect how to build the app from repo root
- **Solution**: Added deployment configuration files and set root directory
- **Changes**:
  - Created `backend/Procfile` with uvicorn start command
  - Created `backend/railway.toml` with healthcheck and restart policies
  - Updated `backend/app/core/config.py` - CORS origins now read from `BACKEND_CORS_ORIGINS` env var
  - Updated `backend/app/main.py` - Uses `settings.cors_origins` instead of hardcoded list
  - Added `frontend/dist-react/` to `.gitignore`
- **Commit**: `563ba41` - feat: Add Railway deployment configuration for backend

#### 2. EVALS_APP Backend Service (COMPLETE)
- **Service**: GitHub-connected service named `EVALS_APP`
- **Root Directory**: Set to `backend` in Railway settings
- **Status**: ✅ Online and healthy
- **Public URL**: https://evalsapp-production.up.railway.app
- **Health Check**: `/health` endpoint returns `{"status":"healthy"}`

**Environment Variables Configured:**
- `MONGODB_URL` → `${{MongoDB.MONGO_URL}}` (references Railway MongoDB service)
- `MONGODB_DB_NAME` → `eval_platform`
- `REDIS_URL` → `${{Redis.REDIS_URL}}` (references Railway Redis service)
- `CLERK_BACKEND_API_KEY` → User's Clerk secret key
- `VITE_CLERK_PUBLISHABLE_KEY` → User's Clerk publishable key

**Key Issue Fixed**: Original variable was `MONGO_URL` but app expected `MONGODB_URL`

#### 3. CLI Backend Service Deleted
- Initially deployed a CLI-based "backend" service
- Deleted in favor of GitHub-connected EVALS_APP service for auto-deployments

#### 4. Frontend Service Created (PARTIAL)
- **Service**: GitHub-connected service named `frontend`
- **Repo**: `Zafspanda/EVALS_APP`
- **Environment Variables Set**:
  - `VITE_API_BASE_URL` → `https://evalsapp-production.up.railway.app`
  - `VITE_CLERK_PUBLISHABLE_KEY` → User's Clerk publishable key

### In Progress

#### 5. Frontend Deployment (NEEDS USER ACTION)
- **Status**: Service created, variables set
- **Pending**: User needs to set root directory to `frontend` in Railway dashboard
  1. Go to frontend service → Settings
  2. Click "Add Root Directory"
  3. Enter `frontend`
  4. Save to trigger deployment

#### 6. Backend CORS Update (PENDING)
- Once frontend has a public URL, add it to backend's `BACKEND_CORS_ORIGINS`

#### 7. Clerk Webhook Setup (PENDING)
- Create webhook in Clerk dashboard pointing to: `https://evalsapp-production.up.railway.app/api/auth/webhook`
- Add `CLERK_WEBHOOK_SECRET` to EVALS_APP service

### Railway Project Status

| Service | Type | Status | URL |
|---------|------|--------|-----|
| MongoDB | Database | ✅ Online | Internal: `mongodb.railway.internal:27017` |
| Redis | Database | ✅ Online | Internal: `redis.railway.internal:6379` |
| EVALS_APP (backend) | GitHub | ✅ Online | https://evalsapp-production.up.railway.app |
| frontend | GitHub | ⏳ Needs root dir | (pending) |

### Files Modified This Session
- `backend/Procfile` - NEW: Railway web process definition
- `backend/railway.toml` - NEW: Railway deployment config
- `backend/app/core/config.py` - CORS origins from environment
- `backend/app/main.py` - Dynamic CORS configuration
- `.gitignore` - Added frontend build output directory

---

## Session 3 - 2025-12-22

### Completed Tasks

#### 1. Build History Automation (COMPLETE)
- **Problem**: User couldn't find pre-compact hook and slash command for updating build history
- **Root Cause**: Skill was in `.claude/skills/` but not properly formatted; hook was missing `matcher` field
- **Solution**: Created both global slash command and skill for flexibility

**Changes Made:**

1. **Global Slash Command** (`~/.claude/commands/update-build-history.md`)
   - Explicit invocation via `/update-build-history`
   - Available across all projects

2. **Global Skill** (`~/.claude/skills/update-build-history/SKILL.md`)
   - Natural language triggers: "save session progress", "update build history", "document what we did"
   - Uses YAML frontmatter format with proper `name` and `description` fields

3. **Fixed PreCompact Hook** (both global and project-level)
   - Added missing `matcher: ""` field to trigger on both manual and auto-compact
   - Global: `~/dotfiles/settings.json`
   - Project: `.claude/settings.json`

4. **Cleanup**
   - Removed non-working project skill file (`.claude/skills/update-build-history.md`)

### Files Modified This Session
- `~/.claude/commands/update-build-history.md` - NEW: Global slash command
- `~/.claude/skills/update-build-history/SKILL.md` - NEW: Global skill with YAML frontmatter
- `~/dotfiles/settings.json` - Added PreCompact hook
- `.claude/settings.json` - Fixed PreCompact hook format

### Notes
- Skills require `SKILL.md` file inside a named directory (not just a `.md` file)
- Skills use YAML frontmatter with `name` and `description` fields
- Slash commands are simpler `.md` files in the `commands/` directory
- PreCompact hook supports matchers: `manual`, `auto`, or empty for both

---

## Session 4 - 2025-12-22

### Completed Tasks

#### 1. Frontend Build Output Fix (COMPLETE)
- **Problem**: Railway build failed with error: `"/app/dist": not found`
- **Root Cause**: Vite config (`vite.config.react.ts`) was outputting to `dist-react` (legacy from Vue migration) but Railway expected `dist`
- **Solution**: Changed `outDir` from `dist-react` to `dist`
- **Commit**: `692508a` - fix: Change build output to dist for Railway deployment

#### 2. Documentation Cleanup (COMPLETE)
- Removed obsolete `frontend/dist-react/` from `.gitignore` (already had `frontend/dist/`)

#### 3. Frontend Deployment (COMPLETE)
- Frontend deployed and accessible at: `https://frontend-production-52ba.up.railway.app`
- Backend service renamed from `EVALS_APP` to `backend` for consistency

#### 4. Backend CORS Configuration (COMPLETE)
- Added `BACKEND_CORS_ORIGINS` environment variable in Railway
- Value: `http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,https://frontend-production-52ba.up.railway.app`

#### 5. FastAPI Routing Fixes (COMPLETE)
- **Problem 1**: 307 Temporary Redirect on `/api/traces` breaking CORS preflight
- **Solution**: Added `redirect_slashes=False` to FastAPI app config
- **Commit**: `96f9296` - fix: Disable redirect_slashes to prevent 307 redirects breaking CORS

- **Problem 2**: After disabling redirects, routes returned 404 (routes defined as `"/"` only matched with trailing slash)
- **Solution**: Changed route definitions from `"/"` to `""` in traces.py and annotations.py
- **Commit**: `cb8322a` - fix: Update route paths to match without trailing slash

#### 6. Test Data (COMPLETE)
- Created sample CSV at `test-data/sample-traces.csv` for testing imports

### Railway Project Status

| Service | Type | Status | URL |
|---------|------|--------|-----|
| MongoDB | Database | ✅ Online | Internal: `mongodb.railway.internal:27017` |
| Redis | Database | ✅ Online | Internal: `redis.railway.internal:6379` |
| backend | GitHub | ✅ Online | https://evalsapp-production.up.railway.app |
| frontend | GitHub | ✅ Online | https://frontend-production-52ba.up.railway.app |

### Files Modified This Session
- `frontend/vite.config.react.ts` - Changed build output to `dist`
- `.gitignore` - Removed obsolete `dist-react` entry
- `backend/app/main.py` - Added `redirect_slashes=False`
- `backend/app/api/traces.py` - Changed route from `"/"` to `""`
- `backend/app/api/annotations.py` - Changed route from `"/"` to `""`
- `test-data/sample-traces.csv` - NEW: Sample test data
- `docs/BUILD-PROCESS-HISTORY.md` - This update

### In Progress

#### 7. CSV Import Testing (AWAITING BACKEND REDEPLOY)
- Backend needs to redeploy with routing fixes
- Then test CSV import with user's actual trace data

---

## Session 5 - 2025-12-22

### Completed Tasks

#### 1. Full Frontend Testing (COMPLETE)
- **Browser automation testing** of production deployment using Claude in Chrome
- All core features verified working:

| Feature | Status |
|---------|--------|
| Traces list view | ✅ 100 traces loaded, pagination working |
| Trace detail view | ✅ Shows conversation context (all turns) |
| Pass annotation | ✅ Saves and navigates to next |
| Skip functionality | ✅ Navigates without saving |
| Mark as Fail | ✅ Opens form with required fields (Open Codes, First Failure Note, Comments) |
| Navigation (Prev/Next) | ✅ Working correctly |
| Annotation counter | ✅ Updates in header |
| Status indicators | ✅ Green checkmark for Pass, Red X for Fail |

#### 2. Annotation Migration from Local Dev (COMPLETE)
- **Problem**: 27 annotations existed in local MongoDB that needed to be in production
- **Solution**: Created temporary migration API endpoint, deployed to Railway, called it to import

**Migration Process:**
1. Exported annotations from local MongoDB (`docker exec eval_mongodb mongosh...`)
2. Created `backend/app/api/migration.py` with `/api/migration/import-local` endpoint
3. Added router to `main.py`, deployed to Railway
4. Called endpoint via `curl -X POST https://evalsapp-production.up.railway.app/api/migration/import-local`
5. Removed migration endpoint after successful import

**Migration Results:**
- 17 new annotations imported
- 1 annotation updated (test annotation corrected)
- 0 skipped (all traces existed in production)
- **18 total annotations** now in production

**Annotation Types Imported:**
- 5 Fail annotations with detailed failure notes:
  - "Bot was not aware of time" (time awareness failure)
  - "Brand Identity Misalignment / Third-Party Voice Error" (persona_voice_failure)
  - "The bot acknowledged the request to cancel as noted" (hallucination)
  - "Mentioning that the search results don't mention a specific way" (tool disclosure)
- 13 Pass annotations

#### 3. Migration Endpoint Cleanup (COMPLETE)
- Removed `backend/app/api/migration.py`
- Removed `backend/migrate_annotations.py`
- Removed router registration from `main.py`
- **Commit**: `46786a9` - chore: Remove migration endpoint after successful data import

### Commits This Session
- `abcfd38` - feat: Add migration endpoint for importing local annotations
- `cbfa75a` - fix: Remove await from sync get_database() call in migration
- `46786a9` - chore: Remove migration endpoint after successful data import

### Railway Project Status

| Service | Type | Status | URL |
|---------|------|--------|-----|
| MongoDB | Database | ✅ Online | Internal: `mongodb.railway.internal:27017` |
| Redis | Database | ✅ Online | Internal: `redis.railway.internal:6379` |
| backend | GitHub | ✅ Online | https://evalsapp-production.up.railway.app |
| frontend | GitHub | ✅ Online | https://frontend-production-52ba.up.railway.app |

### Production Data Status
- **Traces**: 100 (from CSV import)
- **Annotations**: 18 (migrated from local dev)

### Files Modified This Session
- `backend/app/api/migration.py` - Created then removed (temporary migration)
- `backend/migrate_annotations.py` - Created then removed (standalone script)
- `backend/app/main.py` - Temporarily added migration router, then removed
- `test-data/local-annotations-export.json` - NEW: Exported annotations backup
- `docs/BUILD-PROCESS-HISTORY.md` - This update

---

## Instructions for Next Session

The application is fully deployed and operational:

**Production URLs:**
- Frontend: https://frontend-production-52ba.up.railway.app
- Backend API: https://evalsapp-production.up.railway.app
- API Docs: https://evalsapp-production.up.railway.app/docs

**Optional remaining tasks:**

1. **Clerk webhook** (if user sync needed):
   - Create webhook in Clerk dashboard: `https://evalsapp-production.up.railway.app/api/auth/webhook`
   - Add `CLERK_WEBHOOK_SECRET` to backend service variables

2. **Production Clerk keys** (currently using dev keys):
   - Console shows warning about development keys
   - Update to production keys when ready for wider use

3. **Continue annotating**:
   - 82 traces remaining unannotated (100 total - 18 done)
   - Use the annotation workflow to evaluate remaining traces
