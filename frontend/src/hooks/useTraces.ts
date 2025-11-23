// Custom hooks for trace data fetching
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Trace, TracesResponse, AdjacentTraces } from '../types/api';

/**
 * Hook for fetching paginated traces list
 */
export function useTraces(page: number = 1, pageSize: number = 50) {
  const [data, setData] = useState<TracesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTraces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getTraces(page, pageSize);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchTraces();
  }, [fetchTraces]);

  return {
    traces: data?.traces || [],
    total: data?.total || 0,
    page: data?.page || page,
    pageSize: data?.page_size || pageSize,
    loading,
    error,
    refresh: fetchTraces,
  };
}

/**
 * Hook for fetching a single trace by ID
 */
export function useTrace(traceId: string | null) {
  const [trace, setTrace] = useState<Trace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrace = useCallback(async () => {
    if (!traceId) {
      setTrace(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getTrace(traceId);
      setTrace(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [traceId]);

  useEffect(() => {
    fetchTrace();
  }, [fetchTrace]);

  return {
    trace,
    loading,
    error,
    refresh: fetchTrace,
  };
}

/**
 * Hook for fetching adjacent traces (prev/next navigation)
 */
export function useAdjacentTraces(traceId: string | null) {
  const [adjacent, setAdjacent] = useState<AdjacentTraces | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!traceId) {
      setAdjacent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    apiService.getAdjacentTraces(traceId)
      .then(setAdjacent)
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [traceId]);

  return {
    prev: adjacent?.prev || null,
    next: adjacent?.next || null,
    loading,
    error,
  };
}

/**
 * Hook for fetching the next unannotated trace
 */
export function useNextUnannotated() {
  const [trace, setTrace] = useState<Trace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getNextUnannotatedTrace();
      setTrace(result);
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trace,
    loading,
    error,
    fetchNext,
  };
}
