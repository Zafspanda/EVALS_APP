import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Configure Clerk
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

app.use(createPinia())
app.use(router)
app.use(clerkPlugin, {
  publishableKey: clerkPublishableKey
})

app.mount('#app')
