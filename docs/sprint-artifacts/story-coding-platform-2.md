# User Story: Advanced Features & Export

**Story ID:** EVAL-001-02
**Epic:** [EVAL-001: Open Coding Evaluation Platform](../epics.md)
**Status:** Ready for Development
**Points:** 5
**Sprint:** 1-2
**Created:** November 14, 2025
**Dependencies:** Story EVAL-001-01 must be complete

---

## Story

**As a** team lead evaluator,
**I want** to export annotated traces and support multiple evaluators working on the same dataset,
**So that** our team can efficiently complete evaluations and integrate results with our CI pipeline.

## Context

This story builds upon the foundation from Story 1, adding advanced features including dynamic label columns from the living rubric, multi-user trace assignment, comprehensive export functionality, and audit trail tracking. It completes the MVP requirements for the Open Coding Web Application.

## Acceptance Criteria

1. **Dynamic Label Columns from Rubric**
   - Can import living_rubric.csv file
   - System generates checkbox for each failure mode in rubric
   - Label columns appear dynamically in annotation form
   - Each label can be marked: true/false/N/A
   - Labels saved as `dynamic_labels` object in annotation

2. **Multi-User Trace Assignment**
   - Admin can see list of all users
   - Admin can assign trace ranges to users (e.g., User A: 1-50)
   - Users only see their assigned traces in list view
   - Dashboard shows user's progress (X of Y completed)
   - Prevent duplicate assignments

3. **Export Functionality**
   - Export button on dashboard with format options
   - CSV export includes all 28 input + 7 base + N dynamic columns
   - JSONL export for CI pipeline integration
   - Can filter export to golden set only (is_golden_set = true)
   - Export includes metadata (rubric version, export date)
   - Download starts immediately, shows progress for large exports

4. **Audit Trail Implementation**
   - Every annotation change logged to `audit_logs` collection
   - Log includes: timestamp, user, field, old value, new value
   - View audit history for any trace
   - Audit logs include annotation version numbers
   - Can see who changed what and when

5. **Enhanced Annotation Fields**
   - Add is_golden_set checkbox to annotation form
   - Add needs_support_clarification checkbox
   - Add taxonomy_category dropdown (6 predefined options)
   - All new fields included in export

6. **User Dashboard Enhancements**
   - Show completion statistics (traces coded, pass/fail ratio)
   - Display recently coded traces
   - Quick link to next uncoded trace
   - Progress bar for assigned traces
   - Export button when all traces complete

## Technical Requirements

### Frontend Components
- `RubricImporter.vue` - Import and parse living_rubric.csv
- `DynamicLabels.vue` - Render dynamic checkboxes
- `UserManager.vue` - Admin interface for assignments
- `ExportDialog.vue` - Export format selection
- `AuditHistory.vue` - View change history
- `UserDashboard.vue` - Enhanced dashboard with stats

### Backend Endpoints
```python
POST /api/rubric/import         # Import living rubric CSV
GET  /api/rubric                # Get current rubric
POST /api/traces/assign         # Assign traces to users
GET  /api/traces/my-traces      # Get user's assigned traces
POST /api/export/csv            # Generate CSV export
POST /api/export/jsonl          # Generate JSONL export
GET  /api/export/download/{job_id}  # Download exported file
GET  /api/audit/trace/{trace_id}    # Get audit history for trace
GET  /api/stats/user/{user_id}      # Get user statistics
```

### Database Schema Updates
```javascript
// Rubric document (new collection)
{
  "_id": ObjectId,
  "failure_modes": [
    {
      "name": "constraint_violation",
      "definition": "text",
      "pass_criteria": "text",
      "fail_criteria": "text"
    }
  ],
  "version": "1.0",
  "imported_at": Date,
  "imported_by": "user_id"
}

// Annotation document (updated)
{
  // ... existing fields ...
  "taxonomy_category": "Task Success|Escalation|Tool Failure|Knowledge Gap|Ambiguity|Other",
  "needs_support_clarification": Boolean,
  "is_golden_set": Boolean,
  "dynamic_labels": {
    "constraint_violation": true|false|null,
    "hallucination": true|false|null,
    // ... dynamically generated from rubric
  }
}

// Audit log document (new collection)
{
  "_id": ObjectId,
  "trace_id": "session_uuid_1",
  "user_id": "clerk_id",
  "timestamp": Date,
  "action": "update",
  "field": "holistic_pass_fail",
  "old_value": "Pass",
  "new_value": "Fail",
  "annotation_version": 2
}

// User assignment document (new collection)
{
  "_id": ObjectId,
  "user_id": "clerk_id",
  "assigned_traces": ["trace_id_1", "trace_id_2"],
  "assigned_range": "1-50",
  "assigned_at": Date,
  "assigned_by": "admin_id"
}
```

## Tasks

1. **[Rubric] Implement living rubric support** (AC: #1)
   - Create RubricImporter component
   - Parse CSV and store in MongoDB
   - Generate dynamic form fields
   - Update annotation model for dynamic_labels

2. **[Multi-User] Build user assignment system** (AC: #2)
   - Create UserManager admin interface
   - Implement trace assignment logic
   - Filter traces by user assignment
   - Add progress tracking

3. **[Export-CSV] Implement CSV export** (AC: #3)
   - Build export service with pandas
   - Merge all column types (input + base + dynamic)
   - Generate CSV with proper headers
   - Implement download endpoint

4. **[Export-JSONL] Add JSONL export** (AC: #3)
   - Create JSONL formatter
   - Add trace_id composite field
   - Filter golden set traces
   - Format for CI pipeline compatibility

5. **[Audit] Create audit trail system** (AC: #4)
   - Intercept all annotation updates
   - Log changes to audit collection
   - Build audit history viewer
   - Add version increment logic

6. **[Forms] Enhance annotation form** (AC: #5)
   - Add is_golden_set checkbox
   - Add needs_clarification checkbox
   - Add taxonomy dropdown
   - Update annotation save logic

7. **[Dashboard] Enhance user dashboard** (AC: #6)
   - Calculate and display statistics
   - Add progress visualization
   - Create quick navigation links
   - Show completion status

8. **[Integration] End-to-end testing**
   - Test complete flow with rubric
   - Verify multi-user assignments work
   - Validate export formats
   - Confirm audit trail completeness

## Definition of Done

- [ ] All acceptance criteria met and tested
- [ ] Dynamic labels working with sample rubric
- [ ] Multi-user assignments prevent conflicts
- [ ] CSV export matches 35+ column specification
- [ ] JSONL export works with CI pipeline format
- [ ] Audit trail captures all changes
- [ ] Dashboard shows accurate statistics
- [ ] Performance: Export 100 traces in < 5 seconds
- [ ] No regressions from Story 1 functionality
- [ ] API documentation updated

## Dev Notes

**Primary Context:** See [tech-spec.md](../tech-spec.md) for complete technical details.

**Key Implementation Details:**
- Use MongoDB aggregation for statistics
- Implement export as background job if > 100 traces
- Cache rubric in Redis for performance
- Use transactions for assignment changes
- Add indexes for audit log queries

**Critical Integrations:**
- Export format must match `traces/golden/golden.jsonl` specification
- Composite trace_id: `{flow_session}_{turn_number}`
- Dynamic labels must handle null as "N/A"

**Sample Files:**
- `living_rubric.csv` - Test with sample rubric file
- Validate against CI pipeline requirements

---

## Dev Agent Record

This record is for the DEV agent when implementing this story.

### Context Reference
- Tech Spec: `docs/tech-spec.md` - Complete implementation details
- Product Brief: `docs/_brief_evals_app.md` - Export requirements (Section 5.1)
- Story 1: `docs/sprint-artifacts/story-coding-platform-1.md` - Foundation to build on

### Agent Model
When executing this story, the agent should:
1. Verify Story 1 is complete and working
2. Start with rubric import (enables dynamic labels)
3. Test export formats against CI requirements
4. Ensure audit logging doesn't impact performance
5. Validate multi-user logic prevents conflicts

### Test Results
_To be filled by dev agent during implementation_

```
Test Run Date:
Tests Passed:
Tests Failed:
Coverage:
Notes:
```

### Implementation Notes
_To be filled by dev agent_

```
Start Date:
Completion Date:
Blockers Encountered:
Deviations from Spec:
Performance Metrics:
- CSV Export (100 traces):
- JSONL Export (100 traces):
- Audit Log Query:
```

---

## Review Notes

_To be filled during code review_

**Reviewer:**
**Date:**
**Status:**
**Comments:**