import { useCallback, useEffect, useState } from 'react';

import { decryptData } from '@/utils/encryption';

export interface FormDraftMetadata {
  version: string;
  timestamp: string;
  step: number;
  loanType: string;
}

export interface ResumedDraftResult<T = unknown> {
  data: T | null;
  step: number;
  metadata: FormDraftMetadata | null;
}

export const DRAFT_TTL_MS = 72 * 60 * 60 * 1000; // 72 Hours TTL

/**
 * Checks localStorage on mount for existing loan drafts under 72 hours old (TTL enforcement).
 * Returns { draftFound, draftMetadata, resumeDraft, discardDraft }.
 *
 * @param loanType - Optional loan category ('personal', 'home', 'business')
 */
export function useFormPersistence<T = unknown>(loanType: string = 'personal') {
  const [draftFound, setDraftFound] = useState(false);
  const [draftMetadata, setDraftMetadata] = useState<FormDraftMetadata | null>(null);
  const [cachedDraftRecord, setCachedDraftRecord] = useState<Record<string, unknown> | null>(null);

  const storageKey = `lendswift_draft_${loanType.toLowerCase()}`;

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;

    try {
      let rawRecord = localStorage.getItem(storageKey);
      if (!rawRecord) {
        // Fallback check for generic draft key
        rawRecord = localStorage.getItem('lendswift_draft_personal') || localStorage.getItem('lendswift_application_draft');
      }

      if (!rawRecord) {
        setDraftFound(false);
        setDraftMetadata(null);
        return;
      }

      const parsed = JSON.parse(rawRecord) as Record<string, unknown>;
      const timestampStr = (parsed.timestamp as string) || '';
      const draftTime = new Date(timestampStr).getTime();

      if (!timestampStr || isNaN(draftTime)) {
        localStorage.removeItem(storageKey);
        setDraftFound(false);
        setDraftMetadata(null);
        return;
      }

      const ageMs = Date.now() - draftTime;

      // TTL enforcement: 72 hours maximum lifetime
      if (ageMs > DRAFT_TTL_MS || ageMs < 0) {
        localStorage.removeItem(storageKey);
        setDraftFound(false);
        setDraftMetadata(null);
        return;
      }

      const metadata: FormDraftMetadata = {
        version: (parsed.version as string) || '1.0',
        timestamp: timestampStr,
        step: typeof parsed.step === 'number' ? parsed.step : 1,
        loanType: (parsed.loanType as string) || loanType,
      };

      setDraftFound(true);
      setDraftMetadata(metadata);
      setCachedDraftRecord(parsed);
    } catch {
      setDraftFound(false);
      setDraftMetadata(null);
    }
  }, [storageKey, loanType]);

  /**
   * Decrypts and restores the saved draft data.
   */
  const resumeDraft = useCallback(async (): Promise<ResumedDraftResult<T>> => {
    try {
      const rawRecord =
        (typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null) ||
        JSON.stringify(cachedDraftRecord);

      if (!rawRecord) {
        return { data: null, step: 1, metadata: null };
      }

      const parsed = JSON.parse(rawRecord) as Record<string, unknown>;
      const cipherText = (parsed.payload || parsed.data) as string;

      if (!cipherText) {
        return { data: null, step: 1, metadata: null };
      }

      let plainText: string | null = null;

      // If cipherText is already an object (legacy unencrypted)
      if (typeof cipherText === 'object') {
        return {
          data: cipherText as T,
          step: typeof parsed.step === 'number' ? parsed.step : 1,
          metadata: draftMetadata,
        };
      }

      plainText = await decryptData(cipherText);

      if (!plainText) {
        // Fallback attempt: check if cipherText is unencrypted JSON string
        try {
          const directParsed = JSON.parse(cipherText) as T;
          return {
            data: directParsed,
            step: typeof parsed.step === 'number' ? parsed.step : 1,
            metadata: draftMetadata,
          };
        } catch {
          return { data: null, step: 1, metadata: null };
        }
      }

      const decryptedData = JSON.parse(plainText) as T;

      return {
        data: decryptedData,
        step: typeof parsed.step === 'number' ? parsed.step : 1,
        metadata: draftMetadata,
      };
    } catch {
      return { data: null, step: 1, metadata: null };
    }
  }, [cachedDraftRecord, draftMetadata, storageKey]);

  /**
   * Explicitly discards and removes the draft from localStorage.
   */
  const discardDraft = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKey);
      localStorage.removeItem('lendswift_draft_personal');
      localStorage.removeItem('lendswift_application_draft');
    }
    setDraftFound(false);
    setDraftMetadata(null);
    setCachedDraftRecord(null);
  }, [storageKey]);

  return {
    draftFound,
    draftMetadata,
    resumeDraft,
    discardDraft,
  };
}

export default useFormPersistence;
