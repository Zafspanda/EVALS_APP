import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/traces',
      name: 'traces',
      component: () => import('../views/TracesView.vue'),
    },
    {
      path: '/trace/:id',
      name: 'trace-detail',
      component: () => import('../views/TraceDetailView.vue'),
    },
    {
      path: '/import',
      name: 'import',
      component: () => import('../views/ImportView.vue'),
    },
  ],
})

export default router