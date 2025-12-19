# Handover: SDS Vercel Conversion

**Date:** 2025-12-19
**Branch:** `feature/sds-vercel-conversion`
**Status:** Ready to start

## Objective

Convert the Evals App to use local Sendle Design System (SDS) components instead of the npm-linked `@sendle/sds-ui` package. This enables deployment to Vercel, where `npm link` doesn't work.

## Current State

- **Branch created:** `feature/sds-vercel-conversion`
- **SDS currently installed via:** `npm link` (file reference in package.json)
- **Frontend runs locally:** http://localhost:5175
- **Backend runs locally:** http://localhost:8000
- **Auth:** Clerk (working)

## Reference Guide

Full step-by-step guide located at:
```
~/Documents/Documents - Mac Mini/GitHub/Sendle Brand Voice DNA Skill/SDS-VERCEL-SETUP-GUIDE.md
```

## Conversion Plan

### Phase 1: Local Development Setup
1. Verify current npm link setup works (`npm run dev`)
2. Identify which SDS components are currently used in the project
3. Understand current SCSS imports

### Phase 2: Create Local SDS Copy
1. Create directory structure:
   ```bash
   cd frontend
   mkdir -p src/sds/components src/sds/icons src/sds/scss
   ```

2. Install required dependencies:
   ```bash
   npm install prop-types classnames --save
   ```
   Note: `sass` is already installed (`sass-embedded`)

3. Copy SCSS files from linked SDS package:
   ```bash
   cp ../../Sendle/SDS/sendle-design-system-main/packages/sds-ui/scss/*.scss src/sds/scss/
   ```

4. Create local component files (see guide for full code):
   - `src/sds/components/BaseInput.jsx`
   - `src/sds/components/FormElement.jsx`
   - `src/sds/components/Button.jsx`
   - `src/sds/components/Input.jsx`
   - `src/sds/components/Select.jsx`
   - `src/sds/components/TextArea.jsx`
   - `src/sds/components/Checkbox.jsx`
   - `src/sds/components/index.js`

5. Create icon files:
   - `src/sds/icons/SearchIcon.jsx`

6. Create main export:
   - `src/sds/index.js`

### Phase 3: Update Imports
1. Update `main.tsx` to import local SCSS:
   ```tsx
   // Change from:
   import '@sendle/sds-ui/scss/sds.scss';
   // To:
   import './sds/scss/sds.scss';
   ```

2. Update component imports throughout the app:
   ```tsx
   // Change from:
   import { Button, Input } from '@sendle/sds-ui';
   // To:
   import { Button, Input } from './sds';
   ```

3. Remove `@sendle/sds-ui` from package.json dependencies

### Phase 4: Test Locally
1. Run `npm run dev` and verify all components render correctly
2. Test all forms and interactions
3. Run `npm run build` to verify production build works

### Phase 5: Deploy to Vercel
1. Push branch to GitHub
2. Connect to Vercel
3. Verify deployment works without npm link issues

## Files Currently Using SDS

Check these files for SDS imports that need updating:
- `src/main.tsx` - imports SDS SCSS
- `src/components/*/` - likely import SDS components
- `src/*.scss` files - may import SDS tokens

To find all SDS imports:
```bash
grep -r "@sendle/sds-ui" frontend/src/
```

## Commands Reference

```bash
# Switch to the branch
git checkout feature/sds-vercel-conversion

# Start dev environment
docker-compose up -d                    # MongoDB + Redis
cd backend && source venv/bin/activate && uvicorn app.main:app --reload &
cd frontend && npm run dev

# Find SDS usage
grep -r "@sendle/sds-ui" frontend/src/
grep -r "sds-" frontend/src/ --include="*.scss"
```

## Notes

- The guide at `SDS-VERCEL-SETUP-GUIDE.md` has complete component code
- SDS components use PropTypes (JSX) - may need TypeScript conversion for this project
- Sass deprecation warnings are expected and don't affect functionality
