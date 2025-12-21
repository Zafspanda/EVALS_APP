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
- `.gitignore` - Added frontend/dist-react/

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

## Instructions for Next Session

To continue from where we left off:

1. **Frontend deployment**:
   - User sets root directory to `frontend` in Railway dashboard
   - Generate public domain for frontend
   - Add frontend URL to backend's `BACKEND_CORS_ORIGINS`

2. **Clerk webhook**:
   - Create webhook in Clerk: `https://evalsapp-production.up.railway.app/api/auth/webhook`
   - Add `CLERK_WEBHOOK_SECRET` to EVALS_APP service variables

3. **Test full application**:
   - Verify frontend can connect to backend
   - Test authentication flow
   - Test trace import and annotation features
