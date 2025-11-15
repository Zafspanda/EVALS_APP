<template>
  <n-card :title="`Trace: ${traceId}`" :bordered="false">
    <template v-if="loading">
      <n-spin />
    </template>

    <template v-else-if="trace">
      <n-space vertical>
        <!-- Metadata -->
        <n-descriptions label-placement="left" bordered :column="2">
          <n-descriptions-item label="Session">
            {{ trace.flow_session }}
          </n-descriptions-item>
          <n-descriptions-item label="Turn">
            {{ trace.turn_number }} / {{ trace.total_turns }}
          </n-descriptions-item>
          <n-descriptions-item label="Imported">
            {{ new Date(trace.imported_at).toLocaleString() }}
          </n-descriptions-item>
        </n-descriptions>

        <!-- Context (Previous Turns) -->
        <n-card v-if="trace.context && trace.context.length > 0" title="Previous Context" size="small">
          <n-timeline>
            <n-timeline-item
              v-for="ctx in trace.context"
              :key="ctx.turn_number"
              :title="`Turn ${ctx.turn_number}`"
              type="info"
            >
              <div class="context-turn">
                <div class="message-block">
                  <strong>User:</strong>
                  <n-ellipsis :line-clamp="3" :tooltip="false">
                    {{ ctx.user_message }}
                  </n-ellipsis>
                </div>
                <div class="message-block">
                  <strong>AI:</strong>
                  <n-ellipsis :line-clamp="3" :tooltip="false">
                    {{ ctx.ai_response }}
                  </n-ellipsis>
                </div>
              </div>
            </n-timeline-item>
          </n-timeline>
        </n-card>

        <!-- Current Turn -->
        <n-card title="Current Turn" size="small">
          <n-space vertical>
            <div class="message-block">
              <n-h4>User Message</n-h4>
              <n-p>{{ trace.user_message }}</n-p>
            </div>
            <n-divider />
            <div class="message-block">
              <n-h4>AI Response</n-h4>
              <n-p>{{ trace.ai_response }}</n-p>
            </div>
          </n-space>
        </n-card>

        <!-- Navigation -->
        <n-space justify="space-between">
          <n-button @click="navigateToPrevious" :disabled="!hasPrevious">
            Previous Trace
          </n-button>
          <n-button @click="navigateToNext" :disabled="!hasNext">
            Next Trace
          </n-button>
        </n-space>

        <!-- Annotation Section -->
        <annotation-form
          :trace-id="traceId"
          :existing-annotation="existingAnnotation"
          @save-success="handleAnnotationSaved"
        />
      </n-space>
    </template>

    <template v-else>
      <n-empty description="Trace not found" />
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NCard, NSpace, NSpin, NEmpty, NDescriptions, NDescriptionsItem,
  NTimeline, NTimelineItem, NEllipsis, NButton, NDivider, NH4, NP,
  useMessage
} from 'naive-ui'
import { apiService } from '@/services/api'
import AnnotationForm from './AnnotationForm.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const traceId = computed(() => route.params.id as string)
const loading = ref(false)
const trace = ref<any>(null)
const existingAnnotation = ref<any>(null)
const traceList = ref<string[]>([])  // For navigation
const currentTraceIndex = ref(0)

const hasPrevious = computed(() => currentTraceIndex.value > 0)
const hasNext = computed(() => currentTraceIndex.value < traceList.value.length - 1)

const fetchTrace = async () => {
  loading.value = true
  try {
    const [traceData, annotationData] = await Promise.all([
      apiService.getTrace(traceId.value),
      apiService.getAnnotationForTrace(traceId.value)
    ])
    trace.value = traceData
    existingAnnotation.value = annotationData
  } catch (error: any) {
    message.error('Failed to load trace')
    console.error('Error fetching trace:', error)
  } finally {
    loading.value = false
  }
}

const fetchTraceList = async () => {
  try {
    // Fetch all traces for navigation
    const allTraces: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await apiService.getTraces(page, 100)
      allTraces.push(...response.traces)
      hasMore = allTraces.length < response.total
      page++
    }

    traceList.value = allTraces.map((t: any) => t.trace_id)
    currentTraceIndex.value = traceList.value.indexOf(traceId.value)
    console.log(`Loaded ${traceList.value.length} traces for navigation. Current index: ${currentTraceIndex.value}`)
  } catch (error) {
    console.error('Error fetching trace list:', error)
  }
}

const navigateToPrevious = () => {
  if (hasPrevious.value) {
    const previousId = traceList.value[currentTraceIndex.value - 1]
    router.push(`/trace/${previousId}`)
  }
}

const navigateToNext = () => {
  if (hasNext.value) {
    const nextId = traceList.value[currentTraceIndex.value + 1]
    router.push(`/trace/${nextId}`)
  }
}

const handleAnnotationSaved = () => {
  message.success('Annotation saved successfully')
  // Refresh annotation data
  apiService.getAnnotationForTrace(traceId.value).then(data => {
    existingAnnotation.value = data
  })
}

// Watch for route changes to reload trace data
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchTrace()
    // Update current trace index when route changes
    currentTraceIndex.value = traceList.value.indexOf(newId as string)
  }
})

onMounted(() => {
  fetchTrace()
  fetchTraceList()
})
</script>

<style scoped>
.context-turn {
  padding: 8px;
  background-color: var(--n-color-modal);
  border-radius: 4px;
}

.message-block {
  margin-bottom: 12px;
}

.message-block:last-child {
  margin-bottom: 0;
}
</style>