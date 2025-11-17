# Architecture Overview

**Project:** Evals Open Coding Platform
**Version:** 1.0 (Sprint 1 Complete)
**Last Updated:** 2025-11-17
**Status:** Production Ready (pending auth fixes)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Component Breakdown](#component-breakdown)
5. [Data Flow](#data-flow)
6. [Design Patterns](#design-patterns)
7. [API Design](#api-design)
8. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### Purpose

The Evals Open Coding Platform enables systematic manual evaluation of AI chatbot conversation traces using open coding methodology. It supports multiple evaluators working on the same dataset with complete audit trails and inter-annotator agreement tracking.

### Key Capabilities

- **Trace Import:** CSV upload with 28-column schema validation
- **Annotation Workflow:** Quick action-based evaluation with progressive disclosure
- **Multi-User Support:** Isolated annotation spaces per evaluator
- **Progress Tracking:** Real-time stats on annotation completion
- **Export:** CSV/JSONL export with enriched annotation data
- **Audit Trail:** Complete version history of all annotations

### Scale Targets

| Metric | MVP (Phase 1) | Production (Phase 2) |
|--------|---------------|---------------------|
| Traces | 100 | 100,000 |
| Concurrent Users | 3-5 | 50+ |
| Annotations/User | 100 | 10,000 |
| Response Time (p95) | < 500ms | < 300ms |

---

## Technology Stack

### Backend

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | FastAPI | 0.104+ | Native async support, excellent data validation via Pydantic |
| **Runtime** | Python | 3.13 | Latest stable, improved performance |
| **Database** | MongoDB | 6.0+ | Flexible schema for dynamic CSV columns |
| **Caching** | Redis | 7.0+ | Session state, query result caching |
| **Auth** | Clerk | Latest | Managed auth eliminates security complexity |
| **API Client** | Motor | 3.3+ | Async MongoDB driver for FastAPI |
| **Validation** | Pydantic | 2.5+ | Type-safe request/response models |

**Key Dependencies:**
```
fastapi==0.104.1
motor==3.3.1
redis==5.0.1
pydantic==2.5.0
pandas==2.1.3  # CSV processing
httpx==0.25.1  # Clerk API calls
```

### Frontend

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Vue 3 | 3.5+ | Composition API, excellent reactivity for forms |
| **Language** | TypeScript | 5.3+ | Type safety for API contracts |
| **UI Library** | Naive UI | 2.40+ | Comprehensive component library, good a11y |
| **Bundler** | Vite | 5.0+ | Fast HMR, optimized production builds |
| **HTTP Client** | Axios | 1.6+ | Interceptor support for auth tokens |
| **Auth** | @clerk/vue | Latest | Vue 3 integration for Clerk |
| **Utilities** | @vueuse/core | 10.7+ | Composition utilities (breakpoints, etc.) |

**Key Dependencies:**
```json
{
  "vue": "^3.5.13",
  "typescript": "~5.3.0",
  "naive-ui": "^2.40.1",
  "axios": "^1.6.2",
  "@clerk/vue": "^0.5.1",
  "vite": "^5.0.8"
}
```

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Container** | Docker Compose | Local development (MongoDB + Redis) |
| **Deployment** | Railway (planned) | All-in-one platform for production |
| **Monitoring** | Logging (built-in) | FastAPI logging, MongoDB slow query log |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Vue 3 SPA (Port 5173)                                 │ │
│  │  - Composition API components                          │ │
│  │  - Axios API client with Clerk token injection         │ │
│  │  - Naive UI component library                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS + Bearer Token
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  FastAPI (Port 8000)                                   │ │
│  │  - Async request handlers                              │ │
│  │  - Pydantic request/response validation                │ │
│  │  - CORS middleware                                      │ │
│  │  - Clerk token verification (Depends injection)        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   DATA LAYER             │  │   CACHE LAYER            │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │ MongoDB (27017)    │  │  │  │ Redis (6379)       │  │
│  │ - traces          │  │  │  │ - User stats cache │  │
│  │ - annotations     │  │  │  │ - Session data     │  │
│  │ - users           │  │  │  │ - Query cache      │  │
│  └────────────────────┘  │  │  └────────────────────┘  │
└──────────────────────────┘  └──────────────────────────┘
                │
                ▼
        ┌──────────────────┐
        │  EXTERNAL SERVICES│
        │  - Clerk Auth API │
        │  - Webhooks       │
        └──────────────────┘
```

### Component Architecture

```
Backend (FastAPI)
├── app/
│   ├── main.py                    # Application entry point, lifespan events
│   ├── core/
│   │   └── config.py              # Centralized configuration (Pydantic Settings)
│   ├── api/                       # API endpoints (routers)
│   │   ├── auth.py                # Clerk webhook, /auth/me endpoint
│   │   ├── traces.py              # Trace CRUD, import, navigation
│   │   └── annotations.py         # Annotation CRUD, stats
│   ├── models/                    # Pydantic models (database documents)
│   │   ├── trace.py               # TraceModel with PyObjectId
│   │   └── annotation.py          # AnnotationModel with validation
│   ├── schemas/                   # Request/response schemas
│   │   └── annotation.py          # AnnotationCreate, AnnotationUpdate
│   └── db/                        # Database connection management
│       ├── mongodb.py             # Motor client, index creation
│       └── redis.py               # Redis client setup

Frontend (Vue 3)
├── src/
│   ├── main.ts                    # App initialization, Clerk plugin
│   ├── App.vue                    # Root component with router-view
│   ├── router/
│   │   └── index.ts               # Vue Router configuration
│   ├── services/
│   │   └── api.ts                 # Axios instance + API methods
│   ├── components/
│   │   ├── AppHeader.vue          # Navigation, user menu
│   │   ├── TraceViewer.vue        # Trace detail container (smart component)
│   │   ├── AnnotationForm.vue     # Quick actions + progressive disclosure
│   │   ├── TraceList.vue          # Paginated trace table
│   │   └── CsvImporter.vue        # File upload wizard
│   └── views/
│       ├── HomeView.vue           # Dashboard with stats
│       ├── TracesView.vue         # Trace list view
│       ├── TraceDetailView.vue    # Wrapper for TraceViewer
│       └── ImportView.vue         # CSV import page
```

---

## Component Breakdown

### Backend Components

#### **1. API Routers** (`app/api/`)

**Purpose:** Handle HTTP requests, delegate to database layer

**Key Files:**
- `auth.py` - Clerk webhook handler, user sync, token verification
- `traces.py` - Trace import, listing, detail, adjacent navigation
- `annotations.py` - Annotation CRUD, user stats

**Pattern:** Dependency injection for auth
```python
async def get_current_user(request: Request) -> Dict:
    """Extract user from Clerk JWT token"""
    # Verifies token, returns user_id
```

#### **2. Database Layer** (`app/db/`)

**Purpose:** Manage connections, create indexes

**mongodb.py:**
- Singleton Motor client
- Lifespan management (connect on startup, close on shutdown)
- Index creation strategy (see database-design.md)

**redis.py:**
- Optional Redis connection (graceful degradation if unavailable)
- UTF-8 encoding for string values

#### **3. Models** (`app/models/`)

**Purpose:** Define MongoDB document structure with Pydantic

**Key Pattern: PyObjectId**
```python
class PyObjectId(str):
    """Custom type for BSON ObjectId in Pydantic v2"""
    # Validates ObjectId, serializes to string for JSON
```

**TraceModel:**
- Core fields: `trace_id`, `flow_session`, `turn_number`, `user_message`, `ai_response`
- `metadata: Dict[str, Any]` - Stores all CSV columns

**AnnotationModel:**
- User-specific: `user_id`, `trace_id` (compound key)
- Fields: `holistic_pass_fail`, `first_failure_note`, `open_codes`, `comments_hypotheses`
- Audit: `version`, `created_at`, `updated_at`

### Frontend Components

#### **1. Smart Components** (Data Fetching)

**TraceViewer.vue:**
- Fetches trace, annotation, and adjacent trace IDs in parallel
- Manages loading/error states
- Emits events to parent (minimal)

**Pattern: Parallel Data Fetching**
```typescript
const [traceData, annotationData, adjacentData] = await Promise.all([
  apiService.getTrace(traceId.value),
  apiService.getAnnotationForTrace(traceId.value),
  apiService.getAdjacentTraces(traceId.value)
])
```

#### **2. Presentation Components**

**AnnotationForm.vue:**
- Pure presentation, receives data via props
- Emits `save-success` event (no direct API calls for parent coordination)
- Progressive disclosure: Quick actions → Optional comment → Fail form

**Pattern: Progressive Disclosure**
```
[✓ Pass & Next] [⏭ Skip] [✗ Mark as Fail]  ← Always visible
         ↓ (if Pass clicked)
[Collapsed: ▶ Add optional comment]         ← Optional detail
         ↓ (if Fail clicked)
[Expanded: Fail form with required fields]  ← Required detail
```

#### **3. Service Layer** (`services/api.ts`)

**Purpose:** Abstract HTTP calls, inject auth tokens

**Pattern: Axios Interceptor**
```typescript
api.interceptors.request.use(async (config) => {
  const clerk = (window as any).Clerk
  if (clerk?.session) {
    const token = await clerk.session.getToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## Data Flow

### Annotation Creation Flow

```
┌─────────────┐
│ User clicks │ "Pass & Next"
│ Quick Action│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ AnnotationForm.vue                              │
│ 1. Validate form (no validation for pass)       │
│ 2. Call apiService.saveAnnotation()             │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ api.ts (Axios Interceptor)                      │
│ 1. Get Clerk token from window.Clerk.session    │
│ 2. Inject Bearer token in Authorization header  │
│ 3. POST /api/annotations with payload           │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ FastAPI: POST /api/annotations                  │
│ 1. Validate request with Pydantic schema        │
│ 2. Extract user_id from JWT (get_current_user)  │
│ 3. Check if annotation exists (upsert pattern)  │
│ 4. Update version number if updating            │
│ 5. Save to MongoDB annotations collection       │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ MongoDB: annotations collection                 │
│ - Compound index (trace_id, user_id)            │
│ - Returns inserted/updated document             │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│ Response flows back to frontend                 │
│ 1. AnnotationForm emits 'save-success'          │
│ 2. TraceViewer calls getNextUnannotatedTrace()  │
│ 3. Router navigates to next trace               │
└─────────────────────────────────────────────────┘
```

### CSV Import Flow

```
User selects CSV file
       ↓
CsvImporter.vue validates extension
       ↓
POST /api/traces/import-csv (multipart/form-data)
       ↓
FastAPI reads file, validates size (10MB limit)
       ↓
Pandas parses CSV, applies column mappings
       ↓
Validates required columns: trace_id, flow_session, turn_number, etc.
       ↓
For each row:
  - Check if trace_id exists (skip duplicates)
  - Clean NaN values → None
  - Insert trace with metadata field (all columns)
       ↓
Return { imported: N, skipped: M, total: T }
```

---

## Design Patterns

### 1. **Dependency Injection (Backend)**

**Pattern:** FastAPI's `Depends()` for cross-cutting concerns

**Usage:**
```python
@router.get("/")
async def list_traces(
    page: int = Query(1, ge=1),
    current_user: Dict = Depends(get_current_user)  # Injected auth
):
    # current_user available without manual token parsing
```

**Benefits:**
- Centralized auth logic
- Easy to mock in tests
- Clear dependency graph

### 2. **Upsert Pattern (Database)**

**Pattern:** Single endpoint for create/update

**Implementation:**
```python
existing = await db.annotations.find_one({"trace_id": X, "user_id": Y})
if existing:
    annotation_data["version"] = existing["version"] + 1
    await db.annotations.replace_one({"_id": existing["_id"]}, annotation_data)
else:
    annotation_data["version"] = 1
    await db.annotations.insert_one(annotation_data)
```

**Benefits:**
- Simplified frontend (one API call for both operations)
- Atomic version increment
- Audit trail via version field

### 3. **Progressive Disclosure (Frontend)**

**Pattern:** Show complexity only when needed

**Implementation:**
- Default: Quick action buttons (Pass/Fail/Skip)
- On Pass: Optional collapsed comment section
- On Fail: Expanded form with required fields

**Benefits:**
- 80% use case (Pass) = 1 click
- Reduced cognitive load
- Maintains flexibility for complex cases

### 4. **Async/Await (Backend)**

**Pattern:** Non-blocking I/O for all database operations

**Implementation:**
```python
async def get_trace(trace_id: str):
    trace = await db.traces.find_one({"trace_id": trace_id})  # Non-blocking
    context = []
    async for ctx in db.traces.find({...}):  # Async iteration
        context.append(ctx)
```

**Benefits:**
- Higher concurrency (100+ requests/sec possible)
- Efficient resource usage
- Required for Motor (async MongoDB driver)

### 5. **Service Layer (Frontend)**

**Pattern:** Centralized API client with interceptors

**Implementation:**
```typescript
export const apiService = {
  async getTrace(id: string) {
    const response = await api.get(`/api/traces/${id}`)
    return response.data
  }
}
```

**Benefits:**
- DRY: Token injection in one place
- Easy to add retry logic
- Type-safe API contracts (with TypeScript interfaces)

---

## API Design

### Design Principles

1. **RESTful Resource Naming**
   - Collections: `/api/traces`, `/api/annotations`
   - Single resource: `/api/traces/{id}`
   - Actions: `/api/traces/import-csv`, `/api/traces/next/unannotated`

2. **Consistent Response Format**
   ```json
   {
     "message": "Success message",
     "data": { /* payload */ },
     "meta": { "page": 1, "total": 100 }
   }
   ```

3. **HTTP Status Codes**
   - `200 OK` - Success
   - `201 Created` - Resource created
   - `400 Bad Request` - Validation error
   - `401 Unauthorized` - Invalid/missing token
   - `404 Not Found` - Resource doesn't exist
   - `500 Internal Server Error` - Unexpected error

### Key Endpoints

#### Traces

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| `GET` | `/api/traces` | List traces (paginated) | `{ traces: [], page, total }` |
| `GET` | `/api/traces/{id}` | Get trace with context | `{ trace_id, user_message, ai_response, context: [] }` |
| `GET` | `/api/traces/{id}/adjacent` | Get prev/next IDs | `{ previous: "id" \| null, next: "id" \| null }` |
| `GET` | `/api/traces/next/unannotated` | Find next unannotated trace | `{ trace_id: "id" \| null }` |
| `POST` | `/api/traces/import-csv` | Import CSV file | `{ imported: N, skipped: M, total: T }` |

#### Annotations

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| `POST` | `/api/annotations` | Create/update annotation | `{ message, annotation }` |
| `GET` | `/api/annotations/trace/{id}` | Get user's annotation | `{ trace_id, holistic_pass_fail, ... }` |
| `GET` | `/api/annotations/user/stats` | Get user stats | `{ total_annotations, pass_count, pass_rate }` |

#### Auth

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| `POST` | `/api/auth/webhook` | Clerk user sync webhook | `{ status: "success" }` |
| `GET` | `/api/auth/me` | Get current user | `{ clerk_id, email, name }` |

### Query Parameters

**Pagination:**
- `page` (default: 1, min: 1)
- `page_size` (default: 50, max: 100)

**Example:**
```
GET /api/traces?page=2&page_size=25
```

---

## Deployment Architecture

### Local Development

```
Docker Compose:
  - MongoDB (port 27017)
  - Redis (port 6379)

Backend:
  - uvicorn app.main:app --reload --port 8000

Frontend:
  - npm run dev (Vite dev server, port 5173)
```

### Production (Railway - Planned)

```
Frontend Service:
  - Build: npm run build
  - Serve: Static files via Railway's CDN
  - Environment: VITE_API_BASE_URL=https://api.evals.app

Backend Service:
  - Build: pip install -r requirements.txt
  - Start: uvicorn app.main:app --host 0.0.0.0 --port 8000
  - Environment: MONGODB_URL, REDIS_URL, CLERK_* secrets

MongoDB Atlas:
  - Managed MongoDB cluster (M2 tier for MVP)
  - Connection string via environment variable

Redis Cloud:
  - Managed Redis instance (30MB free tier)
  - Connection string via environment variable
```

### Environment Variables

**Backend (.env):**
```bash
# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=eval_platform

# Cache
REDIS_URL=redis://localhost:6379
REDIS_DB=0

# Auth
CLERK_BACKEND_API_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Security
SECRET_KEY=random-256-bit-key
```

**Frontend (.env):**
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Performance Characteristics

### Current Benchmarks (Local Development)

| Operation | Avg Latency | p95 Latency | Notes |
|-----------|-------------|-------------|-------|
| List traces (50 items) | 120ms | 180ms | Includes MongoDB query + serialization |
| Get trace detail | 80ms | 150ms | With context loading (previous turns) |
| Save annotation | 60ms | 100ms | Upsert operation |
| Adjacent traces | 40ms | 80ms | Index-only query (no document load) |
| Next unannotated | 200ms | 350ms | **Bottleneck** - loads all annotation IDs |
| CSV import (100 rows) | 2.5s | 3.2s | Includes pandas parsing + bulk insert |

### Optimization Targets (Phase 2)

- Next unannotated: < 50ms (aggregation pipeline)
- Redis caching: 50% reduction in database queries
- Connection pooling: Support 100+ concurrent users

---

## Security Model

See [security-model.md](./security-model.md) for detailed security architecture.

**Key Principles:**

1. **Authentication:** Clerk JWT tokens (verified on every request)
2. **Authorization:** User-scoped queries (`user_id` filter on annotations)
3. **Data Isolation:** No cross-user data leakage (enforced at database query level)
4. **Webhook Security:** Svix signature verification for Clerk webhooks
5. **Input Validation:** Pydantic models validate all request payloads
6. **CORS:** Whitelist frontend origins only

---

## Monitoring & Observability

### Current Logging

- FastAPI: INFO level logging for requests
- MongoDB: Slow query log (> 100ms)
- Redis: Connection errors logged, non-blocking

### Planned (Phase 2)

- Sentry for error tracking
- Datadog/New Relic for APM
- MongoDB Atlas performance monitoring
- Custom metrics: Annotation velocity, user engagement

---

## Related Documents

- [Database Design](./database-design.md) - Schema details, indexing strategy
- [Security Model](./security-model.md) - Auth flow, data isolation
- [Scaling Strategy](./scaling-strategy.md) - Performance optimization, capacity planning
- [ADR Index](./adr/) - Architecture Decision Records

---

**Last Review:** 2025-11-17 (Winston - Architect Agent)
**Next Review:** After Phase 2 completion
