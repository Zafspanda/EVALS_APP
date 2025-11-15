<template>
  <TraceList ref="traceList" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TraceList from '@/components/TraceList.vue'

const traceList = ref()
</script>