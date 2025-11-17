# Evals App - Quick Reference Guide

## Project at a Glance

**Type**: Full-Stack Web Application (Vue 3 + FastAPI)
**Purpose**: Evaluate chatbot conversation traces using open coding methodology
**Status**: Foundation phase with minimal test coverage

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Frontend Framework | Vue 3.5 + TypeScript |
| Backend Framework | FastAPI (Python 3.13) |
| Database | MongoDB + Redis |
| Authentication | Clerk |
| Current Tests | 17 tests (~15% coverage) |
| Recommended Tests | 125 tests (80%+ coverage) |

---

## Project Structure at a Glance

```
backend/app/                      frontend/src/
├── api/                          ├── components/
│   ├── auth.py       (Auth)      │   ├── CsvImporter.vue
│   ├── traces.py     (Main)      │   ├── TraceList.vue
│   └── annotations.py (Main)     │   ├── AnnotationForm.vue
├── db/                           │   └── TraceViewer.vue
│   ├── mongodb.py                ├── views/
│   └── redis.py                  │   ├── HomeView.vue
├── models/                       │   ├── ImportView.vue
│   ├── trace.py                  │   └── TracesView.vue
│   └── annotation.py             ├── services/
├── schemas/                      │   └── api.ts
│   └── annotation.py             └── router/
└── main.py
```

---

## Key Endpoints

### Traces Management
- `POST /api/traces/import-csv` - Import CSV file
- `GET /api/traces` - List traces (paginated)
- `GET /api/traces/{trace_id}` - Get single trace with context
- `GET /api/traces/{trace_id}/adjacent` - Get previous/next trace IDs for navigation
- `GET /api/traces/next/unannotated` - Get next unannotated trace (for quick action workflow)

### Annotations
- `POST /api/annotations` - Create/update annotation
- `GET /api/annotations/trace/{trace_id}` - Get annotation
- `GET /api/annotations/user/stats` - Get user statistics

### Authentication
- `POST /api/auth/webhook` - Clerk webhook handler
- `GET /api/auth/me` - Get current user

---

## Component Hierarchy

```
App.vue
├── AppHeader.vue (Navigation)
└── Router outlet
    ├── HomeView (Dashboard)
    │   └── Statistics + Quick Actions
    ├── ImportView
    │   └── CsvImporter
    ├── TracesView
    │   └── TraceList
    └── TraceDetailView
        └── TraceViewer
            ├── Trace Details
            └── AnnotationForm
```

---

## Test Files Location

### Frontend
```
frontend/
├── e2e/
│   ├── vue.spec.ts                (1 test - smoke)
│   └── annotation-flow.spec.ts     (5 tests - workflow)
├── src/components/__tests__/
│   └── HelloWorld.spec.ts          (1 test)
├── vitest.config.ts               (Unit test config)
└── playwright.config.ts           (E2E test config)
```

### Backend
```
backend/
├── test_api.py                     (11 tests)
└── requirements.txt               (Includes pytest)
```

---

## How to Run Tests

### Frontend
```bash
cd frontend

# Unit tests
npm run test:unit                    # Run once
npm run test:unit -- --watch        # Watch mode

# E2E tests (requires running app)
npm run dev                          # In another terminal
npm run test:e2e                     # Playwright tests
```

### Backend
```bash
cd backend

# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test
pytest test_api.py::TestCSVImport::test_csv_validation_invalid_extension -v
```

---

## Critical Components (Need Tests)

### High Priority
1. **CsvImporter.vue** - File upload validation (0 tests)
2. **AnnotationForm.vue** - Form handling (0 tests)
3. **apiService** - API communication (0 tests)
4. **traces.py** - CSV processing (minimal tests)
5. **auth.py** - Authentication (minimal tests)

### Medium Priority
1. **TraceList.vue** - Data table pagination (0 tests)
2. **HomeView.vue** - Dashboard stats (0 tests)
3. **annotations.py** - CRUD operations (some tests)

---

## Data Models

### Trace
```python
{
  _id: ObjectId,
  trace_id: str,           # Unique identifier
  flow_session: str,       # Session UUID
  turn_number: int,        # Turn in conversation
  total_turns: int,
  user_message: str,
  ai_response: str,
  metadata: dict,          # Additional CSV columns
  imported_at: datetime,
  imported_by: str         # User ID
}
```

### Annotation
```python
{
  _id: ObjectId,
  trace_id: str,
  user_id: str,
  holistic_pass_fail: "Pass" | "Fail",  # Set via quick actions
  first_failure_note: str,  # Required for Fail, max 256 chars
  open_codes: str,          # Comma-separated text (Story 1), max 500
  comments_hypotheses: str, # Optional for Pass, required for Fail, max 1000
  version: int,             # Increments on update
  created_at: datetime,
  updated_at: datetime
}
```

### Quick Action Annotation Workflow
**Enhanced UX (Nov 17, 2025):**
- **"Pass & Next"** - One-click save as Pass + auto-navigate (3s vs 15s)
- **"Skip"** - Navigate without saving (for uncertain/deferred traces)
- **"Mark as Fail"** - Shows conditional inline form with required fields
- **Auto-navigation** - All save actions navigate to next unannotated trace
- **Manual navigation** - Previous/Next buttons in card header for browsing

---

## Configuration Files

### Frontend
- `vite.config.ts` - Build configuration
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `tsconfig.json` - TypeScript settings

### Backend
- `app/core/config.py` - Settings/configuration
- `requirements.txt` - Python dependencies

### Docker
- `docker-compose.yml` - MongoDB + Redis

---

## Environment Variables

### Backend (.env)
```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=eval_platform
REDIS_URL=redis://localhost:6379
CLERK_BACKEND_API_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Database Indexes

### Traces
- `trace_id` (unique)
- `flow_session`
- `imported_by`
- `imported_at`

### Annotations
- `(trace_id, user_id)` (compound)
- `user_id`
- `created_at`
- `holistic_pass_fail`

---

## Testing Frameworks

### Frontend
- **Vitest** - Unit test runner (Jest-compatible)
- **Vue Test Utils** - Component testing
- **JSDOM** - DOM environment
- **Playwright** - E2E browser automation

### Backend
- **Pytest** - Test framework
- **pytest-asyncio** - Async test support
- **FastAPI TestClient** - API testing
- **unittest.mock** - Mocking

---

## Common Test Patterns

### Frontend Component Test
```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: { msg: 'Hello' }
    })
    expect(wrapper.text()).toContain('Hello')
  })
})
```

### Backend API Test
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoint():
    response = client.get("/api/endpoint")
    assert response.status_code == 200
    assert response.json() == {"key": "value"}
```

---

## Key APIs & Libraries

### Frontend
- **Axios** - HTTP client (with interceptors for auth)
- **Naive UI** - Component library
- **Vue Router** - Routing
- **Pinia** - State management
- **Clerk Vue** - Authentication

### Backend
- **FastAPI** - Web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Pandas** - CSV processing
- **python-jose** - JWT/token handling

---

## Troubleshooting

### Frontend Tests Fail
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment
npm run type-check

# Debug single test
npm run test:unit -- src/components/__tests__/MyTest.spec.ts
```

### Backend Tests Fail
```bash
# Check dependencies
pip install -r requirements.txt

# Run with verbose output
pytest -vv -s

# Check database connection
python -c "from app.db.mongodb import get_database; print(get_database())"
```

---

## Next Steps for Testing

1. **Start with Backend API Tests** (faster feedback)
   - Mock database, test endpoint logic
   - Focus on CSV import and annotation CRUD

2. **Add Frontend Service Tests**
   - Mock API calls, test service layer
   - Test token injection and error handling

3. **Add Component Tests**
   - Start with critical components (CsvImporter, AnnotationForm)
   - Mock child components and services

4. **Expand E2E Tests**
   - Add workflow tests for complete user journeys
   - Test error scenarios

---

## Documentation Files

- **PROJECT_ANALYSIS.md** - Comprehensive project structure and architecture
- **TEST_STRATEGY.md** - Detailed testing recommendations and plan
- **QUICK_REFERENCE.md** - This file
- **README.md** - Setup and usage instructions

---

## Important Links

- API Docs: http://localhost:8000/docs (when running)
- Frontend: http://localhost:5173 (when running)
- Clerk Dashboard: https://dashboard.clerk.com

---

## Test Coverage Targets

| Component | Current | Target | Priority |
|-----------|---------|--------|----------|
| CsvImporter | 0% | 90% | High |
| AnnotationForm | 0% | 90% | High |
| API Service | 0% | 90% | High |
| TraceList | 0% | 85% | Medium |
| Traces Endpoints | 20% | 90% | High |
| Annotations Endpoints | 30% | 90% | High |
| Auth Endpoints | 10% | 85% | Medium |

