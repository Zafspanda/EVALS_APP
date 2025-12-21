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

## Instructions for Next Session

To continue from where we left off, the next task is completing the Railway deployment:

1. User needs to run `railway up` interactively in the backend folder
2. Configure environment variables in Railway dashboard
3. Deploy frontend service
4. Set up Clerk webhook after backend is live
