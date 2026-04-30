import { useState, useEffect } from 'react';
import { fetchBlueprintGraph } from '../api/blueprintGraph';
import type { BlueprintGraph } from '../types';

interface UseBlueprintGraphResult {
  graph: BlueprintGraph | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches the blueprint graph for the given tenant + blueprint.
 * Re-fetches whenever either ID changes or `refetch` is called.
 */
export function useBlueprintGraph(
  tenantId: string,
  blueprintId: string,
): UseBlueprintGraphResult {
  const [graph, setGraph] = useState<BlueprintGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchBlueprintGraph(tenantId, blueprintId)
      .then((data) => {
        if (!cancelled) setGraph(data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId, blueprintId, tick]);

  return { graph, loading, error, refetch: () => setTick((t) => t + 1) };
}
