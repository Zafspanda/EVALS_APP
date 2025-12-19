# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Evals Open Coding Tool - A web platform for human evaluation and annotation of AI chatbot conversation traces. Built with React 18 + Sendle Design System frontend and FastAPI + MongoDB backend.

## Development Commands

### Frontend (from `frontend/`)
```bash
npm run dev          # Start dev server (port 5175)
npm run build        # Production build
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run lint         # ESLint with auto-fix
npm run type-check   # TypeScript checking
```

### Backend (from `backend/`)
```bash
source venv/bin/activate                    # Activate virtualenv
uvicorn app.main:app --reload --port 8000   # Start dev server
pytest                                       # Run all tests
pytest -v test_api.py::test_name            # Run specific test
black . && isort .                          # Format code
```

### Docker Services (from root)
```bash
docker-compose up -d    # Start MongoDB (27017) + Redis (6379)
docker-compose down     # Stop services
```

### Full Dev Environment
```bash
# Terminal 1: docker-compose up
# Terminal 2: cd backend && source venv/bin/activate && uvicorn app.main:app --reload
# Terminal 3: cd frontend && npm run dev
```

## Architecture

```
Frontend (React 18 + TypeScript)     Backend (FastAPI + Python)
├── src/components/                  ├── app/api/
│   ├── CsvImporter/                 │   ├── traces.py      (CSV import, CRUD)
│   ├── TraceList/                   │   ├── annotations.py (annotation CRUD)
│   ├── TraceViewer/                 │   └── auth.py        (Clerk auth)
│   └── QuickActions/                ├── app/models/        (Pydantic models)
├── src/views/                       ├── app/db/
│   ├── TracesView.tsx               │   ├── mongodb.py     (Motor async client)
│   └── TraceDetailView.tsx          │   └── redis.py       (caching)
└── src/services/api.ts              └── app/core/config.py (settings)
```

### Data Flow
1. **Annotation workflow**: User clicks Pass/Fail/Skip → `apiService.saveAnnotation()` → POST `/api/annotations` → MongoDB upsert → auto-navigate to next unannotated
2. **CSV import**: File upload → validation → POST `/api/traces/import-csv` → Pandas parsing → MongoDB bulk insert

### Key API Endpoints
- `POST /api/traces/import-csv` - Import CSV file
- `GET /api/traces` - List traces (paginated)
- `GET /api/traces/next/unannotated` - Find next unannotated trace
- `POST /api/annotations` - Create/update annotation (upsert)
- `GET /api/annotations/user/stats` - User statistics

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Sendle Design System (`@sendle/sds-ui`), React Router, Axios, Clerk React
- **Backend**: FastAPI, Python 3.11+, Motor (async MongoDB), Redis, Pydantic
- **Database**: MongoDB 7.0 (traces, annotations, users collections)
- **Auth**: Clerk

## Design System

This project uses **Sendle Design System** for all UI components. Reference: https://sendle.github.io/sendle-design-system/

Import components from `@sendle/sds-ui` - do not create custom UI components when SDS equivalents exist.

## Database Schema

**traces**: `trace_id` (unique), `flow_session`, `turn_number`, `total_turns`, `user_message`, `ai_response`, `metadata`

**annotations**: compound index on `(trace_id, user_id)`, fields: `holistic_pass_fail`, `first_failure_note`, `open_codes`, `comments_hypotheses`, `version`

## Project Workflow

This project uses BMad Method workflows for planning and development. Key workflows available via slash commands:
- `/bmad:bmm:workflows:dev-story` - Execute a story
- `/bmad:bmm:workflows:create-story` - Create user stories
- `/bmad:bmm:workflows:sprint-planning` - Sprint management
- `/bmad:bmm:workflows:code-review` - Code review

## Environment Variables

**Backend** (`.env`): `MONGODB_URL`, `MONGODB_DB_NAME`, `REDIS_URL`, `CLERK_BACKEND_API_KEY`, `CLERK_WEBHOOK_SECRET`

**Frontend** (`.env`): `VITE_API_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`
