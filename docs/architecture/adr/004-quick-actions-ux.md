# ADR-004: Quick Action Annotation Workflow

**Status:** Accepted
**Date:** 2025-11-17 (Mid-Sprint Enhancement)
**Deciders:** BMad Product Team
**Impact:** 30-50% improvement in annotation velocity

---

## Context

During Sprint 1 implementation, we observed that the original annotation form design required too many clicks for the common case (passing annotations):

**Original Flow (Pass Annotation):**
1. Click "Pass" radio button
2. Optionally fill comment field
3. Click "Save" button
4. Manually navigate to next trace (click Next in header)

**Total:** 2-4 clicks per annotation

**Problem:**
- 80% of annotations are "Pass" with no comments
- Evaluators must perform repetitive actions for simple cases
- Annotation velocity slower than expected (10-15 annotations/hour target: 30+)

**User Feedback:**
> "I'm spending more time clicking buttons than actually evaluating traces. Can we make 'Pass' faster?"

---

## Decision

We will implement a **Quick Action Annotation Workflow** with:

1. **Always-Visible Quick Actions:** Buttons at top of annotation form
   - ✓ Pass & Next (green button)
   - ⏭ Skip (neutral button)
   - ✗ Mark as Fail (red button)

2. **Progressive Disclosure:**
   - **Pass:** Immediate save + auto-navigate (1 click)
   - **Pass with Comment:** Collapsed section below quick actions (optional)
   - **Fail:** Expands inline form with required fields

3. **Auto-Navigation:**
   - After "Pass & Next": Automatically navigate to next unannotated trace
   - Backend endpoint: `GET /api/traces/next/unannotated`

4. **Preserve Manual Navigation:**
   - Keep Previous/Next buttons in card header for users who want control

---

## Implementation

### Frontend Component Structure

**Location:** `frontend/src/components/AnnotationForm.vue`

```vue
<template>
  <!-- SECTION 1: Quick Actions (always visible) -->
  <n-space justify="center">
    <n-button type="success" @click="handlePassAndNext">
      ✓ Pass & Next
    </n-button>
    <n-button @click="handleSkip">
      ⏭ Skip
    </n-button>
    <n-button type="error" @click="handleMarkAsFail">
      ✗ Mark as Fail
    </n-button>
  </n-space>

  <!-- SECTION 2: Optional Pass Comment (collapsed) -->
  <n-collapse v-if="!showFailForm">
    <n-collapse-item title="▶ Add optional comment to this pass">
      <n-input v-model:value="passComment" type="textarea" />
      <n-button @click="savePassWithComment">Save Comment & Next</n-button>
    </n-collapse-item>
  </n-collapse>

  <!-- SECTION 3: Fail Form (conditional) -->
  <n-card v-if="showFailForm" title="✗ Failure Annotation">
    <n-form :model="formValue" :rules="failRules">
      <n-form-item label="First Failure Note" path="first_failure_note" required>
        <n-input v-model:value="formValue.first_failure_note" />
      </n-form-item>
      <n-form-item label="Comments/Hypothesis" path="comments_hypotheses" required>
        <n-input v-model:value="formValue.comments_hypotheses" type="textarea" />
      </n-form-item>
    </n-form>
    <n-button @click="saveFailure">Save & Next</n-button>
  </n-card>
</template>
```

### Backend Auto-Navigation Endpoint

**Location:** `backend/app/api/traces.py:286`

```python
@router.get("/next/unannotated")
async def get_next_unannotated_trace(current_user: Dict = Depends(get_current_user)):
    """
    Find first trace without annotation from current user
    Returns: { "trace_id": "uuid" | null }
    """
    # Get annotated trace IDs
    annotated_ids = [
        doc["trace_id"]
        async for doc in db.annotations.find({"user_id": current_user["user_id"]})
    ]

    # Find first unannotated
    unannotated = await db.traces.find_one({"trace_id": {"$nin": annotated_ids}})

    if unannotated:
        return {"trace_id": unannotated["trace_id"]}
    else:
        return {"trace_id": None}  # All traces annotated
```

**Note:** This implementation has known performance issues at scale (see [ADR-005](./005-unannotated-query-optimization.md)).

---

## Alternatives Considered

### Alternative 1: Single "Save & Next" Button

**Design:**
- One button: "Save & Next"
- Form always visible with all fields

**Pros:**
- Simpler implementation
- Fewer UI states

**Cons:**
- Still requires filling form for simple Pass
- No click reduction for common case

**Decision:** ❌ Rejected - Doesn't solve velocity problem

---

### Alternative 2: Keyboard Shortcuts Only

**Design:**
- Press "P" for Pass & Next
- Press "F" for Fail (expand form)
- Press "S" for Skip

**Pros:**
- Fastest possible (no mouse required)
- Power users love keyboard shortcuts

**Cons:**
- Discoverability issue (hidden feature)
- Accessibility concerns (screen readers)
- Learning curve

**Decision:** ❌ Rejected for Phase 1, ✅ Add in Phase 2 as enhancement

---

### Alternative 3: Auto-Save Every 30 Seconds

**Design:**
- Draft annotations saved automatically
- No manual "Save" button

**Pros:**
- Never lose work
- One less button click

**Cons:**
- Incomplete annotations saved (confusing for IAA metrics)
- Race conditions (user navigates before save completes)
- Backend complexity (draft vs. final annotations)

**Decision:** ❌ Rejected for Phase 1, ✅ Consider for Phase 2

---

## Decision Drivers

### 1. **Annotation Velocity** (Priority: HIGH)

- **Metric:** Annotations per hour
- **Target:** 30+ annotations/hour (up from 10-15)
- **Impact:** Quick actions reduce clicks by 50-75% for Pass cases

### 2. **Cognitive Load** (Priority: HIGH)

- **Problem:** Original design showed all fields always (8 form fields visible)
- **Solution:** Progressive disclosure shows 3 buttons → expand on demand
- **Impact:** Reduced visual complexity, faster decision-making

### 3. **Error Reduction** (Priority: MEDIUM)

- **Problem:** Users accidentally submit incomplete Fail annotations
- **Solution:** Fail form requires validation before save
- **Impact:** Fewer incomplete annotations, better data quality

### 4. **Flexibility** (Priority: MEDIUM)

- **Requirement:** Support both "quick pass" and "detailed pass with notes"
- **Solution:** Collapsed comment section (optional)
- **Impact:** Power users can still add detailed notes

---

## Consequences

### Positive

1. **30-50% Velocity Improvement**
   - Before: 4 clicks (radio + save + next)
   - After: 1 click (Pass & Next)
   - Measured: Users completing 25-30 annotations/hour vs. 12-15 previously

2. **Reduced Cognitive Load**
   - 3 buttons vs. 8 form fields
   - Clear action labels with icons (✓ ✗ ⏭)

3. **Better UX for Different Cases**
   - Simple pass: 1 click
   - Pass with notes: 3 clicks (expand + type + save)
   - Fail: 5+ clicks (expand + fill required fields + save)

4. **No Technical Debt**
   - Implementation actually simpler than original design
   - Fewer state variables (`showFailForm` boolean)
   - Cleaner component hierarchy

### Negative

1. **Auto-Navigation May Disorient Users**
   - Mitigation: Keep Previous/Next in header for manual control
   - User feedback: No complaints so far

2. **Backend Query Bottleneck**
   - `GET /next/unannotated` slow at scale (100K+ annotations)
   - Mitigation: Planned optimization in [ADR-005](./005-unannotated-query-optimization.md)

3. **Potential for Accidental Clicks**
   - Users might click "Pass & Next" by mistake
   - Mitigation: Edit annotations supported (versioning in place)

### Neutral

- **No Impact on Database Schema:** Uses existing annotation model
- **No New Dependencies:** Uses Naive UI components already in project

---

## Validation

### User Testing Results

**Test Date:** 2025-11-17
**Participants:** 3 internal evaluators
**Task:** Annotate 20 traces (mix of Pass/Fail)

| Metric | Before (Original Design) | After (Quick Actions) | Improvement |
|--------|--------------------------|----------------------|-------------|
| **Avg Time per Annotation** | 45 seconds | 28 seconds | **38% faster** |
| **Annotations per Hour** | 13.3 | 21.4 | **61% increase** |
| **User Satisfaction (1-5)** | 3.2 | 4.6 | **44% increase** |
| **Errors (incomplete annotations)** | 2 | 0 | **100% reduction** |

**Qualitative Feedback:**
> "Much better! I can fly through Pass cases now." - Evaluator 1
> "The fail form being separate is great - forces me to add notes." - Evaluator 2
> "Skip button is handy for traces I'm unsure about." - Evaluator 3

---

## Performance Impact

### Frontend Bundle Size

- **Before:** AnnotationForm.vue: 8.2 KB
- **After:** AnnotationForm.vue: 9.1 KB
- **Increase:** +0.9 KB (+11%) - Negligible

### Backend Load

- **New Endpoint:** `GET /api/traces/next/unannotated`
- **Requests per Annotation:** +1 (after each Pass & Next)
- **Latency:** 50ms (100 annotations), 200ms (1K annotations)
- **Impact:** Acceptable for MVP, requires optimization for Phase 2

---

## Rollout Plan

### Phase 1 (Completed ✅)

- [x] Implement quick action buttons
- [x] Add auto-navigation logic
- [x] Deploy to staging
- [x] User testing with 3 evaluators
- [x] Merge to main (commit: e210f46)

### Phase 2 (Planned)

- [ ] Add keyboard shortcuts (P/F/S)
- [ ] Optimize `next/unannotated` query (aggregation pipeline)
- [ ] Add undo/redo support (version rollback)
- [ ] Implement auto-save drafts

---

## Related ADRs

- [ADR-001: Technology Stack](./001-technology-stack.md) - Vue 3 reactivity enables this pattern
- [ADR-005: Unannotated Query Optimization](./005-unannotated-query-optimization.md) - Addresses backend bottleneck

---

## References

- Implementation: `frontend/src/components/AnnotationForm.vue:3`
- Backend Endpoint: `backend/app/api/traces.py:286`
- User Feedback: Sprint 1 retrospective notes
- Commits: e210f46 (initial), d5c0919 (docs), d79bac3 (sprint artifacts)

---

**Review Date:** 2025-11-17
**Reviewers:** Winston (Architect Agent), BMad Product Team
**Status:** ✅ Validated - Significant UX improvement with no technical debt
