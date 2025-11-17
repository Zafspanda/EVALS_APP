# UX Enhancement: Quick Action Annotation Workflow
## IMPLEMENTATION PLAN - PHASE 1

**Date:** November 17, 2025
**Designer:** Sally (UX Designer)
**Approved By:** BMad (Product Owner)
**Sprint:** 1 (Post-Story 1 Enhancement)
**Status:** READY TO IMPLEMENT

---

## 🎯 Executive Summary

During live UX testing session, BMad identified critical workflow inefficiency: **annotators only need detailed forms for failures, not passes**. Most traces pass, making manual "Pass" clicking tedious. This enhancement introduces quick action buttons to streamline the annotation workflow.

**Key Insight:** In open coding evaluation, skipping a trace = passing it. Only failures require detailed annotation.

---

## 📋 What We're Building (Phase 1)

### **Quick Action Buttons**
Three primary actions replacing the need to always fill out the full form:

1. **"Pass & Next"** - Primary action (large, green button)
   - Saves trace as Pass
   - Auto-navigates to next unannotated trace
   - No form required
   - Optional: Can add comment via collapsed section

2. **"Skip"** - Secondary action
   - Leaves trace completely unannotated (gray ○ status)
   - Navigates to next unannotated trace
   - Trace appears in future "unannotated" batches
   - Use case: Need more context, defer to SME, uncertain

3. **"Mark as Fail"** - Warning/danger action (red)
   - Shows full annotation form inline
   - Requires:
     - Open codes (currently text input, Story 2 will make multi-select)
     - First failure note (required)
     - Comments/hypothesis (required for failures)
   - Saves as Fail + navigates to next

### **Conditional Form Display**
- **Default:** Quick actions visible, form hidden
- **After "Mark as Fail":** Form appears inline with required fields
- **For Pass (optional):** Collapsed "Add comment" section

---

## 🎨 Visual Design Specification

### **Default State (New Trace)**
```
┌─────────────────────────────────────────────────────┐
│ Trace: f40c9d70-c066-11f0-b2d8-4db8bfe5ddd8         │
├─────────────────────────────────────────────────────┤
│ Session    | f4099030-c066-11f0-b2d8-4db8bfe5ddd8   │
│ Turn       | 1 / 4                                  │
│ Imported   | 14/11/2025, 08:35:36                  │
├─────────────────────────────────────────────────────┤
│ [User message and AI response displayed above]      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Quick Actions:                                      │
│  [✓ Pass & Next]  [⏭ Skip]  [✗ Mark as Fail]       │
│                                                      │
│  ▶ Add optional comment to this pass                │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### **After "Mark as Fail" Clicked**
```
┌─────────────────────────────────────────────────────┐
│  ✗ Failure Annotation                               │
├─────────────────────────────────────────────────────┤
│  Open Codes: (comma-separated)                      │
│  [hallucination, constraint_violation...]           │
│                                                      │
│  First Failure Note: (Required)                     │
│  [Describe exact point of failure...]               │
│                                                      │
│  Comments/Hypothesis: (Required)                    │
│  [Analysis and context...]                          │
│                                                      │
│  [Save & Next]  [Cancel]                            │
└─────────────────────────────────────────────────────┘
```

### **Optional Pass Comment (Expanded)**
```
┌─────────────────────────────────────────────────────┐
│  ▼ Optional Pass Comment                            │
├─────────────────────────────────────────────────────┤
│  Comments: (Optional)                               │
│  [Leave note for SME or future reviewer...]         │
│                                                      │
│  [Save Comment & Next]  [Cancel]                    │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Details

### **Files to Modify**

#### **Frontend**
1. **`frontend/src/components/AnnotationForm.vue`**
   - Add quick action buttons section
   - Make form conditional (hidden by default)
   - Add "Mark as Fail" click handler to show form
   - Add "Pass & Next" handler to save + navigate
   - Add "Skip" handler to navigate only
   - Add collapsible "optional comment" section

2. **`frontend/src/components/TraceViewer.vue`** (minor)
   - No changes needed (already has navigation logic)
   - Quick actions will use existing `goToNextUnannotated()` function

#### **Backend**
- **No changes required** for Phase 1
- Existing POST `/api/annotations` already accepts optional fields
- Existing GET `/api/traces/next/unannotated` already implemented

### **Component Structure**

```vue
<!-- AnnotationForm.vue -->
<template>
  <n-card title="Annotation">
    <!-- SECTION 1: Quick Actions (always visible) -->
    <n-space justify="center" style="margin-bottom: 16px">
      <n-button
        type="success"
        size="large"
        @click="handlePassAndNext"
        :loading="saving"
      >
        ✓ Pass & Next
      </n-button>

      <n-button
        @click="handleSkip"
        :loading="navigating"
      >
        ⏭ Skip
      </n-button>

      <n-button
        type="error"
        @click="handleMarkAsFail"
      >
        ✗ Mark as Fail
      </n-button>
    </n-space>

    <!-- SECTION 2: Optional Pass Comment (collapsed) -->
    <n-collapse v-if="!showFailForm">
      <n-collapse-item title="▶ Add optional comment to this pass">
        <n-input
          type="textarea"
          v-model:value="passComment"
          placeholder="Leave note for SME or future reviewer..."
          :rows="3"
        />
        <n-space justify="end" style="margin-top: 8px">
          <n-button @click="clearPassComment">Cancel</n-button>
          <n-button type="primary" @click="savePassWithComment">
            Save Comment & Next
          </n-button>
        </n-space>
      </n-collapse-item>
    </n-collapse>

    <!-- SECTION 3: Fail Annotation Form (conditional) -->
    <n-card v-if="showFailForm" title="✗ Failure Annotation" style="margin-top: 16px">
      <n-form ref="formRef" :model="formValue" :rules="failRules">
        <n-form-item label="Open Codes" path="open_codes">
          <n-input
            v-model:value="formValue.open_codes"
            placeholder="e.g., hallucination, constraint_violation"
            maxlength="500"
            show-count
          />
        </n-form-item>

        <n-form-item label="First Failure Note" path="first_failure_note">
          <n-input
            v-model:value="formValue.first_failure_note"
            type="text"
            placeholder="Describe the first point of failure"
            maxlength="256"
            show-count
          />
        </n-form-item>

        <n-form-item label="Comments/Hypothesis" path="comments_hypotheses">
          <n-input
            v-model:value="formValue.comments_hypotheses"
            type="textarea"
            placeholder="Analysis and context (required for failures)"
            maxlength="1000"
            show-count
            :rows="4"
          />
        </n-form-item>

        <n-space justify="end">
          <n-button @click="cancelFail">Cancel</n-button>
          <n-button type="error" @click="saveFailure" :loading="saving">
            Save & Next
          </n-button>
        </n-space>
      </n-form>
    </n-card>

    <!-- Existing annotation notice (if present) -->
    <n-alert v-if="existingAnnotation" type="info" style="margin-top: 16px">
      <template #header>Existing Annotation</template>
      This trace was previously annotated as: {{ existingAnnotation.holistic_pass_fail }}
      (Version {{ existingAnnotation.version }})
    </n-alert>
  </n-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NSpace, NButton, NCollapse, NCollapseItem,
  NInput, NForm, NFormItem, NAlert, useMessage, FormRules
} from 'naive-ui'
import { apiService } from '@/services/api'

const props = defineProps<{
  traceId: string
  existingAnnotation?: any
}>()

const router = useRouter()
const message = useMessage()

const saving = ref(false)
const navigating = ref(false)
const showFailForm = ref(false)
const passComment = ref('')

const formValue = reactive({
  open_codes: '',
  first_failure_note: '',
  comments_hypotheses: ''
})

const failRules: FormRules = {
  first_failure_note: {
    required: true,
    message: 'First failure note is required for failures',
    trigger: 'blur'
  },
  comments_hypotheses: {
    required: true,
    message: 'Comments/hypothesis required for failures',
    trigger: 'blur'
  }
}

const handlePassAndNext = async () => {
  saving.value = true
  try {
    await apiService.saveAnnotation({
      trace_id: props.traceId,
      holistic_pass_fail: 'Pass',
      comments_hypotheses: passComment.value || undefined
    })
    message.success('Trace marked as Pass')
    await goToNext()
  } catch (error) {
    message.error('Failed to save annotation')
  } finally {
    saving.value = false
  }
}

const handleSkip = async () => {
  navigating.value = true
  await goToNext()
  navigating.value = false
}

const handleMarkAsFail = () => {
  showFailForm.value = true
}

const saveFailure = async () => {
  // Validate form
  saving.value = true
  try {
    await apiService.saveAnnotation({
      trace_id: props.traceId,
      holistic_pass_fail: 'Fail',
      first_failure_note: formValue.first_failure_note,
      open_codes: formValue.open_codes,
      comments_hypotheses: formValue.comments_hypotheses
    })
    message.success('Failure annotated successfully')
    await goToNext()
  } catch (error) {
    message.error('Failed to save annotation')
  } finally {
    saving.value = false
  }
}

const cancelFail = () => {
  showFailForm.value = false
  // Reset form
  formValue.open_codes = ''
  formValue.first_failure_note = ''
  formValue.comments_hypotheses = ''
}

const savePassWithComment = async () => {
  saving.value = true
  try {
    await apiService.saveAnnotation({
      trace_id: props.traceId,
      holistic_pass_fail: 'Pass',
      comments_hypotheses: passComment.value
    })
    message.success('Pass with comment saved')
    await goToNext()
  } catch (error) {
    message.error('Failed to save annotation')
  } finally {
    saving.value = false
  }
}

const clearPassComment = () => {
  passComment.value = ''
}

const goToNext = async () => {
  const response = await apiService.getNextUnannotatedTrace()
  if (response.trace_id) {
    router.push(`/trace/${response.trace_id}`)
  } else {
    message.success('All traces have been annotated!')
    router.push('/traces')
  }
}
</script>
```

---

## 📊 Field Requirements Matrix

| Action | holistic_pass_fail | open_codes | first_failure_note | comments_hypotheses |
|--------|-------------------|------------|-------------------|---------------------|
| **Pass & Next** | Pass | - | - | Optional |
| **Skip** | (not saved) | - | - | - |
| **Mark as Fail** | Fail | Text input | Required | Required |

---

## 🧪 Testing Checklist

### **Manual Testing Steps**

1. **Test "Pass & Next"**
   - [ ] Click button on unannotated trace
   - [ ] Verify trace saved with Pass status
   - [ ] Verify navigation to next unannotated trace
   - [ ] Check trace list shows green ✓ for passed trace

2. **Test "Skip"**
   - [ ] Click button on unannotated trace
   - [ ] Verify NO annotation saved
   - [ ] Verify navigation to next unannotated trace
   - [ ] Check trace list shows gray ○ (unannotated)

3. **Test "Mark as Fail"**
   - [ ] Click button
   - [ ] Verify form appears inline
   - [ ] Try to save without filling required fields → Should show validation errors
   - [ ] Fill all required fields and save
   - [ ] Verify trace saved with Fail status
   - [ ] Verify navigation to next unannotated trace
   - [ ] Check trace list shows red ✗ for failed trace

4. **Test Optional Pass Comment**
   - [ ] Expand "Add optional comment" section
   - [ ] Type comment
   - [ ] Click "Save Comment & Next"
   - [ ] Verify trace saved as Pass with comment
   - [ ] Check backend: annotation.comments_hypotheses should contain comment

5. **Test Cancel Behaviors**
   - [ ] Click "Mark as Fail", then "Cancel" → Form should hide
   - [ ] Expand pass comment, type text, then collapse → Text should persist

6. **Test with Existing Annotation**
   - [ ] Navigate to already-annotated trace
   - [ ] Verify "Existing Annotation" alert shows
   - [ ] Test quick actions still work (should update annotation)

7. **Test Edge Cases**
   - [ ] Last trace: "Pass & Next" should show "All traces annotated" message
   - [ ] Network error: Should show error message, not navigate
   - [ ] Very long failure note: Should respect 256 char limit

---

## 🚀 Implementation Steps (for UX Designer)

### **Step 1: Backup Current Code**
```bash
cd frontend/src/components
cp AnnotationForm.vue AnnotationForm.vue.backup
```

### **Step 2: Modify AnnotationForm.vue**
- Replace the existing template with new quick actions layout
- Add new reactive state variables (showFailForm, passComment, navigating)
- Add new handler functions (handlePassAndNext, handleSkip, handleMarkAsFail, etc.)
- Keep existing props and emits for compatibility

### **Step 3: Test Locally**
- Servers should already be running:
  - Backend: http://127.0.0.1:8000
  - Frontend: http://localhost:5173
- Navigate to trace detail page
- Test all quick actions
- Verify hot-reload works

### **Step 4: Iterate Based on Feedback**
- BMad will test live
- Make adjustments as needed
- Repeat until approved

### **Step 5: Document Changes (After Approval)**
- Create final documentation
- Update Story 1 acceptance criteria
- Note Story 2 impacts (open codes → multi-select)

---

## 📝 Story Impact Analysis

### **Story 1: Foundation & Core Evaluation**

**Modified Acceptance Criteria:**

**AC#4: Basic Annotation Form** (UPDATED)
- ~~Binary pass/fail radio buttons (required field)~~ **REPLACED with quick actions**
- Quick action buttons: "Pass & Next", "Skip", "Mark as Fail"
- First failure note shown only when "Mark as Fail" clicked (required)
- Open codes input shown only for failures (text input, 500 chars)
- Comments/hypotheses textarea (required for Fail, optional for Pass)
- ~~Save button with loading state~~ **REPLACED with contextual "Save & Next" buttons**
- Success message on save + auto-navigation to next unannotated trace

**New User Flow:**
1. User lands on trace detail page
2. Reviews trace content
3. Quick decision:
   - Pass → Click "Pass & Next" (one click, done)
   - Fail → Click "Mark as Fail", fill form, "Save & Next"
   - Uncertain → Click "Skip" (move to next, come back later)
4. System auto-navigates to next unannotated trace

**Impacts:**
- ✅ Faster annotation velocity (expected 30-50% improvement)
- ✅ Reduced cognitive load (default action is Pass)
- ✅ Clearer intent (Skip vs Pass distinction)
- ✅ Backwards compatible (existing annotations still work)

---

### **Story 2: Advanced Features & Export**

**Modified Requirements:**

**AC#1: Dynamic Label Columns from Rubric** (ENHANCED)

**Current (Story 1):**
```javascript
open_codes: "hallucination,constraint_violation,tone_mismatch"  // comma-separated string
```

**Story 2 Enhancement:**
```javascript
open_codes: {
  preset: ["hallucination", "constraint_violation"],  // Multi-select from admin config
  custom: ["edge_case_abc"]                           // Added on-the-fly
}

// OR use existing dynamic_labels pattern:
dynamic_labels: {
  "hallucination": true,
  "constraint_violation": true,
  "tone_mismatch": false,
  "edge_case_abc": true  // Custom code
}
```

**New Story 2 Requirements:**
- Admin panel to configure preset open codes
- Multi-select dropdown in fail form
- "+ Add Custom Code" functionality
- Auto-populate custom codes to preset list (optional admin approval)
- CSV import/export includes all selected codes

---

## 🔮 Future Enhancements (Post-Story 2)

### **Potential Features:**
1. **Keyboard Shortcuts**
   - `P` → Pass & Next
   - `F` → Mark as Fail
   - `S` → Skip
   - `Esc` → Cancel

2. **Batch Actions**
   - Select multiple traces
   - "Pass All Selected"
   - "Defer All to SME"

3. **SME Review Queue**
   - "Refer to SME" button (adds to review queue)
   - SME dashboard showing deferred traces
   - Comments thread per trace

4. **Annotation Templates**
   - Save common failure patterns
   - Quick apply to similar traces
   - Team-shared templates

5. **AI Suggestions**
   - Pre-fill likely open codes based on trace content
   - Suggest similar historical annotations
   - Confidence scoring

---

## 📚 References

### **Related Documents:**
- `docs/tech-spec.md` - Original technical specification
- `docs/sprint-artifacts/story-coding-platform-1.md` - Story 1 details
- `docs/sprint-artifacts/story-coding-platform-2.md` - Story 2 details

### **API Endpoints Used:**
- `POST /api/annotations` - Save annotation (existing)
- `GET /api/traces/next/unannotated` - Get next trace (Phase 1 enhancement)
- `GET /api/traces/{id}/adjacent` - Navigation (Phase 1 enhancement)

### **UI Components:**
- Naive UI documentation: https://www.naiveui.com/
- n-button, n-card, n-space, n-collapse, n-form, n-input, n-alert

---

## ✅ Definition of Done (Phase 1)

- [ ] Quick action buttons implemented and visible on trace detail page
- [ ] "Pass & Next" saves as Pass and navigates
- [ ] "Skip" navigates without saving
- [ ] "Mark as Fail" shows inline form with required fields
- [ ] Fail form validates required fields
- [ ] "Save & Next" on fail form saves and navigates
- [ ] Optional pass comment section works (collapsed by default)
- [ ] All existing annotations still load and display correctly
- [ ] No console errors in browser
- [ ] BMad has tested and approved UX
- [ ] Documentation created (this file)
- [ ] Code committed to repository

---

## 🎯 Success Metrics

**Before Enhancement:**
- Average time per Pass annotation: ~15 seconds (click Pass, click Save, wait, navigate)
- Average time per Fail annotation: ~60 seconds

**After Enhancement:**
- Target time per Pass: ~3 seconds (one click "Pass & Next")
- Target time per Fail: ~50 seconds (form only shown for failures)
- Expected velocity improvement: **30-50% faster annotation**

---

## 📞 Contact

**Questions or Issues?**
- **UX Designer:** Sally (this session)
- **Product Owner:** BMad
- **Implementation:** Dev agent (next session)

---

**Document Version:** 1.0
**Last Updated:** November 17, 2025
**Status:** READY TO IMPLEMENT ✅
