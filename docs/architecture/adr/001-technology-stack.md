# ADR-001: Technology Stack Selection

**Status:** Accepted
**Date:** 2025-11-14
**Deciders:** BMad Product Team
**Consulted:** Winston (Architect)

---

## Context

We need to build a web application for evaluating AI chatbot conversation traces using open coding methodology. The application must:

- Import CSV files with dynamic schemas (28+ columns)
- Support multiple evaluators working simultaneously
- Provide an intuitive annotation interface
- Scale to 100K+ traces and 500K+ annotations
- Be deployable to production quickly (2-week MVP timeline)

We must choose:
1. Backend framework (Python vs Node.js vs Go)
2. Frontend framework (React vs Vue vs Svelte)
3. Database (PostgreSQL vs MongoDB vs DynamoDB)
4. Deployment platform (Railway vs Heroku vs AWS)

---

## Decision

We will use the following technology stack:

### Backend
- **Framework:** FastAPI (Python)
- **Runtime:** Python 3.13
- **Database Driver:** Motor (async MongoDB driver)
- **Validation:** Pydantic v2

### Frontend
- **Framework:** Vue 3.5 (Composition API)
- **Language:** TypeScript 5.3
- **UI Library:** Naive UI
- **Build Tool:** Vite 5
- **HTTP Client:** Axios

### Database
- **Primary:** MongoDB 6.0+
- **Cache:** Redis 7.0+

### Infrastructure
- **Deployment:** Railway (planned)
- **Auth:** Clerk (managed service)

---

## Rationale

### Backend: FastAPI + Python

**Why FastAPI:**
1. **Native Async Support:** Non-blocking I/O critical for MongoDB queries (Motor requires async/await)
2. **Automatic Data Validation:** Pydantic models eliminate manual validation code
3. **Auto-Generated OpenAPI Docs:** Interactive API documentation out of the box
4. **Performance:** Comparable to Node.js for I/O-bound operations (our use case)
5. **Ecosystem:** Rich data science libraries (pandas for CSV parsing, numpy for metrics)

**Alternatives Considered:**

| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| **Node.js + Express** | Large ecosystem, familiar to JS developers | Manual validation, weak typing without TypeScript on backend | ❌ Rejected (validation complexity) |
| **Django REST** | Mature, built-in admin | Sync-only (unless Django 4+), heavier than needed | ❌ Rejected (async required for Motor) |
| **Go + Gin** | High performance, compiled | Smaller ecosystem, steeper learning curve | ❌ Rejected (overkill for I/O-bound app) |

**Winner:** FastAPI - Best balance of productivity and performance

---

### Frontend: Vue 3 + TypeScript

**Why Vue 3:**
1. **Reactivity System:** Perfect for dynamic forms (annotation fields change based on pass/fail)
2. **Composition API:** Clean separation of concerns, reusable logic (composables)
3. **TypeScript Support:** First-class TS integration
4. **Learning Curve:** Easier than React for small team
5. **Component Libraries:** Naive UI provides excellent form controls

**Alternatives Considered:**

| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| **React** | Largest ecosystem, most jobs | More boilerplate, useEffect complexity | ❌ Rejected (over-engineering for our needs) |
| **Svelte** | Best performance, minimal JS | Smaller ecosystem, fewer UI libraries | ❌ Rejected (risk for production support) |
| **Angular** | Enterprise-ready, opinionated | Heavy, steep learning curve | ❌ Rejected (too heavy for MVP) |

**Winner:** Vue 3 - Best developer experience for forms and real-time updates

---

### Database: MongoDB

**Why MongoDB:**
1. **Flexible Schema:** CSV columns vary (28 now, potentially more later)
2. **Embedded Documents:** Store all CSV columns in `metadata` field without schema changes
3. **Natural Data Model:** Traces and annotations are documents, not relational tables
4. **Developer Experience:** Motor + Pydantic = type-safe async queries
5. **Atlas Hosting:** Managed hosting with automatic backups

**Alternatives Considered:**

| Database | Pros | Cons | Decision |
|----------|------|------|----------|
| **PostgreSQL** | ACID guarantees, mature | Requires schema migrations for new CSV columns, JSONB still less flexible | ❌ Rejected (schema rigidity) |
| **DynamoDB** | Serverless, auto-scaling | Vendor lock-in, complex query patterns, expensive for analytics | ❌ Rejected (AWS lock-in) |
| **Supabase** | PostgreSQL + realtime, great DX | Still requires schema, less mature | ❌ Rejected (same schema issues as Postgres) |

**Winner:** MongoDB - Flexibility trumps ACID for our use case (no complex transactions needed)

---

### UI Library: Naive UI

**Why Naive UI:**
1. **Vue 3 Native:** Built specifically for Vue 3 Composition API
2. **TypeScript First:** Excellent type definitions
3. **Form Controls:** Rich form components (Input, Select, Radio) with validation
4. **Accessibility:** ARIA attributes built-in
5. **Themeable:** Easy dark mode support (Phase 2)

**Alternatives Considered:**

| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| **Element Plus** | Mature, large community | Heavier, Vue 2 heritage | ❌ Rejected (legacy baggage) |
| **Ant Design Vue** | Enterprise-ready, comprehensive | Very heavy bundle size | ❌ Rejected (performance) |
| **Headless UI (Vue)** | Unstyled, flexible | Requires custom styling (slower development) | ❌ Rejected (MVP timeline) |

**Winner:** Naive UI - Best balance of features and bundle size

---

### Cache: Redis

**Why Redis:**
1. **Simple Key-Value Store:** Perfect for caching user stats, trace counts
2. **TTL Support:** Automatic cache expiration
3. **Atomic Operations:** Increment/decrement for counters
4. **Managed Hosting:** Redis Cloud free tier sufficient for MVP

**Alternatives Considered:**

| Cache | Pros | Cons | Decision |
|-------|------|------|----------|
| **In-Memory (Python dict)** | No external dependency | Doesn't scale across multiple backend instances | ❌ Rejected (horizontal scaling blocked) |
| **Memcached** | Lightweight, fast | No data structures (lists, sets), no persistence | ❌ Rejected (less flexible than Redis) |

**Winner:** Redis - Industry standard, easy to deploy

---

### Deployment: Railway

**Why Railway:**
1. **Simplicity:** Deploy from GitHub with zero config
2. **Integrated Services:** MongoDB, Redis, PostgreSQL in one platform
3. **Environment Variables:** Easy secrets management
4. **Auto-Deploy:** Push to main → automatic deployment
5. **Pricing:** $5/mo Hobby tier sufficient for MVP

**Alternatives Considered:**

| Platform | Pros | Cons | Decision |
|----------|------|------|----------|
| **Heroku** | Mature, large ecosystem | Expensive ($25/mo for basic), removed free tier | ❌ Rejected (cost) |
| **Vercel** | Excellent frontend hosting | Backend limited to serverless functions (not ideal for FastAPI) | ❌ Rejected (backend constraints) |
| **AWS (EC2 + RDS)** | Full control, powerful | Complex setup, steep learning curve | ❌ Rejected (MVP timeline) |

**Winner:** Railway - Fastest path to production

---

### Auth: Clerk

**Why Clerk:**
1. **Zero Auth Code:** No password hashing, session management, etc.
2. **Vue Integration:** `@clerk/vue` package with Composition API support
3. **Webhook Support:** User sync to MongoDB via webhooks
4. **JWT Tokens:** Standard Bearer token authentication
5. **Free Tier:** 5,000 MAU sufficient for MVP

**Alternatives Considered:**

| Provider | Pros | Cons | Decision |
|----------|------|------|----------|
| **Auth0** | Enterprise-ready, mature | More complex, heavier bundle | ❌ Rejected (over-engineering) |
| **Supabase Auth** | Open source, integrated with Postgres | Vendor lock-in to Supabase ecosystem | ❌ Rejected (we chose MongoDB) |
| **Roll Our Own** | Full control, no vendor lock-in | Security risk, weeks of development time | ❌ Rejected (MVP timeline) |

**Winner:** Clerk - Best developer experience for MVP

---

## Consequences

### Positive

- **Fast Development:** FastAPI + Vue 3 = rapid prototyping
- **Type Safety:** TypeScript + Pydantic = fewer runtime errors
- **Flexible Schema:** MongoDB handles CSV column changes without migrations
- **Async Performance:** Non-blocking I/O supports 50+ concurrent users
- **Quick Deployment:** Railway eliminates DevOps complexity

### Negative

- **No ACID Transactions:** MongoDB lacks cross-collection transactions (acceptable for our use case)
- **Smaller Communities:** Vue 3 + Naive UI smaller than React ecosystem
- **Vendor Lock-in:** Clerk, Railway (mitigated by standard APIs - JWT, Docker)
- **Python Concurrency:** GIL limits CPU-bound tasks (but we're I/O-bound)

### Risks

1. **MongoDB Scale Limits:** May need aggregation pipeline optimization at 100K+ annotations (planned for Phase 2)
2. **Railway Pricing:** Unknown costs beyond Hobby tier (monitor usage)
3. **Clerk Availability:** If Clerk down, auth broken (SLA: 99.9% uptime)

### Mitigation

- **MongoDB:** Implement aggregation pipelines early (ADR-005)
- **Railway:** Monitor costs monthly, plan migration to AWS if >$100/mo
- **Clerk:** Implement graceful degradation (cached user sessions)

---

## Related ADRs

- [ADR-002: Clerk for Authentication](./002-authentication-provider.md)
- [ADR-003: MongoDB for Primary Database](./003-database-choice.md)
- [ADR-004: Quick Action Annotation Workflow](./004-quick-actions-ux.md)

---

**Review Date:** 2025-11-17
**Reviewers:** Winston (Architect Agent)
**Status:** ✅ Validated - Stack performing well in Sprint 1
