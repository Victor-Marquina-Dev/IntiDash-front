'use client';

import React from 'react';

export interface AsyncResource<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAsyncResource<T>(loader: () => Promise<T>, initialData: T): AsyncResource<T> {
  const [data, setData] = React.useState<T>(initialData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const refetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar datos'));
    } finally {
      setLoading(false);
    }
  }, [loader]);

  React.useEffect(() => {
    let active = true;
    loader()
      .then(nextData => {
        if (active) setData(nextData);
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err : new Error('Error al cargar datos'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loader]);

  return { data, loading, error, refetch };
}
