import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useNuqs<T>(key: string, defaultValue: T) {
  const searchParams = useSearchParams();
  const value = (searchParams.get(key) ?? defaultValue) as T;

  const setValue = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, String(newValue));
      }
      // Update URL without reloading the page
      window.history.replaceState(null, "", `?${params.toString()}`);
    },
    [defaultValue, key, searchParams],
  );

  return [value, setValue] as const;
}
