<template>
  <n-card title="Annotation" :bordered="false">
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
    >
      <n-form-item label="Pass/Fail" path="holistic_pass_fail">
        <n-radio-group v-model:value="formValue.holistic_pass_fail">
          <n-space>
            <n-radio value="Pass">Pass</n-radio>
            <n-radio value="Fail">Fail</n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <n-form-item
        v-if="formValue.holistic_pass_fail === 'Fail'"
        label="First Failure Note"
        path="first_failure_note"
      >
        <n-input
          v-model:value="formValue.first_failure_note"
          type="text"
          placeholder="Describe the first point of failure (max 256 chars)"
          maxlength="256"
          show-count
        />
      </n-form-item>

      <n-form-item label="Open Codes" path="open_codes">
        <n-input
          v-model:value="formValue.open_codes"
          type="text"
          placeholder="Enter comma-separated codes (e.g., helpful, accurate, concise)"
          maxlength="500"
          show-count
        />
      </n-form-item>

      <n-form-item label="Comments/Hypotheses" path="comments_hypotheses">
        <n-input
          v-model:value="formValue.comments_hypotheses"
          type="textarea"
          placeholder="Add any comments or hypotheses about this trace (max 1000 chars)"
          maxlength="1000"
          show-count
          :rows="4"
        />
      </n-form-item>

      <n-space justify="end">
        <n-button @click="resetForm" :disabled="saving">
          Reset
        </n-button>
        <n-button
          type="primary"
          @click="saveAnnotation"
          :loading="saving"
        >
          Save Annotation
        </n-button>
      </n-space>
    </n-form>

    <n-alert v-if="existingAnnotation" type="info" style="margin-top: 16px">
      <template #header>Existing Annotation</template>
      You have previously annotated this trace (Version {{ existingAnnotation.version }}).
      Saving will update your annotation.
    </n-alert>
  </n-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { NCard, NForm, NFormItem, NRadioGroup, NRadio, NInput, NButton, NSpace, NAlert, useMessage, FormInst, FormRules } from 'naive-ui'
import { apiService } from '@/services/api'

const props = defineProps<{
  traceId: string
  existingAnnotation?: any
}>()

const emit = defineEmits(['save-success'])

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const formValue = reactive({
  holistic_pass_fail: 'Pass' as 'Pass' | 'Fail',
  first_failure_note: '',
  open_codes: '',
  comments_hypotheses: ''
})

const rules: FormRules = {
  holistic_pass_fail: {
    required: true,
    message: 'Please select Pass or Fail',
    trigger: 'change'
  },
  first_failure_note: {
    required: false,
    max: 256,
    message: 'Maximum 256 characters',
    trigger: 'blur'
  },
  open_codes: {
    required: false,
    max: 500,
    message: 'Maximum 500 characters',
    trigger: 'blur'
  },
  comments_hypotheses: {
    required: false,
    max: 1000,
    message: 'Maximum 1000 characters',
    trigger: 'blur'
  }
}

const resetForm = () => {
  formValue.holistic_pass_fail = 'Pass'
  formValue.first_failure_note = ''
  formValue.open_codes = ''
  formValue.comments_hypotheses = ''

  // Load existing annotation if available
  if (props.existingAnnotation) {
    loadExistingAnnotation()
  }
}

const loadExistingAnnotation = () => {
  if (props.existingAnnotation) {
    formValue.holistic_pass_fail = props.existingAnnotation.holistic_pass_fail || 'Pass'
    formValue.first_failure_note = props.existingAnnotation.first_failure_note || ''
    formValue.open_codes = props.existingAnnotation.open_codes || ''
    formValue.comments_hypotheses = props.existingAnnotation.comments_hypotheses || ''
  }
}

const saveAnnotation = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true

    const annotationData = {
      trace_id: props.traceId,
      holistic_pass_fail: formValue.holistic_pass_fail,
      first_failure_note: formValue.holistic_pass_fail === 'Fail' ? formValue.first_failure_note : undefined,
      open_codes: formValue.open_codes || undefined,
      comments_hypotheses: formValue.comments_hypotheses || undefined
    }

    await apiService.saveAnnotation(annotationData)
    message.success('Annotation saved successfully')
    emit('save-success')
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