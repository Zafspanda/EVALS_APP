<template>
  <n-card title="Annotation" :bordered="false">
    <!-- SECTION 1: Quick Actions (always visible) -->
    <n-space justify="center" style="margin-bottom: 16px">
      <n-button
        type="success"
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
          maxlength="1000"
          show-count
        />
        <n-space justify="end" style="margin-top: 8px">
          <n-button @click="clearPassComment">Cancel</n-button>
          <n-button type="primary" @click="savePassWithComment" :loading="saving">
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
    <n-alert v-if="existingAnnotation" type="info" style="margin-top: 16px" role="status" aria-live="polite">
      <template #header>Existing Annotation</template>
      You have previously annotated this trace as: {{ existingAnnotation.holistic_pass_fail }}
      (Version {{ existingAnnotation.version }}).
      Using quick actions will update your annotation.
    </n-alert>
  </n-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NSpace, NButton, NCollapse, NCollapseItem,
  NInput, NForm, NFormItem, NAlert, useMessage, FormInst, FormRules
} from 'naive-ui'
import { apiService } from '@/services/api'

const props = defineProps<{
  traceId: string
  existingAnnotation?: any
}>()

const emit = defineEmits(['save-success'])

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)

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
    emit('save-success')
    await goToNext()
  } catch (error) {
    message.error('Failed to save annotation')
    console.error('Error saving annotation:', error)
  } finally {
    saving.value = false
  }
}

const handleSkip = async () => {
  navigating.value = true
  try {
    await goToNext()
  } finally {
    navigating.value = false
  }
}

const handleMarkAsFail = () => {
  showFailForm.value = true
}

const saveFailure = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true
    await apiService.saveAnnotation({
      trace_id: props.traceId,
      holistic_pass_fail: 'Fail',
      first_failure_note: formValue.first_failure_note,
      open_codes: formValue.open_codes || undefined,
      comments_hypotheses: formValue.comments_hypotheses
    })
    message.success('Failure annotated successfully')
    emit('save-success')
    await goToNext()
  } catch (error: any) {
    if (error.message) {
      message.error('Please check the form for errors')
    } else {
      message.error('Failed to save annotation')
      console.error('Error saving annotation:', error)
    }
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
    emit('save-success')
    await goToNext()
  } catch (error) {
    message.error('Failed to save annotation')
    console.error('Error saving annotation:', error)
  } finally {
    saving.value = false
  }
}

const clearPassComment = () => {
  passComment.value = ''
}

const goToNext = async () => {
  try {
    const response = await apiService.getNextUnannotatedTrace()
    if (response.trace_id) {
      router.push(`/trace/${response.trace_id}`)
    } else {
      message.success('All traces have been annotated!')
      router.push('/traces')
    }
  } catch (error) {
    message.error('Failed to find next unannotated trace')
    console.error('Error getting next unannotated trace:', error)
    throw error
  }
}

const loadExistingAnnotation = () => {
  if (props.existingAnnotation) {
    // If there's an existing annotation, populate the fail form if it was a failure
    if (props.existingAnnotation.holistic_pass_fail === 'Fail') {
      showFailForm.value = true
      formValue.first_failure_note = props.existingAnnotation.first_failure_note || ''
      formValue.open_codes = props.existingAnnotation.open_codes || ''
      formValue.comments_hypotheses = props.existingAnnotation.comments_hypotheses || ''
    } else {
      // For pass, just populate the comment
      passComment.value = props.existingAnnotation.comments_hypotheses || ''
    }
  }
}

const resetForm = () => {
  showFailForm.value = false
  passComment.value = ''
  formValue.open_codes = ''
  formValue.first_failure_note = ''
  formValue.comments_hypotheses = ''

  // Load existing annotation if available
  if (props.existingAnnotation) {
    loadExistingAnnotation()
  }
}

// Watch for changes in existing annotation prop
watch(() => props.existingAnnotation, () => {
  loadExistingAnnotation()
})

// Watch for trace ID changes
watch(() => props.traceId, () => {
  resetForm()
})

onMounted(() => {
  loadExistingAnnotation()
})
</script>
