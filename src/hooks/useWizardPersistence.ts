import { useCallback, useEffect, useState } from 'react';

import { PartialLoanApplicationData } from '@/types/loan';
import { StepNumber } from '@/types/wizard';

const STORAGE_KEY = 'lendswift_application_draft';
const STEP_STORAGE_KEY = 'lendswift_current_step';

export function useWizardPersistence() {
  const [initialData, setInitialData] = useState<PartialLoanApplicationData | null>(null);
  const [persistedStep, setPersistedStep] = useState<StepNumber>(1);
  const [hasExistingDraft, setHasExistingDraft] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as { data: PartialLoanApplicationData; timestamp: string };
        if (parsed && parsed.data) {
          setInitialData(parsed.data);
          setHasExistingDraft(true);
        }
      }

      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (stepNum >= 1 && stepNum <= 8) {
          setPersistedStep(stepNum as StepNumber);
        }
      }
    } catch {
      // In case of corrupt localStorage data, gracefully ignore
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const saveCurrentStep = useCallback((step: StepNumber) => {
    try {
      localStorage.setItem(STEP_STORAGE_KEY, step.toString());
      setPersistedStep(step);
    } catch {
      // Ignore quota errors
    }
  }, []);

  const clearPersistence = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_STORAGE_KEY);
    setHasExistingDraft(false);
    setInitialData(null);
    setPersistedStep(1);
  }, []);

  return {
    initialData,
    persistedStep,
    hasExistingDraft,
    isInitialized,
    saveCurrentStep,
    clearPersistence,
  };
}
