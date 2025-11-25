// Custom hooks for annotation data fetching and mutations
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Annotation, UserStats } from '../types/api';

/**
 * Hook for fetching annotation for a specific trace
 */
export function useAnnotation(traceId: string | null) {
  const [annotation, setAnnotation] = useState<Annotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnnotation = useCallback(async () => {
    if (!traceId) {
      setAnnotation(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getAnnotationForTrace(traceId);
      setAnnotation(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [traceId]);

  useEffect(() => {
    fetchAnnotation();
  }, [fetchAnnotation]);

  return {
    annotation,
    loading,
    error,
    refresh: fetchAnnotation,
  };
}

/**
 * Hook for saving annotations (mutation)
 */
export function useSaveAnnotation() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveAnnotation = useCallback(async (
    annotation: Omit<Annotation, 'annotation_id' | 'created_at' | 'updated_at'>
  ): Promise<Annotation | null> => {
    setSaving(true);
    setError(null);
    try {
      const result = await apiService.saveAnnotation(annotation);
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    saveAnnotation,
    saving,
    error,
  };
}

/**
 * Hook for fetching user annotation statistics
 */
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getUserStats();
      setStats(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
