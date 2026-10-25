import { useCallback, useEffect, useRef, useState } from 'react';

import { FormAutoSaveState } from '@/types/wizard';
import { encryptData } from '@/utils/encryption';

export interface DraftMetadata {
  version: string;
  timestamp: string;
  step: number;
  loanType: string;
}

export interface EncryptedDraftRecord extends DraftMetadata {
  payload: string;
  data: string;
}

export interface UseAutoSaveOptions {
  currentStep?: number;
  step?: number;
  loanType?: string;
  interval?: number;
  debounceMs?: number;
  enabled?: boolean;
  onSaveSuccess?: (savedAt: Date) => void;
}

/**
 * Hook for encrypted, debounced auto-saving of loan application state conforming to RBI PII guidelines.
 * Accepts either:
 *   (currentFormData, currentStep, loanType, interval = 30000)
 * or:
 *   (currentFormData, optionsObject)
 */
export function useAutoSave<T extends object>(
  currentFormData: T,
  arg2?: number | UseAutoSaveOptions,
  arg3?: string,
  arg4?: number
) {
  // Normalize parameters
  let currentStep = 1;
  let loanType = 'personal';
  let interval = 30000;
  let debounceMs = 1000;
  let enabled = true;
  let onSaveSuccess: ((savedAt: Date) => void) | undefined;

  if (typeof arg2 === 'object' && arg2 !== null) {
    currentStep = arg2.currentStep ?? arg2.step ?? 1;
    loanType = arg2.loanType ?? 'personal';
    interval = arg2.interval ?? 30000;
    debounceMs = arg2.debounceMs ?? 1000;
    enabled = arg2.enabled ?? true;
    onSaveSuccess = arg2.onSaveSuccess;
  } else {
    if (typeof arg2 === 'number') currentStep = arg2;
    if (typeof arg3 === 'string') loanType = arg3;
    if (typeof arg4 === 'number') interval = arg4;
  }

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<FormAutoSaveState>({
    status: 'idle',
    lastSavedAt: null,
  });

  const storageKey = `lendswift_draft_${loanType.toLowerCase()}`;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousSerializedRef = useRef<string>('');

  const performSave = useCallback(
    async (dataToSave: T) => {
      try {
        setIsSaving(true);
        setAutoSaveState((prev) => ({ ...prev, status: 'saving' }));

        const serialized = JSON.stringify(dataToSave);
        const encryptedPayload = await encryptData(serialized);
        const now = new Date();
        const nowIso = now.toISOString();

        const draftRecord: EncryptedDraftRecord = {
          version: '1.0',
          timestamp: nowIso,
          step: currentStep,
          loanType,
          payload: encryptedPayload,
          data: encryptedPayload,
        };

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(draftRecord));
          // Backward compatibility for generic draft key
          localStorage.setItem('lendswift_application_draft', JSON.stringify({
            data: dataToSave,
            timestamp: nowIso,
          }));
        }

        setLastSaved(nowIso);
        setIsSaving(false);
        setAutoSaveState({
          status: 'saved',
          lastSavedAt: now,
        });

        // Dispatch custom event for UI toast notifications
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('lendswift:autosave', {
              detail: {
                timestamp: nowIso,
                step: currentStep,
                loanType,
              },
            })
          );
        }

        if (onSaveSuccess) {
          onSaveSuccess(now);
        }
      } catch (err) {
        setIsSaving(false);
        setAutoSaveState({
          status: 'error',
          lastSavedAt: null,
          errorMessage: err instanceof Error ? err.message : 'Encryption / Auto-save error',
        });
      }
    },
    [currentStep, loanType, onSaveSuccess, storageKey]
  );

  // Debounced auto-save on form data changes
  useEffect(() => {
    if (!enabled || !currentFormData) return;

    const serialized = JSON.stringify(currentFormData);
    if (serialized === previousSerializedRef.current) return;
    previousSerializedRef.current = serialized;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void performSave(currentFormData);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentFormData, debounceMs, enabled, performSave]);

  // Periodic interval auto-save (e.g. every 30000ms)
  useEffect(() => {
    if (!enabled || interval <= 0) return;

    const intervalTimer = setInterval(() => {
      if (currentFormData) {
        void performSave(currentFormData);
      }
    }, interval);

    return () => {
      clearInterval(intervalTimer);
    };
  }, [currentFormData, enabled, interval, performSave]);

  const clearDraft = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKey);
      localStorage.removeItem('lendswift_application_draft');
    }
    setLastSaved(null);
    setAutoSaveState({ status: 'idle', lastSavedAt: null });
    previousSerializedRef.current = '';
  }, [storageKey]);

  return {
    lastSaved,
    isSaving,
    autoSaveState,
    forceSave: () => performSave(currentFormData),
    clearDraft,
  };
}

export default useAutoSave;
