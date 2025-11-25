# Architecture Documentation

This directory contains architectural decisions and design documentation for the Evals Open Coding Platform.

## Documents

- **[architecture-overview.md](./architecture-overview.md)** - System architecture overview, technology stack, and design patterns
- **[security-model.md](./security-model.md)** - Authentication, authorization, and data isolation strategy
- **[database-design.md](./database-design.md)** - MongoDB schema design and indexing strategy
- **[scaling-strategy.md](./scaling-strategy.md)** - Performance optimization and capacity planning
- **[adr/](./adr/)** - Architecture Decision Records (ADR) log

## Architecture Decision Records (ADR)

ADRs document significant architectural decisions made during development:

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./adr/001-technology-stack.md) | Technology Stack Selection | Accepted | 2025-11-14 |
| [ADR-002](./adr/002-authentication-provider.md) | Clerk for Authentication | Accepted | 2025-11-14 |
| [ADR-003](./adr/003-database-choice.md) | MongoDB for Primary Database | Accepted | 2025-11-14 |
| [ADR-004](./adr/004-quick-actions-ux.md) | Quick Action Annotation Workflow | Accepted | 2025-11-17 |
| [ADR-005](./adr/005-unannotated-query-optimization.md) | Aggregation Pipeline for Unannotated Queries | Proposed | 2025-11-17 |

## Review History

| Date | Reviewer | Type | Outcome |
|------|----------|------|---------|
| 2025-11-17 | Winston (Architect Agent) | Post-Implementation Review | GO with auth fixes |

## Quick Links

- [Technical Specification](../tech-spec.md)
- [Product Brief](../_brief_evals_app.md)
- [Sprint Artifacts](../sprint-artifacts/)
