import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function useSearchParamsState(defaults) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const values = { ...defaults };
    Object.keys(defaults).forEach((key) => {
      const fromUrl = searchParams.get(key);
      if (fromUrl !== null) values[key] = fromUrl;
    });
    return values;
  }, [searchParams, defaults]);

  const updateParams = useCallback(
    (changes, { resetPage = true } = {}) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(changes).forEach(([key, value]) => {
          const isDefault = value === defaults[key];
          if (value === '' || value === null || value === undefined || isDefault) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        if (resetPage && !('page' in changes)) next.delete('page');
        return next;
      });
    },
    [setSearchParams, defaults]
  );

  return { params, updateParams };
}
