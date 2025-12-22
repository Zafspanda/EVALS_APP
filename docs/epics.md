# Epic: Open Coding Evaluation Platform

**Epic ID:** EVAL-001
**Epic Slug:** coding-platform
**Status:** In Progress (Story 1 Complete, Story 2 Blocked by Auth)
**Type:** New Feature Development
**Priority:** High
**Created:** November 14, 2025
**Updated:** December 22, 2025

## Deployment

| Environment | URL |
|-------------|-----|
| Frontend | https://frontend-production-52ba.up.railway.app |
| Backend | https://evalsapp-production.up.railway.app |
| API Docs | https://evalsapp-production.up.railway.app/docs |

---

## Epic Goal

Build a web application that enables systematic manual evaluation of AI chatbot conversation traces, allowing multiple evaluators to import CSV data, apply qualitative coding with dynamic annotations, and export enriched datasets for CI pipeline integration.

## Business Value

- **Efficiency Gain:** Reduce trace coding time from 5 minutes (spreadsheet) to < 2 minutes per trace
- **Data Integrity:** Eliminate manual copy-paste errors and maintain complete audit trails
- **Team Collaboration:** Enable multiple evaluators to work on same dataset simultaneously
- **Pipeline Integration:** Direct export to CI golden sets for automated validation

## Epic Scope

### In Scope
- CSV import with 28-column validation
- Turn-level trace evaluation interface
- Dynamic annotation forms based on living rubric
- Multi-user support (basic, no real-time sync)
- CSV/JSONL export with 35+ columns
- Audit trail for all changes
- User authentication via Clerk

### Out of Scope (Phase 2)
- Real-time collaboration features
- IAA metrics calculation
- Advanced filtering and search
- Alignment session workflows
- Keyboard shortcuts beyond basic save

## Success Criteria

1. **Functional:** Successfully import Sendle's 100-trace CSV and export enriched data
2. **Performance:** Page loads < 2 seconds, annotation save < 500ms
3. **Quality:** Zero data loss, complete audit trail
4. **Usability:** Evaluators can code traces in < 2 minutes each
5. **Integration:** Exported JSONL works with CI pipeline (`scripts/run_ci.py`)

## Story Map

```
Epic: Open Coding Evaluation Platform
├── Story 1: Foundation & Core Evaluation [EVAL-001-01] ✅ COMPLETE
│   ├── Project setup and authentication ✅
│   ├── CSV import with validation ✅
│   ├── Trace viewing interface ✅
│   └── Basic annotation saving ✅
│
├── Auth Fixes [IN PROGRESS] 🔐
│   ├── AUTH-001: Clerk token verification
│   ├── AUTH-002: Webhook signature verification
│   └── AUTH-003: Replace demo-user with real auth
│
└── Story 2: Advanced Features & Export [EVAL-001-02] ⏳ BLOCKED
    ├── Dynamic label columns from rubric
    ├── Multi-user trace assignment
    ├── CSV/JSONL export
    └── Audit trail implementation
```

## Implementation Sequence

**Story 1 → Auth Fixes → Story 2** (Sequential)

1. **Story 1:** Build foundation with basic evaluation capability ✅ **COMPLETE**
   - Establishes project structure
   - Implements core data models
   - Creates basic UI for trace coding
   - Delivers working annotation system
   - **Note:** Migrated from Vue to React + SDS (Dec 2025)

2. **Auth Fixes:** Enable multi-user support 🔐 **IN PROGRESS**
   - Branch: `feature/full-auth-completion`
   - Fixes AUTH-001, AUTH-002, AUTH-003
   - Required before Story 2 can start

3. **Story 2:** Add advanced features and export ⏳ **BLOCKED**
   - Builds on Story 1's foundation
   - Adds dynamic schema support
   - Implements export for CI integration
   - Completes multi-user support

## Technical Decisions

**Stack:** React 18.3 + Sendle Design System + FastAPI + MongoDB + Redis + Clerk Auth
**Deployment:** Railway (all-in-one platform)
**Key Libraries:** SDS UI, Pydantic, Motor, PapaParse

> **Note:** Story 1 was originally built in Vue 3, then migrated to React + SDS (Nov 2025). See [ADR-006](./architecture/adr/006-react-sds-migration.md) for details.

## Resources

- **Tech Spec:** [tech-spec.md](./tech-spec.md)
- **Product Brief:** [_brief_evals_app.md](./_brief_evals_app.md)
- **Story 1:** [story-coding-platform-1.md](./sprint-artifacts/story-coding-platform-1.md)
- **Story 2:** [story-coding-platform-2.md](./sprint-artifacts/story-coding-platform-2.md)

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSV schema variations | High | Validate all 28 columns on import |
| Performance with 100+ traces | Medium | Implement pagination early |
| Dynamic schema complexity | Medium | Use MongoDB's flexible documents |
| Multi-user conflicts | Low | Basic trace assignment prevents overlaps |

## Dependencies

- Clerk account for authentication
- Railway account for deployment
- MongoDB/Redis (provided by Railway)
- Sample CSV data for testing

## Acceptance Criteria

- [x] Can import 100-trace CSV without errors ✅ (Story 1)
- [x] Can view and navigate between traces ✅ (Story 1)
- [x] Can save all annotation types (pass/fail, codes, labels) ✅ (Story 1)
- [ ] Multiple users can work on same dataset ⏳ (Requires Auth Fixes)
- [ ] Can export enriched CSV/JSONL ⏳ (Story 2)
- [ ] Audit trail tracks all changes ⏳ (Story 2)
- [x] Deployed and accessible on Railway ✅ (Dec 22, 2025)

---

**Epic Owner:** Product Team
**Technical Lead:** Development Team
**Target Completion:** 3 weeks from start