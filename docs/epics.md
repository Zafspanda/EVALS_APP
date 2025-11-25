# Epic: Open Coding Evaluation Platform

**Epic ID:** EVAL-001
**Epic Slug:** coding-platform
**Status:** In Planning
**Type:** New Feature Development
**Priority:** High
**Created:** November 14, 2025

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
├── Story 1: Foundation & Core Evaluation [EVAL-001-01]
│   ├── Project setup and authentication
│   ├── CSV import with validation
│   ├── Trace viewing interface
│   └── Basic annotation saving
│
└── Story 2: Advanced Features & Export [EVAL-001-02]
    ├── Dynamic label columns from rubric
    ├── Multi-user trace assignment
    ├── CSV/JSONL export
    └── Audit trail implementation
```

## Implementation Sequence

**Story 1 → Story 2** (Sequential - Story 1 must complete first)

1. **Story 1 (Week 1-2):** Build foundation with basic evaluation capability
   - Establishes project structure
   - Implements core data models
   - Creates basic UI for trace coding
   - Delivers working annotation system

2. **Story 2 (Week 2-3):** Add advanced features and export
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

- [ ] Can import 100-trace CSV without errors
- [ ] Can view and navigate between traces
- [ ] Can save all annotation types (pass/fail, codes, labels)
- [ ] Multiple users can work on same dataset
- [ ] Can export enriched CSV/JSONL
- [ ] Audit trail tracks all changes
- [ ] Deployed and accessible on Railway

---

**Epic Owner:** Product Team
**Technical Lead:** Development Team
**Target Completion:** 3 weeks from start