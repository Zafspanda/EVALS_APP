<template>
  <CsvImporter @import-complete="handleImportComplete" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import CsvImporter from '@/components/CsvImporter.vue'

const router = useRouter()

const handleImportComplete = () => {
  // Redirect to traces view after successful import
  setTimeout(() => {
    router.push('/traces')
  }, 2000)
}
</script>