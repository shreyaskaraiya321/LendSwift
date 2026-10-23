import { ReactNode } from 'react';

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StepMetadata {
  id: string;
  stepNumber: StepNumber;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: 'Personal' | 'KYC' | 'Financial' | 'Verification' | 'Approval';
  isMandatory: boolean;
}

export interface WizardNavigationState {
  currentStep: StepNumber;
  totalSteps: number;
  highestCompletedStep: number;
  completedSteps: Set<StepNumber>;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export interface StepViewProps {
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

export interface FormAutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  errorMessage?: string;
}

export interface WizardContextType {
  currentStep: StepNumber;
  goToStep: (step: StepNumber) => void;
  nextStep: () => Promise<boolean>;
  previousStep: () => void;
  autoSaveState: FormAutoSaveState;
  resetDraft: () => void;
  isSubmitting: boolean;
}

export interface StepLayoutProps {
  title: string;
  subtitle: string;
  stepNumber: StepNumber;
  badgeText?: string;
  children: ReactNode;
  rbiDisclaimer?: string;
}
