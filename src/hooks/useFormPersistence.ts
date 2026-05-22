"use client";

import { useEffect, useState } from "react";

export const useFormPersistence = <T>(
  storageKey: string,
  initialValue: T,
) => {
  const [value, setValue] = useState<T>(initialValue);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const savedValue = window.localStorage.getItem(storageKey);

      if (!savedValue) {
        setHasLoaded(true);
        return;
      }

      try {
        setValue(JSON.parse(savedValue) as T);
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setHasLoaded(true);
      }
    });
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [hasLoaded, storageKey, value]);

  return [value, setValue, hasLoaded] as const;
};