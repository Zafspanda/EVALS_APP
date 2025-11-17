import axios from 'axios'
import { useClerk } from '@clerk/vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    // Get Clerk instance from window (available after plugin is initialized)
    const clerk = (window as any).Clerk
    if (clerk && clerk.session) {
      const token = await clerk.session.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch (error) {
    console.warn('Could not get auth token:', error)
  }
  return config
})

// API service methods
export const apiService = {
  // Auth
  async getCurrentUser() {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  // Traces
  async importCSV(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/api/traces/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async getTraces(page: number = 1, pageSize: number = 50) {
    const response = await api.get('/api/traces', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  async getTrace(traceId: string) {
    const response = await api.get(`/api/traces/${traceId}`)
    return response.data
  },

  async getAdjacentTraces(traceId: string) {
    const response = await api.get(`/api/traces/${traceId}/adjacent`)
    return response.data
  },

  async getNextUnannotatedTrace() {
    const response = await api.get('/api/traces/next/unannotated')
    return response.data
  },

  // Annotations
  async saveAnnotation(annotation: {
    trace_id: string
    holistic_pass_fail: 'Pass' | 'Fail'
    first_failure_note?: string
    open_codes?: string
    comments_hypotheses?: string
  }) {
    const response = await api.post('/api/annotations', annotation)
    return response.data
  },

  async getAnnotationForTrace(traceId: string) {
    const response = await api.get(`/api/annotations/trace/${traceId}`)
    return response.data
  },

  async getUserStats() {
    const response = await api.get('/api/annotations/user/stats')
    return response.data
  },
}

export default api