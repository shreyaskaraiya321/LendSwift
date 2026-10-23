import { useCallback, useEffect, useRef, useState } from 'react';

import { FormAutoSaveState } from '@/types/wizard';

const STORAGE_KEY = 'lendswift_application_draft';

export function useAutoSave<T extends object>(
  data: T,
  options: {
    debounceMs?: number;
    enabled?: boolean;
    onSaveSuccess?: (savedAt: Date) => void;
  } = {}
) {
  const { debounceMs = 800, enabled = true, onSaveSuccess } = options;

  const [autoSaveState, setAutoSaveState] = useState<FormAutoSaveState>({
    status: 'idle',
    lastSavedAt: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  const saveToStorage = useCallback(
    (payload: T) => {
      try {
        setAutoSaveState((prev) => ({ ...prev, status: 'saving' }));
        const serialized = JSON.stringify({
          data: payload,
          timestamp: new Date().toISOString(),
        });

        localStorage.setItem(STORAGE_KEY, serialized);

        const now = new Date();
        setAutoSaveState({
          status: 'saved',
          lastSavedAt: now,
        });

        if (onSaveSuccess) {
          onSaveSuccess(now);
        }
      } catch (err) {
        setAutoSaveState({
          status: 'error',
          lastSavedAt: null,
          errorMessage: err instanceof Error ? err.message : 'Failed to save application draft',
        });
      }
    },
    [onSaveSuccess]
  );

  useEffect(() => {
    if (!enabled) return;

    const currentString = JSON.stringify(data);
    if (currentString === previousDataRef.current) return;

    previousDataRef.current = currentString;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveToStorage(data);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, debounceMs, enabled, saveToStorage]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAutoSaveState({ status: 'idle', lastSavedAt: null });
    previousDataRef.current = '';
  }, []);

  return {
    autoSaveState,
    clearDraft,
    forceSave: () => saveToStorage(data),
  };
}
