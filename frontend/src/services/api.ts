// API Service - Migrated from Vue (Axios) to React (Fetch)
// Uses Clerk for authentication

import type {
  Trace,
  TracesResponse,
  Annotation,
  AdjacentTraces,
  UserStats,
  User,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get Clerk auth token from window.Clerk
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const clerk = (window as any).Clerk;
    if (clerk && clerk.session) {
      const token = await clerk.session.getToken();
      return token;
    }
  } catch (error) {
    console.warn('Could not get auth token:', error);
  }
  return null;
}

/**
 * Fetch wrapper with Clerk auth token injection
 */
async function fetchWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add Content-Type for JSON requests (unless it's FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * API Service - matches Vue apiService interface
 */
export const apiService = {
  // Auth
  async getCurrentUser(): Promise<User> {
    return fetchWithAuth<User>('/api/auth/me');
  },

  // Traces
  async importCSV(file: File): Promise<{ message: string; count: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return fetchWithAuth('/api/traces/import-csv', {
      method: 'POST',
      body: formData,
    });
  },

  async getTraces(page: number = 1, pageSize: number = 50): Promise<TracesResponse> {
    return fetchWithAuth<TracesResponse>(
      `/api/traces?page=${page}&page_size=${pageSize}`
    );
  },

  async getTrace(traceId: string): Promise<Trace> {
    return fetchWithAuth<Trace>(`/api/traces/${traceId}`);
  },

  async getAdjacentTraces(traceId: string): Promise<AdjacentTraces> {
    return fetchWithAuth<AdjacentTraces>(`/api/traces/${traceId}/adjacent`);
  },

  async getNextUnannotatedTrace(): Promise<Trace> {
    return fetchWithAuth<Trace>('/api/traces/next/unannotated');
  },

  // Annotations
  async saveAnnotation(annotation: Omit<Annotation, 'annotation_id' | 'created_at' | 'updated_at'>): Promise<Annotation> {
    return fetchWithAuth<Annotation>('/api/annotations', {
      method: 'POST',
      body: JSON.stringify(annotation),
    });
  },

  async getAnnotationForTrace(traceId: string): Promise<Annotation | null> {
    return fetchWithAuth<Annotation | null>(`/api/annotations/trace/${traceId}`);
  },

  async getUserStats(): Promise<UserStats> {
    return fetchWithAuth<UserStats>('/api/annotations/user/stats');
  },
};

export default apiService;