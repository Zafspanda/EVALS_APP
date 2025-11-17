# Evals App - Comprehensive Project Analysis

## Executive Summary
The Evals_app is a full-stack web application for evaluating chatbot conversation traces using open coding methodology. It consists of a Vue 3 frontend (TypeScript), FastAPI backend (Python), MongoDB database, and Redis caching. The project has foundational test infrastructure in place with Playwright for E2E testing and Vitest for unit testing.

---

## 1. PROJECT ARCHITECTURE OVERVIEW

### Overall Structure
```
Evals_app/
├── backend/                    # FastAPI Python application
│   ├── app/
│   │   ├── api/               # API endpoints (routes)
│   │   ├── core/              # Configuration and settings
│   │   ├── db/                # Database connections
│   │   ├── models/            # Pydantic data models
│   │   ├── schemas/           # Request/response schemas
│   │   ├── services/          # Business logic (mostly empty)
│   │   └── main.py            # FastAPI app initialization
│   ├── requirements.txt        # Python dependencies
│   ├── test_api.py            # Existing test suite
│   └── venv/                  # Python virtual environment
├── frontend/                   # Vue 3 TypeScript application
│   ├── src/
│   │   ├── components/        # Vue components
│   │   ├── views/             # Page views
│   │   ├── services/          # API service layer
│   │   ├── stores/            # Pinia state management
│   │   ├── router/            # Vue Router configuration
│   │   ├── assets/            # Static assets
│   │   ├── App.vue            # Root component
│   │   └── main.ts            # Application entry point
│   ├── e2e/                   # Playwright E2E tests
│   ├── src/components/__tests__/ # Vitest unit tests
│   ├── package.json           # npm dependencies
│   ├── vite.config.ts         # Vite build configuration
│   ├── vitest.config.ts       # Vitest configuration
│   ├── playwright.config.ts   # Playwright configuration
│   └── tsconfig.json          # TypeScript configuration
├── docker-compose.yml         # MongoDB and Redis containers
├── README.md                  # Project documentation
└── docs/                      # Additional documentation
```

---

## 2. TECHNOLOGY STACK

### Frontend Stack
- **Framework**: Vue 3.5.22 (with Composition API)
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7.1.11
- **UI Library**: Naive UI 2.43.1
- **Routing**: Vue Router 4.6.3
- **State Management**: Pinia 3.0.3
- **HTTP Client**: Axios 1.13.2
- **Authentication**: Clerk (via @clerk/vue)
- **CSV Parsing**: PapaParse 5.5.3
- **Utilities**: VueUse 14.0.0

### Frontend Testing & Dev Tools
- **E2E Testing**: Playwright 1.56.1
- **Unit Testing**: Vitest 3.2.4
- **Component Testing**: Vue Test Utils 2.4.6
- **DOM Testing**: JSDOM 27.0.1
- **Linting**: ESLint 9.37.0 (with Playwright & Vue plugins)
- **Formatting**: Prettier 3.6.2

### Backend Stack
- **Framework**: FastAPI 0.115.0
- **Server**: Uvicorn 0.32.0 (with standard extras)
- **Language**: Python 3.13
- **Async ORM**: Motor 3.3.2 (async MongoDB driver)
- **Database**: MongoDB 4.6.0 (via PyMongo)
- **Caching**: Redis 5.0.1
- **Authentication**: Clerk (webhook integration)
  - python-jose with cryptography
  - passlib with bcrypt
- **Data Validation**: Pydantic 2.10.0 + Pydantic Settings 2.6.0
- **Data Processing**: Pandas 2.2.0
- **Environment**: python-dotenv 1.0.0

### Backend Testing & Dev Tools
- **Testing**: Pytest 7.4.3
- **Async Testing**: pytest-asyncio 0.21.1
- **Code Formatting**: Black 23.12.0
- **Import Sorting**: isort 5.13.2

### Infrastructure
- **Database**: MongoDB 4.6 (via Docker)
- **Cache**: Redis 5.0.1 (via Docker)
- **Container Orchestration**: Docker Compose

---

## 3. EXISTING TEST FRAMEWORKS & CONFIGURATIONS

### Frontend Testing Setup

#### Playwright Configuration
**File**: `/frontend/playwright.config.ts`
- Test Directory: `./e2e`
- Base URL: `http://localhost:5173` (dev) or `http://localhost:4173` (prod preview)
- Browsers: Chromium, Firefox, WebKit
- Timeout: 30 seconds per test, 5 seconds for assertions
- Reporters: HTML report
- CI Integration: Enabled with retries (2 retries on CI, 0 locally)
- Headless Mode: Auto-detected based on CI environment

#### Vitest Configuration
**File**: `/frontend/vitest.config.ts`
- Environment: JSDOM
- Excludes E2E tests from unit test runs
- Root: Frontend directory

#### TypeScript Vitest Config
**File**: `/frontend/tsconfig.vitest.json`
- Extends: `tsconfig.app.json`
- Includes: `src/**/__tests__/*` and `env.d.ts`

### Backend Testing Setup
**Framework**: Pytest 7.4.3
**Location**: `/backend/test_api.py`
- Uses FastAPI TestClient
- Mock-based testing (unittest.mock)
- Database mocks for isolation

---

## 4. EXISTING TEST FILES & COVERAGE

### Frontend Tests

#### E2E Tests
**File**: `/frontend/e2e/annotation-flow.spec.ts` (92 lines)
- **Test Suites**: 2 test.describe blocks
- **Tests**: 5 test cases

Tests Covered:
1. **Annotation Flow Test**: CSV import → view trace → save annotation workflow
2. **CSV Validation**: Non-CSV file rejection
3. **Annotation Form Validation**: Fail path validation
4. **Navigation Tests**: Main navigation (Home, Traces, Import)
5. **Trace Navigation**: Previous/next trace navigation

Issues Identified:
- Uses hardcoded absolute URLs (`http://localhost:5173`)
- Selector queries are somewhat fragile (text-based selectors)
- No authentication setup for tests
- Mock/fixture traces need database setup

**File**: `/frontend/e2e/vue.spec.ts` (8 lines)
- Basic smoke test only
- Checks for "You did it!" heading on root URL

#### Unit Tests
**File**: `/frontend/src/components/__tests__/HelloWorld.spec.ts`
- Single test for HelloWorld component
- Tests that component renders with prop

**Test Directory**: `/frontend/src/components/__tests__/`
- Currently only contains HelloWorld.spec.ts

### Backend Tests

**File**: `/backend/test_api.py` (192 lines)
- **Testing Framework**: Pytest with TestClient
- **Test Suites**: 4 test classes/functions

Tests Covered:
1. **Health Check**: `/health` endpoint
2. **Root Endpoint**: `/` endpoint
3. **CSV Import Tests**:
   - Invalid file extension validation
   - Missing column validation
   - Successful import with valid data
4. **Annotation Tests**:
   - Create annotation
   - Update annotation
   - Get annotation for trace

Architecture:
- Uses `unittest.mock` for auth and database mocking
- Fixtures for mock_auth and mock_db
- Mocks entire database layer

---

## 5. MAIN FEATURES & MODULES REQUIRING TEST COVERAGE

### Frontend Components

#### CsvImporter.vue
**Path**: `/frontend/src/components/CsvImporter.vue` (119 lines)
**Purpose**: CSV file upload and import
**Key Features**:
- File validation (extension, size)
- Drag-and-drop upload
- Error/success messages
- Upload progress indicator

**Testable Aspects**:
- File validation logic
- Upload error handling
- Success message display
- Component props/emit
- File size limit validation (10MB)

#### TraceList.vue
**Path**: `/frontend/src/components/TraceList.vue` (200+ lines)
**Purpose**: Display paginated list of traces
**Key Features**:
- Data table with pagination
- Row coloring based on pass/fail status
- Remote pagination
- Turn number formatting

**Testable Aspects**:
- Pagination logic
- Data table rendering
- Row styling logic
- Page change handling
- Data loading states

#### AnnotationForm.vue
**Path**: `/frontend/src/components/AnnotationForm.vue` (150+ lines)
**Purpose**: Quick action annotation workflow (enhanced Nov 17, 2025)
**Key Features**:
- Quick action buttons: "Pass & Next" (green), "Skip" (neutral), "Mark as Fail" (red)
- One-click "Pass & Next": saves as Pass + auto-navigates to next unannotated trace
- "Skip" button: navigates to next unannotated trace without saving
- "Mark as Fail": shows conditional inline fail form with required fields
- Optional pass comment (collapsed section)
- Conditional failure note field (required for fail)
- Auto-navigation after all save actions
- Existing annotation versioning

**Testable Aspects**:
- Quick action button handlers
- Conditional fail form visibility
- Form validation rules (fail path)
- Auto-navigation to next unannotated trace
- Save/reset actions
- Existing annotation detection
- Version tracking
- Pass comment optional field handling

#### TraceViewer.vue
**Path**: `/frontend/src/components/TraceViewer.vue` (200+ lines)
**Purpose**: Display single trace with context
**Key Features**:
- Trace detail display
- Conversation context
- Integration with AnnotationForm
- Manual navigation: Previous/Next buttons in card header for browsing
- Auto-reload annotation after save

#### Other Components
- **AppHeader.vue**: Navigation header
- **TheWelcome.vue**: Welcome component
- **HelloWorld.vue**: Example component (has test)

### Frontend Views

#### HomeView.vue
**Path**: `/frontend/src/views/HomeView.vue` (123 lines)
**Purpose**: Dashboard/landing page
**Features**:
- Statistics display (total traces, annotations, pass rate)
- Quick action buttons
- Recent annotations list
- Data fetching from API

**Testable Aspects**:
- Statistics calculation
- Data loading
- Navigation actions
- Animation triggers

#### ImportView.vue
**Path**: `/frontend/src/views/ImportView.vue` (11 lines)
**Purpose**: CSV import page wrapper

#### TracesView.vue
**Path**: `/frontend/src/views/TracesView.vue` (8 lines)
**Purpose**: Traces listing page wrapper

#### TraceDetailView.vue
**Path**: `/frontend/src/views/TraceDetailView.vue` (8 lines)
**Purpose**: Individual trace detail page wrapper

### Frontend Services

#### apiService
**Path**: `/frontend/src/services/api.ts` (87 lines)
**Purpose**: Centralized API client
**Key Methods**:
- `getCurrentUser()`: Get authenticated user
- `importCSV(file)`: Upload CSV file
- `getTraces(page, pageSize)`: List traces
- `getTrace(traceId)`: Get single trace
- `getAdjacentTraces(traceId)`: Get previous/next trace IDs for navigation
- `getNextUnannotatedTrace()`: Get next unannotated trace for quick action workflow
- `saveAnnotation(annotation)`: Create/update annotation
- `getAnnotationForTrace(traceId)`: Get trace annotation
- `getUserStats()`: Get user statistics

**Features**:
- Axios instance with interceptor
- Automatic Clerk token injection
- Error handling

**Testable Aspects**:
- Token injection logic
- API endpoint construction
- Navigation methods (adjacent, next unannotated)
- Error handling
- Request/response mapping

### Backend API Endpoints

#### Auth Routes (`/api/auth`)
**File**: `/backend/app/api/auth.py` (188 lines)

Endpoints:
- `POST /api/auth/webhook`: Clerk webhook handler
  - Syncs user data from Clerk to MongoDB
  - Handles user creation/update/deletion events
  - HMAC signature verification
- `GET /api/auth/me`: Get current user
  - Requires Bearer token
  - Verifies token with Clerk API
  - Returns user data

**Testable Aspects**:
- Webhook signature verification
- Clerk token validation
- User sync logic
- Error handling
- Token claims extraction

#### Traces Routes (`/api/traces`)
**File**: `/backend/app/api/traces.py` (227 lines)

Endpoints:
- `POST /api/traces/import-csv`: Import CSV file
  - File validation (extension, size)
  - Column mapping for flexibility
  - Duplicate detection
  - Batch insertion
  - Returns: imported count, skipped count
- `GET /api/traces`: List traces with pagination
  - Pagination support (page, page_size)
  - Sorting: by flow_session desc, then turn_number asc
  - Returns: trace list, pagination metadata
- `GET /api/traces/{trace_id}`: Get single trace
  - Includes conversation context (previous turns)
  - NaN value cleaning for JSON serialization
- `GET /api/traces/{trace_id}/adjacent`: Get adjacent trace IDs
  - Returns: previous and next trace IDs for navigation
  - Used for manual Previous/Next browsing
- `GET /api/traces/next/unannotated`: Get next unannotated trace
  - Finds next trace without annotation by current user
  - Used for quick action workflow auto-navigation
  - Returns None if all traces annotated

**Key Features**:
- CSV parsing with Pandas
- Column mapping logic
- NaN/null handling
- Async database operations
- Pagination and sorting

**Testable Aspects**:
- CSV validation
- Column mapping
- Duplicate trace handling
- Pagination logic
- Context retrieval
- Adjacent trace navigation logic
- Next unannotated trace finding
- Error handling
- NaN cleaning

#### Annotations Routes (`/api/annotations`)
**File**: `/backend/app/api/annotations.py` (160 lines)

Endpoints:
- `POST /api/annotations`: Create or update annotation
  - Checks trace exists
  - Detects existing annotation (upsert logic)
  - Version increments on update
  - Timestamp management
- `GET /api/annotations/trace/{trace_id}`: Get annotation for trace
  - Returns None if not found
  - Filters by current user
- `GET /api/annotations/user/stats`: Get user statistics
  - Total annotations count
  - Pass/fail counts
  - Pass rate percentage
  - Recent 5 annotations

**Testable Aspects**:
- Annotation creation logic
- Annotation update/upsert logic
- Version tracking
- User filtering
- Statistics calculation
- Error handling

### Backend Data Models

#### TraceModel
**File**: `/backend/app/models/trace.py` (57 lines)
**Purpose**: MongoDB trace document schema

Fields:
- `trace_id`: Unique identifier
- `flow_session`: Session UUID
- `turn_number`: Turn in conversation
- `total_turns`: Total turns
- `user_message`: User input
- `ai_response`: AI response
- `metadata`: CSV metadata columns
- `imported_at`: Timestamp
- `imported_by`: User ID

**Testable Aspects**:
- ObjectId serialization
- Field validation
- Default values

#### AnnotationModel
**File**: `/backend/app/models/annotation.py`
**Fields**: Similar to AnnotationCreate schema

### Backend Schemas (Pydantic)

#### AnnotationCreate
**File**: `/backend/app/schemas/annotation.py` (53 lines)
- `trace_id`: Required
- `holistic_pass_fail`: Literal["Pass", "Fail"]
- `first_failure_note`: Optional, max 256 chars
- `open_codes`: Optional, max 500 chars
- `comments_hypotheses`: Optional, max 1000 chars

Validation:
- Conditional validation: failure note only if fail

### Database Layer

#### MongoDB Connection
**File**: `/backend/app/db/mongodb.py` (69 lines)
- Async Motor client
- Connection lifecycle management
- Index creation
- Database getter function

**Collections**:
- `traces`: Trace documents
- `annotations`: User annotations
- `users`: User profiles

**Indexes**:
- Traces: trace_id (unique), flow_session, imported_by, imported_at
- Annotations: (trace_id, user_id), user_id, created_at, holistic_pass_fail
- Users: clerk_id

**Testable Aspects**:
- Connection management
- Index creation
- Error handling
- Database initialization

#### Redis Connection
**File**: `/backend/app/db/redis.py`
- Async Redis client
- Connection lifecycle

---

## 6. DIRECTORY STRUCTURE DETAILS

### Frontend Source Structure
```
frontend/src/
├── components/
│   ├── __tests__/
│   │   └── HelloWorld.spec.ts
│   ├── icons/                    (Icon components)
│   ├── AnnotationForm.vue
│   ├── AppHeader.vue
│   ├── CsvImporter.vue
│   ├── HelloWorld.vue
│   ├── TheWelcome.vue
│   ├── TraceList.vue
│   ├── TraceViewer.vue
│   └── WelcomeItem.vue
├── views/
│   ├── AboutView.vue
│   ├── HomeView.vue
│   ├── ImportView.vue
│   ├── TraceDetailView.vue
│   └── TracesView.vue
├── services/
│   └── api.ts
├── stores/
│   └── (Pinia state stores)
├── router/
│   └── index.ts
├── assets/
│   └── (Static files)
├── App.vue
└── main.ts
```

### Backend Source Structure
```
backend/app/
├── api/
│   ├── __init__.py
│   ├── auth.py
│   ├── annotations.py
│   └── traces.py
├── core/
│   ├── __init__.py
│   └── config.py
├── db/
│   ├── __init__.py
│   ├── mongodb.py
│   └── redis.py
├── models/
│   ├── __init__.py
│   ├── annotation.py
│   └── trace.py
├── schemas/
│   ├── __init__.py
│   └── annotation.py
├── services/
│   └── __init__.py
├── __init__.py
└── main.py
```

### Configuration Files

#### Frontend Config Files
- `package.json`: npm dependencies and scripts
- `vite.config.ts`: Vite build configuration
- `vitest.config.ts`: Unit test runner configuration
- `playwright.config.ts`: E2E test configuration
- `tsconfig.json`: TypeScript compilation settings
- `tsconfig.vitest.json`: TypeScript for unit tests
- `tsconfig.app.json`: TypeScript for application code
- `eslint.config.mjs`: ESLint configuration
- `.env.example`: Environment variables template
- `.prettierrc`: Prettier formatting config

#### Backend Config Files
- `requirements.txt`: Python dependencies
- `.env`: Environment variables (not in repo, use .env.example)
- `app/core/config.py`: Pydantic settings

#### Root Config
- `docker-compose.yml`: MongoDB and Redis containers
- `.gitignore`: Git ignore rules
- `README.md`: Project documentation

---

## 7. KEY DATA FLOWS

### CSV Import Flow
1. User selects CSV file in frontend
2. CsvImporter validates file (extension, size)
3. File sent to `POST /api/traces/import-csv`
4. Backend validates CSV structure
5. Pandas reads and maps columns
6. Traces inserted to MongoDB (with duplicate detection)
7. Response returned with import statistics

### Annotation Flow (Quick Action Workflow - Enhanced Nov 17, 2025)
1. User views trace in TraceViewer
2. User clicks quick action button:
   - **"Pass & Next"**: Saves as Pass with optional comment, auto-navigates to next unannotated trace
   - **"Skip"**: Navigates to next unannotated trace without saving (for deferred evaluation)
   - **"Mark as Fail"**: Shows conditional fail form with required fields
3. For Pass & Next or Fail submission:
   - Form validates input (fail requires first_failure_note)
   - `POST /api/annotations` called
   - Backend checks trace exists
   - Checks for existing annotation
   - Upserts to MongoDB (create or update with version increment)
   - Response includes annotation data
4. After save: auto-navigation to next unannotated trace via `GET /api/traces/next/unannotated`
5. Manual navigation: Previous/Next buttons in card header use `GET /api/traces/{trace_id}/adjacent`

### Authentication Flow
1. Clerk handles frontend authentication
2. User token stored in Clerk session
3. API service injects token in Authorization header
4. Backend verifies token with Clerk API
5. User synced to MongoDB via webhook
6. User ID used for annotation filtering

---

## 8. TEST COVERAGE GAPS & OPPORTUNITIES

### Critical Gaps
1. **Component Unit Tests**: Only 1 test for HelloWorld
   - CsvImporter: 0 tests
   - TraceList: 0 tests
   - AnnotationForm: 0 tests
   - TraceViewer: 0 tests
   - HomeView: 0 tests

2. **Service Layer Tests**: api.ts has 0 tests
   - Token injection logic untested
   - Error handling untested
   - Request construction untested

3. **Backend Authentication**: Clerk integration minimally tested
   - Token verification flow untested
   - Webhook signature verification untested (simplified in code)
   - User sync logic untested

4. **CSV Processing**: Limited test coverage
   - Column mapping logic untested
   - NaN handling untested
   - Duplicate detection untested

5. **Database Operations**: Mocked in current tests
   - Real database integration tests needed
   - Index creation verification needed
   - Transaction handling untested

6. **Error Scenarios**: Minimal coverage
   - Network errors
   - Database connection failures
   - Invalid user input handling

### Test Opportunities by Priority

**HIGH Priority**:
1. CsvImporter component unit tests
2. API service unit tests
3. Backend CSV processing tests
4. Annotation CRUD operations tests

**MEDIUM Priority**:
1. TraceList component tests
2. AnnotationForm component tests
3. Auth token verification tests
4. Pagination tests

**LOW Priority**:
1. HomeView statistics display
2. Navigation flow tests
3. Error message display
4. UI animation tests

---

## 9. CURRENT TEST EXECUTION

### Run Commands
```bash
# Frontend unit tests
npm run test:unit              # In frontend directory
npm run test:unit -- --watch   # With file watching

# Frontend E2E tests
npm run test:e2e               # In frontend directory

# Backend tests
pytest                         # In backend directory
pytest -v                      # Verbose output
pytest test_api.py::TestCSVImport  # Specific test class
```

### Test Results Summary
- Frontend E2E: 5 tests (basic functionality coverage)
- Frontend Unit: 1 test (HelloWorld only)
- Backend: 11 tests (basic CRUD + validation)
- **Total Test Count**: ~17 tests
- **Coverage**: ~15-20% estimated

---

## 10. ENVIRONMENT & CONFIGURATION NOTES

### Backend .env Variables (from config.py)
```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=eval_platform
REDIS_URL=redis://localhost:6379
CLERK_BACKEND_API_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
MAX_UPLOAD_SIZE=10485760  # 10MB
```

### Frontend .env Variables
```
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Database Collections
- **traces**: Stores imported conversation traces
- **annotations**: Stores user annotations with versions
- **users**: Stores user profiles synced from Clerk

---

## Summary Statistics

| Aspect | Count |
|--------|-------|
| Frontend Components | 8 main + icon components |
| Frontend Views | 5 routes |
| Backend API Endpoints | 8 endpoints (3 routes) |
| Backend Models | 2 (Trace, Annotation) |
| Existing Tests (Frontend) | 2 test files, 6 tests |
| Existing Tests (Backend) | 1 test file, 11 tests |
| **Total Lines of Code** | ~2000+ (excluding node_modules/venv) |
| **Test Coverage** | ~15-20% (estimated) |
| **Critical Untested Modules** | API Service, CsvImporter, most components |

