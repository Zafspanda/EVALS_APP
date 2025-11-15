<template>
  <n-config-provider>
    <n-message-provider>
      <n-layout style="height: 100vh">
        <AppHeader />
        <n-layout-content style="padding: 24px">
          <RouterView />
        </n-layout-content>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NLayout, NLayoutContent } from 'naive-ui'
import AppHeader from './components/AppHeader.vue'
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

body {
  margin: 0;
  padding: 0;
}
</style>