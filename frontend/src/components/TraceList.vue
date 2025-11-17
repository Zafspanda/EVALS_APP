<template>
  <n-card title="Traces" :bordered="false">
    <n-space vertical>
      <n-data-table
        :key="tableKey"
        :columns="columns"
        :data="traces"
        :pagination="pagination"
        :loading="loading"
        :row-key="rowKey"
        :row-props="rowProps"
        remote
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NDataTable, NSpace, NButton, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { apiService } from '@/services/api'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const traces = ref<any[]>([])
const totalTraces = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)
const annotations = ref<Map<string, any>>(new Map())
const tableKey = ref(0)

const columns: DataTableColumns<any> = [
  {
    title: 'Status',
    key: 'status',
    width: 80,
    render(row) {
      const annotation = annotations.value.get(row.trace_id)
      if (!annotation) {
        return h('span', { 'aria-label': 'Not annotated', style: { fontSize: '18px' } }, '○')
      }
      const passFailStatus = annotation.holistic_pass_fail
      if (passFailStatus === 'Pass') {
        return h('span', {
          'aria-label': 'Pass',
          style: { fontSize: '18px', color: 'rgb(34, 197, 94)' }
        }, '✓')
      } else if (passFailStatus === 'Fail') {
        return h('span', {
          'aria-label': 'Fail',
          style: { fontSize: '18px', color: 'rgb(239, 68, 68)' }
        }, '✗')
      }
      return h('span', { 'aria-label': 'Unknown' }, '?')
    },
    cellProps: (row: any) => {
      const annotation = annotations.value.get(row.trace_id)
      if (!annotation) return {}
      const passFailStatus = annotation.holistic_pass_fail
      if (passFailStatus === 'Pass') {
        return { style: { backgroundColor: 'rgba(34, 197, 94, 0.15)' } }
      } else if (passFailStatus === 'Fail') {
        return { style: { backgroundColor: 'rgba(239, 68, 68, 0.15)' } }
      }
      return {}
    }
  },
  {
    title: 'Trace ID',
    key: 'trace_id',
    width: 180,
    ellipsis: {
      tooltip: true
    },
    cellProps: (row: any) => {
      const annotation = annotations.value.get(row.trace_id)
      if (!annotation) return {}
      const passFailStatus = annotation.holistic_pass_fail
      if (passFailStatus === 'Pass') {
        return { style: { backgroundColor: 'rgba(34, 197, 94, 0.15)' } }
      } else if (passFailStatus === 'Fail') {
        return { style: { backgroundColor: 'rgba(239, 68, 68, 0.15)' } }
      }
      return {}
    }
  },
  {
    title: 'Session',
    key: 'flow_session',
    width: 150,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row.flow_session?.substring(0, 8) + '...'
    },
    cellProps: (row: any) => {
      const annotation = annotations.value.get(row.trace_id)
      if (!annotation) return {}
      const passFailStatus = annotation.holistic_pass_fail
      if (passFailStatus === 'Pass') {
        return { style: { backgroundColor: 'rgba(34, 197, 94, 0.15)' } }
      } else if (passFailStatus === 'Fail') {
        return { style: { backgroundColor: 'rgba(239, 68, 68, 0.15)' } }
      }
      return {}
    }
  },
  {
    title: 'Turn',
    key: 'turn_number',
    width: 80,
    render(row) {
      return `${row.turn_number}/${row.total_turns}`
    },
    cellProps: (row: any) => {
      const annotation = annotations.value.get(row.trace_id)
      if (!annotation) return {}
      const passFailStatus = annotation.holistic_pass_fail
      if (passFailStatus === 'Pass') {
        return { style: { backgroundColor: 'rgba(34, 197, 94, 0.15)' } }
      } else if (passFailStatus === 'Fail') {
        return { style: { backgroundColor: 'rgba(239, 68, 68, 0.15)' } }
      }
      return {}
    }
  },
  {
    title: 'User Message',
    key: 'user_message',
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row.user_message?.substring(0, 100) + (row.user_message?.length > 100 ? '...' : '')
    },
    cellProps: (row: any) => {
      const annotation = annotations.value.get(row.trace_id)
      if (!annotation) return {}
      const passFailStatus = annotation.holistic_pass_fail
      if (passFailStatus === 'Pass') {
        return { style: { backgroundColor: 'rgba(34, 197, 94, 0.15)' } }
      } else if (passFailStatus === 'Fail') {
        return { style: { backgroundColor: 'rgba(239, 68, 68, 0.15)' } }
      }
      return {}
    }
  },
  {
    title: 'AI Response',
    key: 'ai_response',
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row.ai_response?.substring(0, 100) + (row.ai_response?.length > 100 ? '...' : '')
    },
    cellProps: (row: any) => {
      const annotation = annotations.value.get(row.trace_id)
      if (!annotation) return {}
      const passFailStatus = annotation.holistic_pass_fail
      if (passFailStatus === 'Pass') {
        return { style: { backgroundColor: 'rgba(34, 197, 94, 0.15)' } }
      } else if (passFailStatus === 'Fail') {
        return { style: { backgroundColor: 'rgba(239, 68, 68, 0.15)' } }
      }
      return {}
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          onClick: () => viewTrace(row.trace_id)
        },
        { default: () => 'View' }
      )
    },
    cellProps: (row: any) => {
      const annotation = annotations.value.get(row.trace_id)
      if (!annotation) return {}
      const passFailStatus = annotation.holistic_pass_fail
      if (passFailStatus === 'Pass') {
        return { style: { backgroundColor: 'rgba(34, 197, 94, 0.15)' } }
      } else if (passFailStatus === 'Fail') {
        return { style: { backgroundColor: 'rgba(239, 68, 68, 0.15)' } }
      }
      return {}
    }
  }
]

const pagination = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  itemCount: totalTraces.value,
  showSizePicker: true,
  pageSizes: [20, 50, 100]
}))

const rowKey = (row: any) => row.trace_id

const rowProps = (row: any) => {
  const annotation = annotations.value.get(row.trace_id)

  console.log(`Row ${row.trace_id}: annotation =`, annotation)

  if (!annotation) return {}

  const passFailStatus = annotation.holistic_pass_fail
  console.log(`Trace ${row.trace_id} has annotation with status: ${passFailStatus}`)

  if (passFailStatus === 'Pass') {
    return {
      style: {
        'background-color': 'rgba(34, 197, 94, 0.15)'
      }
    }
  } else if (passFailStatus === 'Fail') {
    return {
      style: {
        'background-color': 'rgba(239, 68, 68, 0.15)'
      }
    }
  }
  return {}
}

const fetchTraces = async () => {
  loading.value = true
  try {
    const response = await apiService.getTraces(currentPage.value, pageSize.value)
    traces.value = response.traces
    totalTraces.value = response.total

    // Fetch annotations for current page traces
    await fetchAnnotationsForTraces(response.traces)
  } catch (error: any) {
    message.error('Failed to load traces')
    console.error('Error fetching traces:', error)
  } finally {
    loading.value = false
  }
}

const fetchAnnotationsForTraces = async (traceList: any[]) => {
  try {
    console.log(`Fetching annotations for ${traceList.length} traces`)
    // Fetch annotations for each trace
    const annotationPromises = traceList.map(trace =>
      apiService.getAnnotationForTrace(trace.trace_id).catch(() => null)
    )
    const annotationResults = await Promise.all(annotationPromises)

    console.log('Annotation results:', annotationResults)

    // Update annotations map
    annotations.value.clear()
    annotationResults.forEach((annotation, index) => {
      if (annotation) {
        console.log(`Adding annotation for trace ${traceList[index].trace_id}:`, annotation)
        annotations.value.set(traceList[index].trace_id, annotation)
        // Also add annotation directly to trace object to trigger re-render
        traceList[index]._annotation = annotation
      }
    })

    console.log(`Annotations map now has ${annotations.value.size} entries`)

    // Force update the traces array to trigger re-render
    traces.value = [...traceList]
    // Increment table key to force complete re-render
    tableKey.value++
  } catch (error) {
    console.error('Error fetching annotations:', error)
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchTraces()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1  // Reset to first page
  fetchTraces()
}

const viewTrace = (traceId: string) => {
  router.push(`/trace/${traceId}`)
}

// Expose refresh method for parent components
defineExpose({
  refresh: fetchTraces
})

onMounted(() => {
  fetchTraces()
})
</script>