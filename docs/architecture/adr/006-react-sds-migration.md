# ADR-006: Migration to React + Sendle Design System

**Status:** Accepted
**Date:** 2025-11-23
**Deciders:** BMad Product Team
**Consulted:** Winston (Architect), Sarah (UX Designer)
**Supersedes:** [ADR-001: Technology Stack Selection](./001-technology-stack.md) (Frontend only)

---

## Context

During Sprint 1, we successfully implemented Story 1 using Vue 3 + Naive UI. However, before beginning Story 2, a critical strategic issue emerged:

**The Problem:**
- Sendle (our internal stakeholder) uses Sendle Design System (SDS) built on React
- Continuing with Vue 3 + Naive UI creates:
  - UX inconsistency with Sendle's ecosystem
  - Duplicated design patterns
  - Maintenance burden (two component libraries)
  - Limited internal support and collaboration

**The Opportunity:**
- SDS provides production-ready React components aligned with Sendle's design language
- Alignment with SDS enables knowledge sharing with Sendle engineering teams
- Future integrations with Sendle platform simplified
- Access to SDS improvements and updates

**Timing:**
- Sprint 1 completed only basic UI (dashboard + evaluation view)
- No complex state management or advanced Vue patterns yet implemented
- Migration cost is minimal NOW vs. after Story 2 (which adds IAA, advanced filtering, real-time sync)

---

## Decision

We will migrate the frontend from **Vue 3 + Naive UI** to **React + Sendle Design System**.

### New Frontend Stack

**Framework & Language:**
- React 18.3+ (replacing Vue 3.5)
- TypeScript 5.3+ (unchanged)
- Vite 5+ (unchanged - works with React)

**UI Library:**
- Sendle Design System (SDS) (replacing Naive UI)
- Component library built on React
- Aligned with Sendle's design language

**State Management:**
- React Context API + hooks (replacing Pinia)
- No external state library needed for current scope

**HTTP Client:**
- Axios 1.6+ (unchanged)

### Backend Stack (UNCHANGED)

**No changes to backend:**
- FastAPI 0.104.1
- MongoDB 7.0
- Redis 7.2
- Clerk authentication
- Railway deployment

All backend architecture decisions from ADR-001 remain valid.

---

## Alternatives Considered

### Alternative 1: Continue with Vue 3 + Naive UI

**Pros:**
- No migration cost
- Sprint 1 work remains valid
- Familiar stack

**Cons:**
- UX divergence from Sendle ecosystem
- No internal SDS support
- Duplicated design patterns
- Limited collaboration with Sendle teams

**Decision:** ❌ Rejected - Strategic misalignment outweighs migration cost

---

### Alternative 2: Build SDS-like Theme for Naive UI

**Pros:**
- Keeps Vue stack
- Maintains visual consistency

**Cons:**
- Duplicates SDS design tokens manually
- No automatic SDS updates
- Still requires maintaining custom theme
- Doesn't solve collaboration issue

**Decision:** ❌ Rejected - Reimplementing SDS defeats purpose of alignment

---

### Alternative 3: Delay Migration to Post-MVP

**Pros:**
- Complete MVP first
- Defer migration cost

**Cons:**
- Migration cost grows exponentially with each story
- Story 2 adds IAA, real-time sync, advanced state → much harder to migrate
- Organizational misalignment solidifies
- Technical debt accumulates

**Decision:** ❌ Rejected - "Pay now or pay 10x later"

---

### Alternative 4: React + Sendle Design System (CHOSEN)

**Pros:**
- Full alignment with Sendle ecosystem
- Production-ready component library
- Internal SDS team support
- Access to SDS improvements
- Easier integration with Sendle platform
- Knowledge sharing with Sendle engineering

**Cons:**
- Sprint 1 code needs migration (Vue → React)
- Learning curve for Vue-familiar developers
- 1-2 week migration timeline

**Decision:** ✅ Accepted - Strategic benefits outweigh short-term migration cost

---

## Migration Strategy

### Phase 0: Scaffold Setup
- Initialize React + TypeScript + Vite project
- Install SDS dependencies
- Configure build pipeline
- Set up routing (React Router)

### Phase 1: Core Infrastructure
- Migrate authentication (Clerk React SDK)
- Migrate API client layer (Axios - minimal changes)
- Set up React Context for state management

### Phase 2: Component Migration
- Dashboard view (Vue → React)
- Evaluation view (Vue → React)
- Import view (Vue → React)
- Trace viewer component
- Annotation form component

### Phase 3: Testing & Validation
- Playwright E2E tests (update selectors)
- Manual testing of all user flows
- Performance validation

### Phase 4: Deployment
- Deploy to Railway staging
- Smoke testing
- Production deployment

**Estimated Timeline:** 1-2 weeks (before Story 2 begins)

**Detailed Implementation Guide:** See [migration-implementation-guide.md](/docs/migration-implementation-guide.md)

---

## Consequences

### Positive

**Strategic Alignment:**
- ✅ UX consistency with Sendle ecosystem
- ✅ Access to SDS component library and updates
- ✅ Internal support from Sendle SDS team
- ✅ Easier future integrations

**Technical Benefits:**
- ✅ Production-ready component library (buttons, forms, tables, modals)
- ✅ Accessible components (WCAG 2.1 AA compliant)
- ✅ Responsive design built-in
- ✅ React ecosystem (larger community, more resources)

**Organizational:**
- ✅ Knowledge sharing with Sendle engineering teams
- ✅ Reusable patterns across Sendle products
- ✅ Reduced maintenance burden

### Negative

**Migration Cost:**
- ⚠️ 1-2 weeks to migrate existing Vue components to React
- ⚠️ Learning curve for developers unfamiliar with React
- ⚠️ Sprint 1 code rewritten (but minimal - only basic UI implemented)

**Dependency:**
- ⚠️ Coupled to SDS release cycle
- ⚠️ Breaking changes in SDS require updates

**Trade-offs:**
- ⚠️ Lost Vue's template simplicity (but gained React's flexibility)
- ⚠️ More verbose component code (but industry standard patterns)

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SDS missing required components | High | Low | Build custom components using SDS tokens as fallback |
| Migration takes longer than 2 weeks | Medium | Medium | UX design spec provides clear component mapping |
| Breaking changes in SDS | Medium | Low | Pin SDS version, upgrade deliberately |
| Developer learning curve | Low | Medium | React has more resources/tutorials than Vue |

---

## Implementation Notes

### What Changes
- **Frontend Framework:** Vue 3 → React 18
- **UI Library:** Naive UI → Sendle Design System
- **State Management:** Pinia → React Context + hooks
- **Component Patterns:** Vue SFC → React FC with TypeScript
- **Routing:** Vue Router → React Router

### What Stays the Same
- **Backend:** FastAPI (100% unchanged)
- **Database:** MongoDB (100% unchanged)
- **Auth:** Clerk (SDK changes from @clerk/vue → @clerk/clerk-react)
- **Build Tool:** Vite (React plugin instead of Vue plugin)
- **Language:** TypeScript (unchanged)
- **Deployment:** Railway (unchanged)

### API Compatibility
- All backend APIs remain unchanged
- No API endpoint modifications required
- Request/response formats identical
- Only frontend component layer changes

---

## Success Criteria

Migration is considered successful when:

1. ✅ All Sprint 1 features work identically in React
2. ✅ Playwright E2E tests pass (with updated selectors)
3. ✅ All components use SDS (no custom UI)
4. ✅ Performance matches or exceeds Vue version
5. ✅ Code review by Winston (Architect) passes
6. ✅ Deployed to Railway production successfully

---

## Documentation Updates

### Created Documents
- [Course-correction-SDS.md](/docs/Course-correction-SDS.md) - Strategic rationale
- [ux-design-specification.md](/docs/ux-design-specification.md) - UX blueprint
- [migration-implementation-guide.md](/docs/migration-implementation-guide.md) - Technical guide

### Archived Documents
- [tech-spec-vue-deprecated.md](/docs/archive-vue/tech-spec-vue-deprecated.md) - Original Vue spec

### Updated Documents
- [ADR-001](./001-technology-stack.md) - Marked as SUPERSEDED (frontend only)
- [sprint-status.yaml](/docs/sprint-status.yaml) - Migration as P0 blocker

---

## Related ADRs

- **Supersedes:** [ADR-001: Technology Stack Selection](./001-technology-stack.md) (Frontend decisions only)
- **Unchanged:** [ADR-004: Quick Action Annotation Workflow](./004-quick-actions-ux.md) (Framework-agnostic UX pattern)
- **Unchanged:** [ADR-005: Unannotated Query Optimization](./005-unannotated-query-optimization.md) (Backend optimization)

---

## Review History

**Initial Decision:** 2025-11-23 (BMad Product Team + Winston + Sarah)
**Status:** ✅ Approved - Migration greenlit before Story 2

---

**Next Steps:**
1. Winston (Architect) executes migration per [migration-implementation-guide.md](/docs/migration-implementation-guide.md)
2. Track progress in [migration-status.yaml](/docs/migration-status.yaml)
3. Update architecture-overview.md post-migration with React component hierarchy
