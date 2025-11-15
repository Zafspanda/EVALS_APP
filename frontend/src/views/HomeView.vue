<template>
  <n-space vertical size="large">
    <n-card title="Welcome to Open Coding Evaluation Platform" :bordered="false">
      <n-p>
        This platform allows you to systematically evaluate chatbot conversation traces
        for quality analysis using open coding methodology.
      </n-p>
    </n-card>

    <n-grid :cols="3" :x-gap="12" :y-gap="12">
      <n-grid-item>
        <n-card>
          <n-statistic label="Total Traces">
            <n-number-animation
              :from="0"
              :to="stats.totalTraces"
              :duration="1000"
            />
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card>
          <n-statistic label="Your Annotations">
            <n-number-animation
              :from="0"
              :to="stats.totalAnnotations"
              :duration="1000"
            />
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card>
          <n-statistic label="Pass Rate">
            <template #suffix>%</template>
            <n-number-animation
              :from="0"
              :to="stats.passRate"
              :duration="1000"
              :precision="1"
            />
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card title="Quick Actions" :bordered="false">
      <n-space>
        <n-button type="primary" @click="router.push('/import')">
          Import CSV
        </n-button>
        <n-button @click="router.push('/traces')">
          View Traces
        </n-button>
      </n-space>
    </n-card>

    <n-card v-if="recentAnnotations.length > 0" title="Recent Annotations" :bordered="false">
      <n-list>
        <n-list-item v-for="ann in recentAnnotations" :key="ann.trace_id">
          <n-thing>
            <template #header>
              Trace: {{ ann.trace_id }}
            </template>
            <template #description>
              <n-space>
                <n-tag :type="ann.holistic_pass_fail === 'Pass' ? 'success' : 'error'">
                  {{ ann.holistic_pass_fail }}
                </n-tag>
                <n-text depth="3">
                  {{ new Date(ann.updated_at).toLocaleString() }}
                </n-text>
              </n-space>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace, NCard, NP, NGrid, NGridItem, NStatistic, NNumberAnimation,
  NButton, NList, NListItem, NThing, NTag, NText
} from 'naive-ui'
import { apiService } from '@/services/api'

const router = useRouter()

const stats = ref({
  totalTraces: 0,
  totalAnnotations: 0,
  passRate: 0
})

const recentAnnotations = ref<any[]>([])

const fetchStats = async () => {
  try {
    // Fetch traces count
    const tracesResponse = await apiService.getTraces(1, 1)
    stats.value.totalTraces = tracesResponse.total

    // Fetch user stats
    const userStats = await apiService.getUserStats()
    stats.value.totalAnnotations = userStats.total_annotations
    stats.value.passRate = userStats.pass_rate
    recentAnnotations.value = userStats.recent_annotations || []
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>