import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function useFetch(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error });
      if (error.status !== 404) toast.error(error.message);
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
