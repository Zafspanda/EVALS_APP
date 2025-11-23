# Project Documentation Index

**Project:** Open Coding Web Application (Evals_app)
**Status:** 🚨 **MIGRATION IN PROGRESS** - Vue → React + Sendle Design System
**Last Updated:** 2025-11-23

---

## 🚨 CRITICAL: Migration in Progress

**Before reading any technical documentation, understand the current state:**

We are actively migrating from Vue 3 + Naive UI → React + Sendle Design System.

**Current Implementation Status:**
- ✅ Sprint 1 (Story 1) completed in Vue 3
- 🔄 Migration in progress (React + SDS)
- ⏸️ Sprint 2 (Story 2) blocked until migration complete

**For Developers Starting Work:**
1. Read [Course-correction-SDS.md](./Course-correction-SDS.md) - Understand WHY
2. Read [ux-design-specification.md](./ux-design-specification.md) - Understand WHAT
3. Read [migration-implementation-guide.md](./migration-implementation-guide.md) - Understand HOW
4. Check [migration-status.yaml](./migration-status.yaml) - Track progress

---

## 📁 Documentation Structure

### 🎯 Current & Authoritative (Use These)

#### Migration Documents
- **[Course-correction-SDS.md](./Course-correction-SDS.md)** - Strategic rationale for Vue → React migration
- **[ux-design-specification.md](./ux-design-specification.md)** - Complete UX blueprint for React + SDS
- **[migration-implementation-guide.md](./migration-implementation-guide.md)** - Detailed migration execution plan (2000+ lines)
- **[migration-status.yaml](./migration-status.yaml)** - Component-by-component progress tracking

#### Business & Planning
- **[_brief_evals_app.md](./_brief_evals_app.md)** - Product Requirements Document (framework-agnostic)
- **[epics.md](./epics.md)** - Epic breakdown (EVAL-001)

#### Architecture (Backend - Still Valid)
- **[architecture/README.md](./architecture/README.md)** - Architecture documentation index
- **[architecture/database-design.md](./architecture/database-design.md)** - MongoDB schema design
- **[architecture/security-model.md](./architecture/security-model.md)** - Authentication & authorization
- **[architecture/scaling-strategy.md](./architecture/scaling-strategy.md)** - Performance optimization

#### Architecture Decision Records (ADRs)
- **[adr/006-react-sds-migration.md](./architecture/adr/006-react-sds-migration.md)** - ✅ CURRENT: React + SDS decision
- **[adr/004-quick-actions-ux.md](./architecture/adr/004-quick-actions-ux.md)** - UX enhancement (framework-agnostic)
- **[adr/005-unannotated-query-optimization.md](./architecture/adr/005-unannotated-query-optimization.md)** - Backend optimization
- **[adr/001-technology-stack.md](./architecture/adr/001-technology-stack.md)** - ⚠️ SUPERSEDED (frontend only)

#### Sprint Planning & Status
- **[sprint-status.yaml](./sprint-status.yaml)** - Current sprint progress
- **[bmm-workflow-status.yaml](./bmm-workflow-status.yaml)** - BMM methodology workflow tracking

#### Sprint Artifacts
- **[sprint-artifacts/story-coding-platform-1.md](./sprint-artifacts/story-coding-platform-1.md)** - Story 1: DONE (Vue implementation)
- **[sprint-artifacts/story-coding-platform-2.md](./sprint-artifacts/story-coding-platform-2.md)** - Story 2: BLOCKED (awaiting migration)

#### Supporting Documents
- **[automation-summary.md](./automation-summary.md)** - Test coverage and patterns
- **[sendle-button-analysis.md](./sendle-button-analysis.md)** - SDS button component research

---

### 📦 Historical / Archived (Reference Only)

#### Deprecated Vue Documentation
- **[archive-vue/tech-spec-vue-deprecated.md](./archive-vue/tech-spec-vue-deprecated.md)** - ⚠️ DEPRECATED: Original Vue 3 tech spec
  - **Backend sections still valid** (FastAPI, MongoDB, API design)
  - **Frontend sections obsolete** (Vue, Naive UI)
  - Preserved for Sprint 1 historical reference

#### Superseded ADRs
- **[adr/001-technology-stack.md](./architecture/adr/001-technology-stack.md)** - ⚠️ SUPERSEDED BY ADR-006 (frontend only)
  - Backend decisions (FastAPI, MongoDB, Redis, Clerk) remain valid

#### Completed Implementation Plans
- **[ux-enhancement-quick-actions-IMPLEMENTATION-PLAN.md](./ux-enhancement-quick-actions-IMPLEMENTATION-PLAN.md)** - ✅ IMPLEMENTED: Quick actions UX (Sprint 1)

---

## 🗺️ Navigation Guide by Role

### For Architects (Starting Migration)
**Read in this order:**
1. [Course-correction-SDS.md](./Course-correction-SDS.md) - Strategic context
2. [ux-design-specification.md](./ux-design-specification.md) - UX requirements
3. [migration-implementation-guide.md](./migration-implementation-guide.md) - Technical execution plan
4. [migration-status.yaml](./migration-status.yaml) - Track your progress here

**Ignore:**
- ❌ `archive-vue/tech-spec-vue-deprecated.md` (Vue sections)
- ❌ `adr/001-technology-stack.md` (frontend decisions)

**Reference for Backend:**
- ✅ `architecture/database-design.md`
- ✅ `architecture/security-model.md`
- ✅ `archive-vue/tech-spec-vue-deprecated.md` (sections 4-8: Backend, API, Database)

### For Product Managers
**Primary Documents:**
- [_brief_evals_app.md](./_brief_evals_app.md) - Business requirements
- [epics.md](./epics.md) - Feature breakdown
- [sprint-status.yaml](./sprint-status.yaml) - Current progress
- [Course-correction-SDS.md](./Course-correction-SDS.md) - Migration rationale

### For UX Designers
**Primary Documents:**
- [ux-design-specification.md](./ux-design-specification.md) - Complete UX spec
- [sendle-button-analysis.md](./sendle-button-analysis.md) - SDS component research
- [adr/004-quick-actions-ux.md](./architecture/adr/004-quick-actions-ux.md) - Quick actions pattern

### For QA/Testers
**Primary Documents:**
- [automation-summary.md](./automation-summary.md) - Test coverage baseline
- [migration-implementation-guide.md](./migration-implementation-guide.md) - Phase 3: Testing section
- [ux-design-specification.md](./ux-design-specification.md) - User flows to test

### For New Team Members
**Onboarding Reading List:**
1. This README (you're here!)
2. [_brief_evals_app.md](./_brief_evals_app.md) - What we're building and why
3. [Course-correction-SDS.md](./Course-correction-SDS.md) - Why we're migrating
4. [ux-design-specification.md](./ux-design-specification.md) - How it should look/behave
5. [architecture/README.md](./architecture/README.md) - System architecture

---

## 📊 Documentation Health

| Category | Current Docs | Deprecated Docs | Health Status |
|----------|--------------|-----------------|---------------|
| **Business Requirements** | 2 | 0 | ✅ Excellent |
| **Migration Planning** | 4 | 0 | ✅ Excellent |
| **Architecture** | 5 | 0 | ✅ Excellent |
| **ADRs** | 3 current | 1 superseded | ✅ Good |
| **Sprint Tracking** | 2 | 0 | ✅ Excellent |
| **Technical Specs** | 0 | 1 | ⚠️ Awaiting React tech spec post-migration |

**Overall Health:** ✅ **Excellent** - Clear separation of current vs. deprecated docs

---

## 🔄 Migration Tracking

**Current Phase:** Phase 0: React Scaffold Setup
**Next Milestone:** Phase 1: Core Infrastructure
**Blocking Story:** Story 2 (awaiting migration completion)

**Detailed Progress:** See [migration-status.yaml](./migration-status.yaml)

---

## 🚀 Quick Links

### Most Important Documents (Start Here)
1. [Course-correction-SDS.md](./Course-correction-SDS.md) - WHY migrate
2. [ux-design-specification.md](./ux-design-specification.md) - WHAT to build
3. [migration-implementation-guide.md](./migration-implementation-guide.md) - HOW to execute

### Backend APIs (Unchanged)
- API endpoints: See `archive-vue/tech-spec-vue-deprecated.md` Section 5
- Database models: [architecture/database-design.md](./architecture/database-design.md)
- Security: [architecture/security-model.md](./architecture/security-model.md)

### Sprint Planning
- Current sprint: [sprint-status.yaml](./sprint-status.yaml)
- Epic breakdown: [epics.md](./epics.md)
- Story 1 (DONE): [sprint-artifacts/story-coding-platform-1.md](./sprint-artifacts/story-coding-platform-1.md)
- Story 2 (BLOCKED): [sprint-artifacts/story-coding-platform-2.md](./sprint-artifacts/story-coding-platform-2.md)

---

## 📝 Contributing to Documentation

**When adding new documentation:**

1. **Determine category:**
   - Migration-related? → Add to "Migration Documents" section
   - Business requirements? → Add to "Business & Planning" section
   - Architecture? → Add to "Architecture" section
   - ADR? → Create new ADR in `architecture/adr/`

2. **Update this README:**
   - Add link in appropriate section
   - Update "Documentation Health" table
   - Update "Last Updated" date

3. **Cross-reference:**
   - Add links to related documents
   - Update migration-status.yaml if tracking migration progress

**When deprecating documentation:**

1. Move to `archive-vue/` or mark as SUPERSEDED in the document
2. Add deprecation notice at top with pointers to current docs
3. Update this README to move link to "Historical / Archived" section
4. Update any ADRs that reference the deprecated doc

---

## ❓ Questions?

**For migration questions:**
- See [migration-implementation-guide.md](./migration-implementation-guide.md) FAQ section
- Check [migration-status.yaml](./migration-status.yaml) blockers

**For business questions:**
- See [_brief_evals_app.md](./_brief_evals_app.md)
- Contact: BMad Product Team

**For technical questions:**
- Architecture: See [architecture/README.md](./architecture/README.md)
- Backend APIs: See `archive-vue/tech-spec-vue-deprecated.md` (backend sections only)

---

**Last Updated:** 2025-11-23
**Maintained By:** BMad Product Team
**Status:** ✅ Up to date
