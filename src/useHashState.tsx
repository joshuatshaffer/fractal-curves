import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useHashState<T>(
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const value = window.location.hash.slice(1);

    if (value) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.error("Unable to page URL hash state", e);
      }
    }

    return defaultValue;
  });

  // Update the URL hash with a debounce when the state changes.
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.hash = encodeURIComponent(JSON.stringify(state));
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [state]);

  return [state, setState];
}
