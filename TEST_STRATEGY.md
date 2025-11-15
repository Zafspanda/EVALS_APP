# Evals App - Testing Strategy & Recommendations

## Overview
This document outlines a comprehensive testing strategy for the Evals_app project, prioritizing high-impact test coverage based on code criticality and functionality importance.

---

## Testing Pyramid

```
          /\
         /E2E\              5-10% of tests
        /-----\             Full user workflows
       /-------\            Browser automation
      /API Tests\           15-20% of tests
     /-----------\          Integration tests
    /Unit Tests  \          70-75% of tests
   /-----------  -\         Component & function
  /_______________\ ---- Business logic
```

---

## Testing Framework Summary

| Layer | Framework | Language | Current | Recommended |
|-------|-----------|----------|---------|-------------|
| **E2E** | Playwright | TypeScript | 5 tests | 15-20 tests |
| **Integration** | Jest + Fetch Mock | TypeScript | 0 tests | 10-15 tests |
| **Unit (Frontend)** | Vitest + Vue Test Utils | TypeScript | 1 test | 25-30 tests |
| **Unit (Backend)** | Pytest | Python | 11 tests | 30-40 tests |
| **API** | FastAPI TestClient + Pytest | Python | Included in unit | 15-20 tests |

**Recommended Total Test Coverage**: 80-125 tests (from current 17 tests)

---

## Frontend Testing Strategy

### 1. Unit Tests (Vitest + Vue Test Utils)

#### Component Tests by Priority

##### TIER 1 - Critical Components (High Impact)

**CsvImporter.vue** (Currently 0 tests, Target: 8-10 tests)
```typescript
// Test cases needed:
✓ Renders upload area correctly
✓ File validation - rejects non-CSV files
✓ File validation - rejects oversized files (>10MB)
✓ File selection updates selected file state
✓ Upload button enabled only when file selected
✓ Shows error message on validation failure
✓ Shows success message on successful import
✓ Emits 'import-complete' event after successful upload
✓ Handles network errors gracefully
✓ Progress indicator shows during upload
```

**AnnotationForm.vue** (Currently 0 tests, Target: 10-12 tests)
```typescript
// Test cases needed:
✓ Renders all form fields correctly
✓ Pass/Fail radio button toggling
✓ First Failure Note field visible only when Fail selected
✓ Form validation rules apply correctly
✓ Save button disabled during submission
✓ Reset button clears all fields
✓ Displays existing annotation info when present
✓ Handles form submission with valid data
✓ Shows validation errors for required fields
✓ Handles max length constraints (256, 500, 1000 chars)
✓ Version display for existing annotations
```

**TraceList.vue** (Currently 0 tests, Target: 8-10 tests)
```typescript
// Test cases needed:
✓ Renders data table with columns
✓ Displays trace data correctly
✓ Pagination controls visible and functional
✓ Row background color changes based on pass/fail status
✓ Page change triggers data reload
✓ Page size change works correctly
✓ Loading state displays during data fetch
✓ Handles empty trace list
✓ Sorting functionality (flow_session, turn_number)
✓ Navigation to trace detail on row click
```

**TraceViewer.vue** (Currently 0 tests, Target: 8-10 tests)
```typescript
// Test cases needed:
✓ Displays trace details correctly
✓ Shows conversation context (previous turns)
✓ Renders AnnotationForm component
✓ Previous/Next trace navigation buttons
✓ Updates when trace prop changes
✓ Handles missing context gracefully
✓ Loading state during data fetch
✓ Error handling for missing trace
```

##### TIER 2 - Supporting Components (Medium Impact)

**HomeView.vue** (Currently 0 tests, Target: 5-7 tests)
```typescript
// Test cases needed:
✓ Displays statistics cards correctly
✓ Fetches and displays user stats
✓ Recent annotations list renders
✓ Quick action buttons navigate correctly
✓ Handles empty recent annotations list
✓ Number animations trigger on mount
✓ Error handling for failed stats fetch
```

**AppHeader.vue** (Currently 0 tests, Target: 3-5 tests)
```typescript
// Test cases needed:
✓ Renders navigation menu
✓ Active link highlighting
✓ Navigation to correct routes
✓ Responsive menu behavior
✓ User info display (if applicable)
```

### 2. Service Layer Tests (Target: 10-15 tests)

**api.ts** - apiService

```typescript
// Test cases needed:
✓ Creates axios instance with correct base URL
✓ Injects Clerk token in Authorization header
✓ Handles missing token gracefully
✓ importCSV() constructs correct form data
✓ importCSV() sends POST to /api/traces/import-csv
✓ getTraces() sends correct pagination params
✓ getTrace() constructs correct URL
✓ saveAnnotation() sends correct annotation data
✓ getAnnotationForTrace() sends correct trace ID
✓ getUserStats() retrieves user statistics
✓ Handles 401 errors (unauthorized)
✓ Handles 404 errors (not found)
✓ Handles 500 errors (server errors)
✓ Handles network errors
✓ Response data parsing
```

### 3. E2E Tests (Playwright) - Expand Existing (Target: 15-20 tests)

#### Critical User Workflows

**CSV Import Complete Workflow** (1 test already)
- Enhance existing test with:
  - Partial CSV import (skipped duplicates)
  - Large file handling
  - Different CSV formats
  - Error recovery

**Annotation Complete Workflow** (Expand existing)
```typescript
// Test cases needed:
✓ Import CSV → View Trace → Create Annotation → View Updated List
✓ Update existing annotation (version increment)
✓ Edit annotation multiple times
✓ Delete annotation (if supported)
✓ Pass and Fail annotation paths
```

**Navigation Flows** (1 test already, expand)
```typescript
// Test cases needed:
✓ Home → Import CSV → View Traces → Trace Detail → Home
✓ Multi-page navigation through traces
✓ Previous/Next trace navigation
✓ Statistics updates on home page
```

**Error Scenarios**
```typescript
// Test cases needed:
✓ Invalid CSV format handling
✓ Network error recovery
✓ Duplicate trace import handling
✓ Missing required trace fields
✓ Authentication timeout
```

---

## Backend Testing Strategy

### 1. Unit Tests (Pytest)

#### API Endpoint Tests (Currently 11, Target: 30-40)

##### auth.py Routes (Target: 8-10 tests)

```python
# POST /api/auth/webhook
✓ Valid webhook with user.created event
✓ Valid webhook with user.updated event
✓ Valid webhook with user.deleted event
✓ Webhook signature verification passes
✓ Webhook signature verification fails
✓ Webhook with invalid event type (ignored)
✓ Webhook processing errors handled
✓ Webhook creates user in database
✓ Webhook updates user in database
✓ User deletion removes from database

# GET /api/auth/me
✓ Returns current user with valid token
✓ Returns 401 with missing token
✓ Returns 401 with invalid token
✓ Creates new user if doesn't exist
✓ Returns existing user from database
```

##### traces.py Routes (Target: 12-15 tests - Currently has some)

```python
# POST /api/traces/import-csv
✓ Valid CSV import (coverage expansion)
✓ Column mapping with various formats
✓ Duplicate trace detection and skipping
✓ CSV with fewer than 6 required columns
✓ Empty CSV handling
✓ Large CSV file (stress test)
✓ CSV with special characters/unicode
✓ Malformed CSV (missing quotes, invalid format)
✓ NaN value handling
✓ Turn number and total turns validation
✓ Database insertion failure handling
✓ File size validation (10MB limit)
✓ File extension validation

# GET /api/traces (pagination)
✓ First page retrieval
✓ Subsequent page retrieval
✓ Custom page size handling
✓ Total count calculation
✓ Sorting by flow_session and turn_number
✓ Empty traces collection handling

# GET /api/traces/{trace_id}
✓ Valid trace retrieval
✓ Trace not found (404)
✓ Context retrieval (previous turns)
✓ Context empty for turn 1
✓ NaN value cleaning in response
```

##### annotations.py Routes (Target: 12-15 tests - Currently has some)

```python
# POST /api/annotations
✓ Create new annotation
✓ Update existing annotation
✓ Version increment on update
✓ Trace not found error (404)
✓ Invalid holistic_pass_fail value
✓ First failure note requirement for Fail
✓ Max length validation (256, 500, 1000 chars)
✓ Timestamp management
✓ User ID association
✓ Concurrent annotation updates
✓ Database insertion failure

# GET /api/annotations/trace/{trace_id}
✓ Get existing annotation
✓ Return None for non-existent annotation
✓ Filter by current user
✓ ObjectId serialization

# GET /api/annotations/user/stats
✓ Total annotations count
✓ Pass/fail split calculation
✓ Pass rate percentage calculation
✓ Pass rate with zero annotations
✓ Recent annotations ordering (5 most recent)
✓ Recent annotations excludes old ones
```

### 2. Model & Schema Tests (Target: 5-8 tests)

**TraceModel**
```python
✓ Valid trace model creation
✓ ObjectId serialization
✓ Field defaults
✓ Required field validation
✓ Invalid ObjectId handling
```

**AnnotationCreate Schema**
```python
✓ Valid annotation validation
✓ Failure note validator (Pass vs Fail)
✓ Max length constraints
✓ Required field validation
✓ Invalid pass_fail values
```

### 3. Database Tests (Target: 5-8 tests)

**MongoDB Connection**
```python
✓ Connection establishment
✓ Connection failure handling
✓ Index creation on startup
✓ Database isolation
✓ Cleanup on shutdown
✓ Multiple connection attempts
```

### 4. Integration Tests (Target: 5-8 tests)

**End-to-End API Flows**
```python
✓ Full CSV import → List → Get trace workflow
✓ Trace creation → Annotation creation workflow
✓ Multiple user annotations on same trace
✓ User stats accuracy across multiple operations
✓ CSV with duplicates and version increment
```

---

## Testing Best Practices by Layer

### Unit Tests
- Test single functions/methods in isolation
- Mock external dependencies (API calls, database)
- Fast execution (< 100ms per test)
- High granularity (test one behavior per test)
- Use descriptive test names

### Integration Tests
- Test multiple components working together
- Can use real database (test database)
- Verify data flow between layers
- Test with realistic data
- Medium execution time (100ms - 1s per test)

### E2E Tests
- Test complete user workflows
- Use real application (or very close simulation)
- Test from user perspective
- Slow but high value
- Minimal mocking (only external services)

---

## Testing Checklist by Component

### Frontend Components
- [ ] Component renders without errors
- [ ] Props are received and used correctly
- [ ] Events/emits work as expected
- [ ] User interactions trigger correct handlers
- [ ] Loading states display
- [ ] Error states display
- [ ] Empty states handled
- [ ] Conditional rendering works
- [ ] Form validation rules apply
- [ ] API errors handled gracefully
- [ ] Accessibility basics (labels, roles)

### Backend Endpoints
- [ ] Valid request succeeds (200/201)
- [ ] Invalid request fails appropriately (400)
- [ ] Not found returns 404
- [ ] Unauthorized returns 401/403
- [ ] Server error returns 500
- [ ] Response schema matches OpenAPI spec
- [ ] Pagination works correctly
- [ ] Filtering works correctly
- [ ] Sorting works correctly
- [ ] Data validation occurs before database operations
- [ ] Timestamps are set correctly
- [ ] User context is correctly applied

---

## Testing Execution Plan

### Phase 1 - Foundation (Week 1-2)
1. **Backend Unit Tests** - Start with API endpoints
   - Auth endpoints
   - CSV import validation
   - Annotation CRUD
   - Stats calculation

2. **Frontend Service Tests** - API service layer
   - Token injection
   - Request construction
   - Error handling

**Target**: 25-30 new tests, 40+ total tests

### Phase 2 - Components (Week 2-3)
1. **Critical Component Tests**
   - CsvImporter
   - AnnotationForm
   - TraceList

2. **Supporting Component Tests**
   - HomeView
   - AppHeader

**Target**: 35-40 new tests, 75+ total tests

### Phase 3 - E2E & Integration (Week 3-4)
1. **E2E Workflow Tests**
   - CSV import complete flow
   - Annotation workflow
   - Navigation flows

2. **Integration Tests**
   - End-to-end API flows
   - Multi-user scenarios

**Target**: 20-25 new tests, 95-120 total tests

### Phase 4 - Coverage & Refinement (Week 4)
1. **Edge Cases & Error Scenarios**
2. **Performance Tests**
3. **Accessibility Tests**
4. **Documentation**

**Target**: 125+ tests, 80%+ coverage

---

## Code Coverage Goals

### Frontend
- **Current**: ~5% (1 test file)
- **Target**: 75-80%
- **Focus Areas**:
  - Components: 80%+
  - Services: 90%+
  - Views: 70%+
  - Utils: 85%+

### Backend
- **Current**: ~20% (11 tests)
- **Target**: 80-85%
- **Focus Areas**:
  - API endpoints: 85%+
  - Models/Schemas: 90%+
  - Database layer: 75%+
  - Utils: 85%+

---

## CI/CD Integration

### Pre-commit Hooks
```bash
npm run lint       # Frontend linting
npm run type-check # Frontend type checking
pytest --tb=short  # Backend quick test
```

### GitHub Actions / GitLab CI
```yaml
# Frontend
- npm install
- npm run lint
- npm run type-check
- npm run test:unit
- npm run test:e2e (with server)

# Backend
- pip install -r requirements.txt
- black --check .
- isort --check-only .
- pytest --cov=app --cov-report=xml
```

### Test Requirements for Merge
- All tests passing
- No coverage decrease
- Code style compliance
- Type checking success

---

## Debugging & Troubleshooting

### Frontend
```bash
# Run tests in watch mode
npm run test:unit -- --watch

# Run single test file
npm run test:unit src/components/__tests__/CsvImporter.spec.ts

# Debug in browser
npm run test:e2e -- --debug

# View Playwright traces
playwright show-trace trace.zip
```

### Backend
```bash
# Run specific test
pytest backend/test_api.py::TestCSVImport

# Verbose output
pytest -vv -s

# Stop on first failure
pytest -x

# Show print statements
pytest -s
```

---

## Tools & Configuration

### Frontend Testing Tools
- **vitest**: Fast unit test runner
- **@vue/test-utils**: Component testing utilities
- **@testing-library/vue**: User-centric testing
- **playwright**: E2E browser automation
- **jsdom**: DOM simulation

### Backend Testing Tools
- **pytest**: Test framework
- **pytest-asyncio**: Async test support
- **pytest-cov**: Coverage reporting
- **mongomock**: MongoDB mocking (optional)
- **responses**: HTTP mocking (optional)

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Total Tests | 17 | 125 | 4 weeks |
| Test Coverage (Frontend) | 5% | 75% | 4 weeks |
| Test Coverage (Backend) | 20% | 85% | 4 weeks |
| E2E Tests | 5 | 20 | 3 weeks |
| Component Tests | 1 | 35 | 3 weeks |
| API Tests | 11 | 40 | 2 weeks |
| Avg Test Runtime | - | <5min | ongoing |
| CI Success Rate | - | 99%+ | ongoing |

---

## Maintenance & Upkeep

### Monthly Review
- Check test coverage trends
- Identify flaky tests
- Update test fixtures
- Review new dependencies

### Quarterly Audit
- Test effectiveness review
- Coverage gap analysis
- Performance optimization
- Documentation update

### Continuous Improvements
- Add tests for bug fixes (regression prevention)
- Update tests for feature changes
- Refactor test utilities for reuse
- Monitor and optimize slow tests

