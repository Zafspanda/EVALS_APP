# Technical Specification: Open Coding Web Application

**Project:** Evals_app
**Type:** Greenfield Web Application
**Date:** November 14, 2025
**Author:** BMad Product Team

---

## 1. Context & Discovery

### Loaded Documents Summary

**Documents Found:**
- ✅ Product Brief (_brief_evals_app.md): Comprehensive 1290-line specification for Open Coding Web Application
  - Clear requirements for AI chatbot trace evaluation
  - IAA (Inter-Annotator Agreement) workflow requirements
  - CI/CD pipeline integration needs
  - Export requirements for golden sets (CSV/JSONL)

**Project Type:** Greenfield - New application, no existing codebase

**Key Business Requirements:**
- Enable systematic manual evaluation of AI chatbot conversation traces
- Support multiple evaluators working on same dataset
- Track 100 traces from 39 sessions (Sendle production data)
- Import CSV with 28-column schema
- Export enriched data with annotations (35+ columns)
- Calculate IAA metrics (Cohen's/Fleiss' Kappa)
- Maintain complete audit trail

### Project Stack Summary

**Selected Technology Stack:**
- **Frontend Framework:** Vue 3.5 with TypeScript
- **Backend Framework:** Python FastAPI with WebSockets
- **Database:** MongoDB (primary) + Redis (caching/state)
- **Authentication:** Clerk (managed auth service)
- **Deployment:** Railway (all-in-one platform)
- **Runtime:** Node.js 20.x (build), Python 3.11 (API)

**Why This Stack:**
- Vue's reactivity perfect for dynamic form updates
- FastAPI excellent for data validation with Pydantic
- MongoDB ideal for dynamic schema (label columns)
- Railway simplifies deployment and scaling
- Clerk eliminates auth complexity

### Existing Structure Summary

**Greenfield Project Status:**
- No existing code to analyze
- No legacy patterns to follow
- No technical debt
- Starting fresh with modern best practices

---

## 2. The Change: What We're Building

### Problem Statement

Manual evaluation of chatbot traces is currently fragmented across spreadsheets with no collaboration, poor data integrity, and no audit trails. Teams need a centralized web application to systematically code traces, calculate inter-rater agreement, and export enriched datasets for CI pipeline integration.

### Solution Overview

Build a web application that:
1. Imports CSV files with 28-column trace data
2. Provides intuitive coding interface with dynamic forms
3. Supports multiple evaluators working simultaneously
4. Tracks all changes with audit trails
5. Calculates IAA metrics automatically
6. Exports enriched data (CSV/JSONL) with 35+ columns
7. Integrates with CI pipeline for golden set validation

### Change Type

**New Application Development** - Building complete web application from scratch

### Scope - What's IN

**MVP Scope (Phase 1):**
- CSV import with schema validation
- Turn-level trace evaluation interface
- Multi-user support (basic - no real-time sync)
- Annotation fields:
  - Binary pass/fail judgement
  - Free-form open codes
  - Dynamic label columns from rubric
  - Comments and flags
- CSV/JSONL export
- Basic audit trail
- User authentication via Clerk
- Progress tracking

### Scope - What's OUT

**Deferred to Phase 2:**
- Real-time collaboration features
- IAA metrics calculation
- Alignment session workflows
- Advanced filtering/search
- Keyboard shortcuts (except basic save)
- Auto-save every 30 seconds
- Side-by-side disagreement views
- Rubric version management

---

## 3. Implementation Details

### Source Tree Changes - File Structure

```
Evals_app/
├── frontend/                        # Vue 3.5 application
│   ├── src/
│   │   ├── main.ts                 # CREATE - App entry point
│   │   ├── App.vue                 # CREATE - Root component
│   │   ├── router/
│   │   │   └── index.ts            # CREATE - Vue Router setup
│   │   ├── stores/
│   │   │   ├── auth.ts             # CREATE - Clerk auth store (Pinia)
│   │   │   ├── traces.ts           # CREATE - Trace data store
│   │   │   └── annotations.ts      # CREATE - Annotation store
│   │   ├── components/
│   │   │   ├── TraceViewer.vue     # CREATE - Display trace content
│   │   │   ├── AnnotationForm.vue  # CREATE - Coding form component
│   │   │   ├── CsvImporter.vue     # CREATE - Import wizard
│   │   │   └── ExportDialog.vue    # CREATE - Export options
│   │   ├── views/
│   │   │   ├── Dashboard.vue       # CREATE - Main dashboard
│   │   │   ├── EvaluationView.vue  # CREATE - Coding interface
│   │   │   ├── ImportView.vue      # CREATE - Import page
│   │   │   └── ExportView.vue      # CREATE - Export page
│   │   ├── types/
│   │   │   ├── trace.ts            # CREATE - TypeScript interfaces
│   │   │   └── annotation.ts       # CREATE - Annotation types
│   │   └── api/
│   │       └── client.ts           # CREATE - API client wrapper
│   ├── package.json                # CREATE - Frontend dependencies
│   ├── vite.config.ts              # CREATE - Vite bundler config
│   └── tsconfig.json               # CREATE - TypeScript config
│
├── backend/                         # FastAPI application
│   ├── app/
│   │   ├── main.py                 # CREATE - FastAPI app entry
│   │   ├── config.py               # CREATE - Environment config
│   │   ├── models/
│   │   │   ├── trace.py            # CREATE - Trace Pydantic model
│   │   │   ├── annotation.py       # CREATE - Annotation model
│   │   │   └── user.py             # CREATE - User model
│   │   ├── routes/
│   │   │   ├── auth.py             # CREATE - Auth endpoints
│   │   │   ├── traces.py           # CREATE - Trace CRUD
│   │   │   ├── annotations.py      # CREATE - Annotation endpoints
│   │   │   └── export.py           # CREATE - Export endpoints
│   │   ├── services/
│   │   │   ├── csv_parser.py       # CREATE - CSV import logic
│   │   │   ├── exporter.py         # CREATE - Export service
│   │   │   └── audit.py            # CREATE - Audit trail service
│   │   ├── database/
│   │   │   ├── mongodb.py          # CREATE - MongoDB connection
│   │   │   └── redis_client.py     # CREATE - Redis setup
│   │   └── schemas/
│   │       └── validation.py       # CREATE - Data validation schemas
│   ├── requirements.txt            # CREATE - Python dependencies
│   └── Dockerfile                  # CREATE - Container setup
│
├── docker-compose.yml              # CREATE - Local dev environment
├── railway.toml                    # CREATE - Railway deployment config
└── README.md                       # CREATE - Setup documentation
```

### Technical Approach - Definitive Decisions

**Frontend Architecture:**
- Vue 3.5.13 with Composition API and TypeScript 5.3
- Pinia 2.1.7 for state management
- Vue Router 4.2.5 for navigation
- Vite 5.0.0 for build tooling
- Naive UI 2.38.0 for component library (data tables, forms)
- Axios 1.6.2 for API calls

**Backend Architecture:**
- Python 3.11 with FastAPI 0.104.1
- Pydantic 2.5.0 for data validation
- Motor 3.3.2 for async MongoDB driver
- Redis-py 5.0.1 for caching
- Python-multipart 0.0.6 for file uploads
- Python-jose 3.3.0 for JWT handling with Clerk

**Database Design:**
- MongoDB 7.0 for document storage
- Collections: `traces`, `annotations`, `users`, `audit_logs`
- Redis 7.2 for session management and caching

### Existing Patterns to Follow

**Greenfield Best Practices:**
- RESTful API design with clear resource endpoints
- Async/await patterns throughout (Vue 3 + FastAPI)
- TypeScript interfaces matching Pydantic models
- Comprehensive error handling with status codes
- Structured logging with correlation IDs
- Environment-based configuration

### Integration Points

**External Services:**
- Clerk API for authentication
- Railway platform APIs for deployment
- MongoDB Atlas (if not using Railway's MongoDB)
- Redis Cloud (if not using Railway's Redis)

**Data Flow:**
1. CSV Import → FastAPI validation → MongoDB storage
2. User annotations → API validation → MongoDB + audit log
3. Export request → MongoDB query → CSV/JSONL generation

---

## 4. Development Context

### Relevant Existing Code

Not applicable - greenfield project

### Framework Dependencies

**Frontend (package.json):**
```json
{
  "dependencies": {
    "vue": "^3.5.13",
    "@clerk/vue": "^0.1.0",
    "pinia": "^2.1.7",
    "vue-router": "^4.2.5",
    "naive-ui": "^2.38.0",
    "axios": "^1.6.2",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vue/test-utils": "^2.4.3",
    "vitest": "^1.0.0"
  }
}
```

**Backend (requirements.txt):**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
motor==3.3.2
redis==5.0.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
httpx==0.25.2
pandas==2.1.4
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
```

### Internal Dependencies

Initial implementation has no internal dependencies (greenfield)

### Configuration Changes

**Environment Variables (.env):**
```
# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=evals_app

# Redis
REDIS_URL=redis://localhost:6379

# API
API_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Existing Conventions

**New Project Conventions:**
- Vue components: PascalCase (TraceViewer.vue)
- TypeScript types: PascalCase interfaces
- API routes: kebab-case (/api/traces/import-csv)
- Python: snake_case for functions/variables
- MongoDB collections: lowercase plural (traces, annotations)
- Git commits: Conventional Commits format

### Implementation Stack

**Complete Stack with Versions:**
- Runtime: Python 3.11, Node.js 20.x
- Frontend Framework: Vue 3.5.13
- Backend Framework: FastAPI 0.104.1
- UI Library: Naive UI 2.38.0
- Database: MongoDB 7.0
- Cache: Redis 7.2
- Auth: Clerk
- Deployment: Railway
- Testing: Vitest + Pytest

---

## 5. Technical Details

### API Endpoint Design

**Core Endpoints:**

```python
# Authentication (via Clerk webhook)
POST   /api/auth/webhook        # Clerk user sync
GET    /api/auth/me            # Current user info

# Traces
POST   /api/traces/import-csv  # Import CSV file
GET    /api/traces             # List traces (paginated)
GET    /api/traces/{id}        # Get single trace
GET    /api/traces/next        # Get next uncoded trace

# Annotations
POST   /api/annotations         # Create annotation
PUT    /api/annotations/{id}   # Update annotation
GET    /api/annotations/trace/{trace_id}  # Get annotations for trace

# Export
POST   /api/export/csv         # Export as CSV
POST   /api/export/jsonl       # Export as JSONL
GET    /api/export/status/{job_id}  # Check export status

# Rubric
GET    /api/rubric             # Get current rubric
POST   /api/rubric/import      # Import living_rubric.csv
```

### Data Models

**Trace Document (MongoDB):**
```python
{
    "_id": ObjectId,
    "trace_id": "flow-session-uuid_1",  # Composite ID
    "flow_session": "uuid",
    "turn_number": 1,
    "total_turns": 3,
    "user_message": "Where is my parcel?",
    "ai_response": "Let me check...",
    "metadata": {
        # All 28 CSV columns stored here
    },
    "imported_at": datetime,
    "imported_by": "user_id"
}
```

**Annotation Document:**
```python
{
    "_id": ObjectId,
    "trace_id": "flow-session-uuid_1",
    "user_id": "clerk_user_id",
    "holistic_pass_fail": "Pass",
    "first_failure_note": null,
    "open_codes": ["successful_resolution"],
    "taxonomy_category": "Task Success",
    "comments_hypotheses": "Good response",
    "needs_clarification": false,
    "is_golden_set": true,
    "dynamic_labels": {
        "constraint_violation": false,
        "hallucination": false,
        # Dynamic based on rubric
    },
    "created_at": datetime,
    "updated_at": datetime,
    "version": 1
}
```

### Performance Considerations

- Pagination on trace list (50 per page)
- MongoDB indexes on trace_id, user_id, created_at
- Redis caching for rubric and user sessions
- Async API operations throughout
- CSV parsing in chunks for large files
- Background jobs for export (if > 100 traces)

### Security Considerations

- Clerk handles all authentication
- API validates all inputs with Pydantic
- CORS configured for frontend URL only
- Rate limiting on imports (5 per minute)
- Sanitize CSV data on import
- Audit log for all mutations

---

## 6. Development Setup

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/Evals_app.git
cd Evals_app

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure environment variables

# 3. Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env  # Add Clerk keys

# 4. Start MongoDB and Redis with Docker
docker-compose up -d

# 5. Run backend
cd backend
uvicorn app.main:app --reload --port 8000

# 6. Run frontend (new terminal)
cd frontend
npm run dev

# 7. Access application
# Frontend: http://localhost:5173
# API docs: http://localhost:8000/docs
```

---

## 7. Implementation Guide

### Setup Steps

**Pre-Implementation Checklist:**
- [ ] Set up Railway account and project
- [ ] Create Clerk application and get API keys
- [ ] Set up GitHub repository
- [ ] Install Docker Desktop for local development
- [ ] Install Python 3.11 and Node.js 20.x

### Implementation Steps

**Phase 1: Foundation (Week 1)**

1. **Initialize Project Structure**
   - Create directory structure as specified
   - Initialize git repository
   - Set up .gitignore for Python/Node

2. **Backend Foundation**
   - Set up FastAPI application
   - Configure MongoDB connection with Motor
   - Create Pydantic models for traces/annotations
   - Implement CSV import endpoint with validation

3. **Frontend Foundation**
   - Initialize Vue 3 project with Vite
   - Set up Clerk authentication
   - Create basic routing structure
   - Build CSV upload component

4. **Integration**
   - Connect frontend to backend API
   - Test CSV import end-to-end
   - Verify data persistence in MongoDB

**Phase 2: Core Features (Week 2)**

1. **Trace Evaluation Interface**
   - Build TraceViewer component
   - Create AnnotationForm with dynamic fields
   - Implement save/navigation logic
   - Add progress tracking

2. **Multi-User Support**
   - Add user context to annotations
   - Implement trace assignment logic
   - Create user dashboard

3. **Export Functionality**
   - Build CSV export with 35+ columns
   - Implement JSONL export
   - Add export options dialog

**Phase 3: Polish & Deploy (Week 3)**

1. **Testing & Validation**
   - Write E2E tests for critical path
   - Add API integration tests
   - Manual testing of all features

2. **Deployment**
   - Configure Railway deployment
   - Set up environment variables
   - Deploy and verify production

### Testing Strategy

**E2E Tests (Playwright):**
- Import CSV → View trace → Add annotation → Export CSV
- Multi-user trace assignment workflow
- Authentication flow with Clerk

**API Tests (Pytest):**
- CSV validation with invalid data
- Annotation CRUD operations
- Export format validation

**Frontend Tests (Vitest):**
- Component rendering tests
- Form validation logic
- Store state management

### Acceptance Criteria

**MVP Success Criteria:**
1. ✅ Can import Sendle CSV (100 traces) without errors
2. ✅ Can view and navigate between traces
3. ✅ Can add all required annotations:
   - Binary pass/fail
   - Open codes (comma-separated)
   - Comments
   - Dynamic label checkboxes
4. ✅ Can export enriched CSV with 35+ columns
5. ✅ Multiple users can work on same dataset
6. ✅ Audit trail tracks all changes
7. ✅ Authentication prevents unauthorized access
8. ✅ Performance: Page loads in < 2 seconds

---

## 8. Developer Resources

### File Paths Reference

**Key Files for Development:**
```
Frontend:
- /frontend/src/views/EvaluationView.vue - Main coding interface
- /frontend/src/stores/traces.ts - Trace state management
- /frontend/src/api/client.ts - API communication

Backend:
- /backend/app/routes/traces.py - Trace endpoints
- /backend/app/services/csv_parser.py - Import logic
- /backend/app/services/exporter.py - Export logic
```

### Key Code Locations

**CSV Import Logic:**
- Backend: `backend/app/services/csv_parser.py:validate_csv()`
- Frontend: `frontend/src/components/CsvImporter.vue`

**Annotation Save Flow:**
- Frontend: `frontend/src/stores/annotations.ts:saveAnnotation()`
- Backend: `backend/app/routes/annotations.py:create_annotation()`

**Export Generation:**
- Backend: `backend/app/services/exporter.py:generate_csv()`

### Testing Locations

```
Backend Tests:
- /backend/tests/test_csv_import.py
- /backend/tests/test_annotations.py
- /backend/tests/test_export.py

Frontend Tests:
- /frontend/tests/components/
- /frontend/tests/e2e/
```

### Documentation to Update

- README.md - Setup instructions, architecture overview
- API_DOCS.md - Endpoint documentation
- DEPLOYMENT.md - Railway deployment guide
- CHANGELOG.md - Track releases and features

---

## 9. UX/UI Considerations

### UI Component Structure

**Main Layout:**
- Top navbar with user info and logout
- Left sidebar for navigation
- Center content area for main interface
- Right panel for annotation form (evaluation view)

**Key Components:**
- Data table for trace list (using Naive UI)
- Form components for annotations
- Progress bar for completion tracking
- Modal dialogs for import/export

**Design Principles:**
- Clean, minimal interface
- High contrast for readability
- Clear visual hierarchy
- Consistent spacing and alignment

**Responsive Design:**
- Desktop-first (primary use case)
- Tablet support for reviewing
- Mobile view deferred to Phase 2

---

## 10. Deployment Strategy

### Deployment Steps

1. **Railway Setup:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and initialize
   railway login
   railway init

   # Add services
   railway add mongodb
   railway add redis

   # Deploy
   railway up
   ```

2. **Environment Configuration:**
   - Set Clerk keys in Railway dashboard
   - Configure MongoDB connection string
   - Set Redis URL
   - Add frontend/backend URLs

3. **Deployment Workflow:**
   - Push to main branch
   - Railway auto-deploys
   - Run smoke tests
   - Monitor logs

### Rollback Plan

1. Use Railway's deployment history
2. Click "Rollback" to previous version
3. Verify functionality restored
4. Investigate issue in staging

### Monitoring Approach

- Railway metrics dashboard
- MongoDB Atlas monitoring (if used)
- Clerk dashboard for auth issues
- Error tracking with Sentry (Phase 2)

---

## Summary

This tech spec provides a comprehensive blueprint for building the Open Coding Web Application. The chosen stack (Vue 3.5 + FastAPI + MongoDB) balances developer productivity with performance requirements. The MVP scope focuses on core functionality while deferring complex features to Phase 2.

**Next Steps:**
1. Set up development environment
2. Begin Phase 1 implementation
3. Weekly progress reviews
4. Deploy MVP in 3-4 weeks

---

*Tech Spec Version 1.0 - Generated November 14, 2025*