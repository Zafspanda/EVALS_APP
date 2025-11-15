<template>
  <n-card title="Import CSV" :bordered="false" class="csv-importer">
    <n-space vertical>
      <n-upload
        :max="1"
        accept=".csv"
        @before-upload="handleBeforeUpload"
        @change="handleFileChange"
        :default-upload="false"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>
              </svg>
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            Click or drag CSV file here to upload
          </n-text>
          <n-p depth="3" style="margin: 8px 0 0 0">
            CSV must contain 28 columns with required fields: trace_id, flow_session, turn_number, total_turns, user_message, ai_response
          </n-p>
        </n-upload-dragger>
      </n-upload>

      <n-alert v-if="error" type="error" closable @close="error = null">
        {{ error }}
      </n-alert>

      <n-button
        v-if="selectedFile"
        type="primary"
        :loading="uploading"
        @click="uploadFile"
        block
      >
        Import {{ selectedFile.name }}
      </n-button>

      <n-alert v-if="result" type="success" closable @close="result = null">
        <strong>Import Complete!</strong><br>
        {{ result.message }}<br>
        Imported: {{ result.imported }} | Skipped: {{ result.skipped }} | Total: {{ result.total }}
      </n-alert>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NUpload, NUploadDragger, NIcon, NText, NP, NButton, NAlert, NSpace, useMessage } from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import { apiService } from '@/services/api'

const message = useMessage()
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const error = ref<string | null>(null)
const result = ref<any>(null)

const emit = defineEmits(['import-complete'])

const handleBeforeUpload = (data: { file: UploadFileInfo; fileList: UploadFileInfo[] }) => {
  // Validate file extension
  if (!data.file.name?.endsWith('.csv')) {
    error.value = 'Please select a CSV file'
    return false
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024
  if (data.file.file && data.file.file.size > maxSize) {
    error.value = 'File size exceeds 10MB limit'
    return false
  }

  return true
}

const handleFileChange = (data: { fileList: UploadFileInfo[] }) => {
  if (data.fileList.length > 0 && data.fileList[0].file) {
    selectedFile.value = data.fileList[0].file
    error.value = null
  } else {
    selectedFile.value = null
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  error.value = null
  result.value = null

  try {
    const response = await apiService.importCSV(selectedFile.value)
    result.value = response
    message.success(response.message)
    selectedFile.value = null
    emit('import-complete')
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to import CSV'
    message.error(error.value)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.csv-importer {
  max-width: 600px;
  margin: 0 auto;
}
</style>