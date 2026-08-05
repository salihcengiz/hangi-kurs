import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

/** Runs `fetcher` whenever `deps` changes, tracking loading/error/data state. */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, isLoading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, error: null, isLoading: true });

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, isLoading: false });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : 'Beklenmeyen bir hata oluştu.';
        setState({ data: null, error: message, isLoading: false });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
