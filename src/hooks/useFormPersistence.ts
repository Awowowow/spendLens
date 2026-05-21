"use client";

import { useEffect, useState } from "react";

export const useFormPersistence = <T>(
  storageKey: string,
  initialValue: T,
) => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const savedValue = window.localStorage.getItem(storageKey);

    if (!savedValue) {
      return initialValue;
    }

    try {
      return JSON.parse(savedValue) as T;
    } catch {
      window.localStorage.removeItem(storageKey);
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue] as const;
};