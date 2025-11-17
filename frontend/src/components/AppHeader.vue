<template>
  <n-layout-header bordered :style="headerStyle">
    <n-space :vertical="isMobile" justify="space-between" align="center" :wrap="false">
      <n-space :vertical="isMobile" align="center">
        <router-link to="/" style="text-decoration: none; color: inherit">
          <n-h2 :style="titleStyle">{{ isMobile ? 'Open Coding' : 'Open Coding Evaluation Platform' }}</n-h2>
        </router-link>
        <n-menu
          :mode="isMobile ? 'vertical' : 'horizontal'"
          :value="activeMenu"
          :options="menuOptions"
          @update:value="handleMenuSelect"
        />
      </n-space>

      <n-space align="center">
        <n-tag v-if="userStats && !isMobile" type="info">
          Annotations: {{ userStats.total_annotations }}
        </n-tag>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <n-button @click="redirectToSignIn">Sign In</n-button>
        </SignedOut>
      </n-space>
    </n-space>
  </n-layout-header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { NLayoutHeader, NSpace, NH2, NMenu, NTag, NButton, type MenuOption } from 'naive-ui'
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/vue'
import { useBreakpoints } from '@vueuse/core'
import { apiService } from '@/services/api'

const router = useRouter()
const route = useRoute()
const { redirectToSignIn } = useClerk()

const breakpoints = useBreakpoints({
  mobile: 0,
  tablet: 768
})

const isMobile = computed(() => breakpoints.smaller('tablet').value)

const headerStyle = computed(() => ({
  padding: isMobile.value ? '12px' : '16px'
}))

const titleStyle = computed(() => ({
  margin: 0,
  fontSize: isMobile.value ? '18px' : '24px'
}))

const userStats = ref<any>(null)

const menuOptions: MenuOption[] = [
  {
    label: 'Home',
    key: 'home'
  },
  {
    label: 'Traces',
    key: 'traces'
  },
  {
    label: 'Import CSV',
    key: 'import'
  }
]

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/traces')) return 'traces'
  if (path === '/import') return 'import'
  return 'home'
})

const handleMenuSelect = (key: string) => {
  if (key === 'home') router.push('/')
  else if (key === 'traces') router.push('/traces')
  else if (key === 'import') router.push('/import')
}

const fetchUserStats = async () => {
  try {
    userStats.value = await apiService.getUserStats()
  } catch (error) {
    console.error('Error fetching user stats:', error)
  }
}

onMounted(() => {
  fetchUserStats()
})
</script>