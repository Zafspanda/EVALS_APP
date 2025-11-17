# Evals App - Documentation Index

## Overview
This index guides you through all project documentation for understanding the Evals_app architecture, test strategy, and implementation status.

---

## Documentation Files

### 1. PROJECT_ANALYSIS.md (20 KB, 706 lines)
**Purpose**: Comprehensive project structure and architecture analysis

**Contains**:
- Executive summary of the full-stack application
- Complete technology stack (Vue 3, FastAPI, MongoDB, Redis, Clerk)
- Existing test frameworks and configurations (Playwright, Vitest, Pytest)
- Detailed breakdown of all components, services, and API endpoints
- Data models and database schema
- Key data flows (CSV import, annotation, authentication)
- Test coverage gaps and opportunities
- Database collections and indexes

**Best for**:
- Understanding the complete project structure
- Finding specific component implementations
- Understanding data models and API endpoints
- Identifying what needs testing

**Key Sections**:
- Architecture overview
- Technology stack details
- Existing test files analysis
- Feature and module breakdown
- Directory structure details
- Test coverage gaps

---

### 2. TEST_STRATEGY.md (15 KB, 500+ lines)
**Purpose**: Comprehensive testing strategy and recommendations

**Contains**:
- Testing pyramid and framework summary
- Frontend testing strategy by component tier
- Backend testing strategy by endpoint
- Detailed test case recommendations (125+ tests recommended)
- Testing best practices by layer
- 4-phase execution plan (Week 1-4)
- Code coverage goals (75-85%)
- CI/CD integration guidelines
- Success metrics and timelines

**Best for**:
- Planning test implementation
- Understanding what tests to write first
- Following best practices for different test types
- Setting up CI/CD pipelines
- Tracking progress toward coverage goals

**Key Sections**:
- Unit vs Integration vs E2E testing breakdown
- Component-by-component test plans
- Backend endpoint test plans
- Execution phases (4-week plan)
- Success metrics

---

### 3. QUICK_REFERENCE.md (8.8 KB, 300+ lines)
**Purpose**: Fast lookup guide for developers and testers

**Contains**:
- Project statistics at a glance
- Simplified project structure diagram
- Key endpoints reference
- Component hierarchy
- Test files location
- How to run tests (commands)
- Critical components needing tests
- Data model schemas
- Configuration files reference
- Environment variables
- Database indexes
- Common test patterns
- Testing frameworks overview
- Next steps for testing

**Best for**:
- Quick lookup while developing
- Running tests locally
- Understanding what needs testing
- Quick reference during implementation
- Setting up environment

**Key Sections**:
- Quick stats and structure
- Endpoint reference
- How to run tests
- Critical components list
- Data models
- Testing patterns

---

### 4. README.md (4.3 KB)
**Purpose**: Project setup and usage instructions

**Contains**:
- Project overview
- Features list
- Tech stack summary
- Setup instructions (backend and frontend)
- Configuration instructions
- Usage guide
- CSV format specifications
- API documentation links
- Testing commands
- Development project structure
- Key components description

**Best for**:
- Initial project setup
- Running the application
- Understanding features
- Finding API documentation

---

### 5. UX Enhancement Implementation Plan
**File**: `docs/ux-enhancement-quick-actions-IMPLEMENTATION-PLAN.md`
**Status**: ✅ IMPLEMENTED AND MERGED (Nov 17, 2025)
**Purpose**: Technical implementation plan for Quick Action Annotation Workflow

**Contains**:
- Enhancement rationale (30-50% velocity improvement)
- Phase 1 implementation requirements
- API changes (adjacent traces, next unannotated)
- Component specifications (AnnotationForm, TraceViewer)
- Definition of Done checklist
- Git commit references

**Best for**:
- Understanding the UX enhancement decision
- Reviewing implementation details
- Reference for similar workflow patterns

---

## How to Use These Documents

### For Initial Project Understanding
1. Start with **QUICK_REFERENCE.md** - Get overview and stats
2. Read **PROJECT_ANALYSIS.md** sections 1-3 - Understand architecture and tech stack
3. Check **README.md** - See features and setup

### For Test Planning
1. Read **TEST_STRATEGY.md** - Understand testing approach
2. Reference **PROJECT_ANALYSIS.md** sections 4-5 - Identify what needs testing
3. Use **QUICK_REFERENCE.md** - See test commands and patterns

### For Test Implementation
1. Follow **TEST_STRATEGY.md** execution plan (phases 1-4)
2. Reference **QUICK_REFERENCE.md** for test patterns
3. Use **PROJECT_ANALYSIS.md** for specific component details

### For Debugging/Troubleshooting
1. Check **QUICK_REFERENCE.md** - Common commands and patterns
2. Reference **PROJECT_ANALYSIS.md** - Component/endpoint details
3. Check **README.md** - Setup and configuration

---

## Document Statistics

| Document | Size | Lines | Purpose |
|----------|------|-------|---------|
| PROJECT_ANALYSIS.md | 20 KB | 706 | Comprehensive architecture |
| TEST_STRATEGY.md | 15 KB | 500+ | Testing recommendations |
| QUICK_REFERENCE.md | 8.8 KB | 300+ | Quick lookup guide |
| README.md | 4.3 KB | 196 | Setup and usage |
| DOCUMENTATION_INDEX.md | This file | Navigation guide |
| **Total** | **48 KB** | **1,866+** | **Complete project docs** |

---

## Key Topics by Document

### Architecture & Structure
- **PROJECT_ANALYSIS.md**: All sections 1-3, 6
- **QUICK_REFERENCE.md**: Sections on structure, components, endpoints

### Technology Stack
- **PROJECT_ANALYSIS.md**: Section 2 (detailed)
- **README.md**: Tech stack section
- **QUICK_REFERENCE.md**: Key APIs & Libraries section

### Test Coverage & Status
- **PROJECT_ANALYSIS.md**: Sections 4-5 (existing tests and gaps)
- **TEST_STRATEGY.md**: Overview (current vs recommended)
- **QUICK_REFERENCE.md**: Test coverage targets table

### Components & Services
- **PROJECT_ANALYSIS.md**: Section 5 (detailed descriptions)
- **QUICK_REFERENCE.md**: Critical components list
- **TEST_STRATEGY.md**: Component-by-component test plans

### API Endpoints
- **PROJECT_ANALYSIS.md**: Section 5 (detailed)
- **QUICK_REFERENCE.md**: Key endpoints section
- **TEST_STRATEGY.md**: Backend API endpoint test plans

### Database & Models
- **PROJECT_ANALYSIS.md**: Sections 5, 6 (models and database)
- **QUICK_REFERENCE.md**: Data models section
- **QUICK_REFERENCE.md**: Database indexes section

### Testing Frameworks
- **PROJECT_ANALYSIS.md**: Sections 3 (configurations)
- **TEST_STRATEGY.md**: Framework summary table
- **QUICK_REFERENCE.md**: Testing frameworks section

### How to Run / Execute
- **README.md**: Testing section
- **QUICK_REFERENCE.md**: How to run tests section
- **TEST_STRATEGY.md**: Debugging & troubleshooting section

---

## Recommended Reading Order

### For Developers Starting Fresh
1. QUICK_REFERENCE.md (5 min) - Get oriented
2. README.md (10 min) - Set up project
3. PROJECT_ANALYSIS.md sections 1-3 (20 min) - Understand architecture
4. QUICK_REFERENCE.md data models (5 min) - Review data structures
5. PROJECT_ANALYSIS.md section 5 (20 min) - Learn components/endpoints

### For QA/Test Engineers
1. QUICK_REFERENCE.md (5 min) - Understand project
2. TEST_STRATEGY.md sections 1-3 (30 min) - Learn testing approach
3. PROJECT_ANALYSIS.md section 8 (15 min) - Identify gaps
4. TEST_STRATEGY.md execution plan (15 min) - Plan implementation
5. QUICK_REFERENCE.md test patterns (5 min) - Review examples

### For Project Managers/Stakeholders
1. QUICK_REFERENCE.md (5 min) - Get stats
2. PROJECT_ANALYSIS.md section 1 (5 min) - Understand structure
3. TEST_STRATEGY.md success metrics (10 min) - Understand goals
4. PROJECT_ANALYSIS.md section 8 (5 min) - See current status

---

## Key Metrics at a Glance

### Current State
- **Existing Tests**: 17 tests (~15-20% coverage)
- **Frontend Tests**: 6 tests (1 unit, 5 E2E)
- **Backend Tests**: 11 tests
- **Test Coverage**: ~15-20%

### Target State
- **Recommended Tests**: 125 tests
- **Frontend Tests**: 55-65 tests (unit + E2E)
- **Backend Tests**: 60-70 tests
- **Test Coverage**: 75-85%

### Timeline
- **Phase 1**: Backend unit tests (Week 1-2)
- **Phase 2**: Component tests (Week 2-3)
- **Phase 3**: E2E & Integration (Week 3-4)
- **Phase 4**: Coverage & Refinement (Week 4)

---

## Critical Components Needing Tests

### High Priority
1. **CsvImporter.vue** - File validation (0 tests)
2. **AnnotationForm.vue** - Form handling (0 tests)
3. **apiService** - API communication (0 tests)
4. **traces.py** - CSV processing (minimal tests)
5. **auth.py** - Authentication (minimal tests)

### Medium Priority
1. **TraceList.vue** - Pagination (0 tests)
2. **HomeView.vue** - Statistics (0 tests)
3. **annotations.py** - CRUD operations (some tests)

---

## Environment & Setup Reference

### Required Tools
- Node.js 20.19+ (frontend)
- Python 3.13+ (backend)
- Docker Desktop (MongoDB + Redis)
- Clerk account (authentication)

### Development Commands
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Database
docker-compose up -d
```

### Test Commands
```bash
# Frontend unit tests
npm run test:unit

# Frontend E2E tests
npm run test:e2e

# Backend tests
pytest
```

---

## File Locations Reference

### Configuration Files
- Frontend Vite: `frontend/vite.config.ts`
- Frontend Tests: `frontend/vitest.config.ts`, `frontend/playwright.config.ts`
- Backend Config: `backend/app/core/config.py`
- Docker: `docker-compose.yml`

### Test Files
- Frontend E2E: `frontend/e2e/`
- Frontend Unit: `frontend/src/components/__tests__/`
- Backend Unit: `backend/test_api.py`

### Source Code
- Frontend Components: `frontend/src/components/`
- Frontend Views: `frontend/src/views/`
- Frontend Services: `frontend/src/services/`
- Backend API: `backend/app/api/`
- Backend Models: `backend/app/models/`
- Backend Schemas: `backend/app/schemas/`

---

## FAQ

### Q: Where do I start testing?
**A**: Start with TEST_STRATEGY.md Phase 1 - Backend API tests. They run fastest and give quick feedback.

### Q: How many tests should I write?
**A**: Currently 17 tests exist. Aim for 125 total tests (8x increase) to reach 75-85% coverage.

### Q: What components are most critical to test?
**A**: CsvImporter, AnnotationForm, and apiService are highest priority due to user-facing functionality.

### Q: How long will testing take?
**A**: Approximately 4 weeks following the phased approach in TEST_STRATEGY.md.

### Q: How do I run existing tests?
**A**: See QUICK_REFERENCE.md "How to Run Tests" section.

---

## Next Steps

1. **Review QUICK_REFERENCE.md** - Understand project at a glance
2. **Read TEST_STRATEGY.md** - Plan testing approach
3. **Reference PROJECT_ANALYSIS.md** - Deep dive into specific areas
4. **Start Phase 1** - Implement backend API tests
5. **Track progress** - Use success metrics in TEST_STRATEGY.md

---

## Document Maintenance

These documents were created on **2025-11-15** and should be updated:
- **Monthly**: When new tests are added or components change
- **Quarterly**: For architecture reviews and strategy adjustments
- **As needed**: When significant changes occur

Last updated: 2025-11-15
Estimated next review: 2025-12-15

