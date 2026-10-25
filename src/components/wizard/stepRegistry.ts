import { LoanApplicationData } from '@/types/loan';

export type StepFormData = Partial<LoanApplicationData> | Record<string, unknown>;

export interface WizardStepDefinition {
  id: string;
  stepNumber: number;
  title: string;
  shortTitle: string;
  description: string;
  isStepVisible: (formData?: StepFormData) => boolean;
}

/**
 * Step 6 (Co-Applicant) Dynamic Visibility Rule:
 * - Always visible if loanType === 'Home'
 * - Visible if loanType === 'Personal' AND loanAmount > 500,000
 * - Visible if loanType === 'Business' AND loanAmount > 2,000,000
 * - Otherwise false
 */
export function isStep6Visible(formData?: StepFormData): boolean {
  if (!formData) return false;

  const data = formData as Record<string, unknown>;
  const rawLoanType = String(
    data.loanType || data.loanCategory || (data as Partial<LoanApplicationData>).loanPurpose || ''
  ).trim().toLowerCase();
  const loanAmount = Number(data.loanAmount) || 0;

  if (rawLoanType === 'home' || rawLoanType.includes('home')) {
    return true;
  }

  if ((rawLoanType === 'personal' || rawLoanType.includes('personal')) && loanAmount > 500000) {
    return true;
  }

  if ((rawLoanType === 'business' || rawLoanType.includes('business')) && loanAmount > 2000000) {
    return true;
  }

  return false;
}

/**
 * Statutory 8-Step Loan Application Registry
 */
export const STEPS: WizardStepDefinition[] = [
  {
    id: 'step-1-loan-type',
    stepNumber: 1,
    title: 'Loan Terms & Category Selection',
    shortTitle: 'Loan Terms',
    description: 'Loan category selection, customized amount, tenure sliders, and live EMI calculation.',
    isStepVisible: () => true,
  },
  {
    id: 'step-2-personal-info',
    stepNumber: 2,
    title: 'Personal Information & Verification',
    shortTitle: 'Personal Info',
    description: 'Legal identity, age gating (21-65 yrs), parental details, and dual OTP authentication.',
    isStepVisible: () => true,
  },
  {
    id: 'step-3-employment-income',
    stepNumber: 3,
    title: 'Employment & Income Assessment',
    shortTitle: 'Income',
    description: 'Employer details, net in-hand earnings, and debt-to-income (FOIR) evaluation.',
    isStepVisible: () => true,
  },
  {
    id: 'step-4-loan-requirement',
    stepNumber: 4,
    title: 'Loan Terms & Key Fact Statement',
    shortTitle: 'Loan Terms',
    description: 'Principal amount slider, tenure selection, EMI calculation, and RBI KFS disclosure.',
    isStepVisible: () => true,
  },
  {
    id: 'step-5-address-details',
    stepNumber: 5,
    title: 'Current & Permanent Address',
    shortTitle: 'Address',
    description: 'Postal PIN lookup, residence type, and residential stability check.',
    isStepVisible: () => true,
  },
  {
    id: 'step-6-co-applicant',
    stepNumber: 6,
    title: 'Co-Applicant & Bank Verification',
    shortTitle: 'Co-Applicant',
    description: 'High-ticket guarantor details and Penny Drop bank account authentication.',
    isStepVisible: isStep6Visible,
  },
  {
    id: 'step-7-document-upload',
    stepNumber: 7,
    title: 'Document Upload & Liveness',
    shortTitle: 'Documents',
    description: 'Salary slip / ITR verification and client-side compressed document attachment.',
    isStepVisible: () => true,
  },
  {
    id: 'step-8-review-consent',
    stepNumber: 8,
    title: 'Statutory Review & e-Sign',
    shortTitle: 'e-Sign',
    description: 'Final loan summary review, bureau consent, and Aadhaar OTP digital signature.',
    isStepVisible: () => true,
  },
];

export const stepRegistry = STEPS;

/**
 * Returns all currently active/visible steps given the form state.
 */
export function getVisibleSteps(formData?: StepFormData): WizardStepDefinition[] {
  return STEPS.filter((step) => step.isStepVisible(formData));
}

/**
 * Checks whether a specific step number is visible given the form state.
 */
export function isStepActive(stepNumber: number, formData?: StepFormData): boolean {
  const step = STEPS.find((s) => s.stepNumber === stepNumber);
  return step ? step.isStepVisible(formData) : false;
}

/**
 * Resolves the next visible step number, jumping over any skipped/hidden steps.
 */
export function getNextVisibleStep(currentStep: number, formData?: StepFormData): number {
  const visibleSteps = getVisibleSteps(formData);
  const currentIndex = visibleSteps.findIndex((s) => s.stepNumber === currentStep);

  if (currentIndex === -1) {
    const next = visibleSteps.find((s) => s.stepNumber > currentStep);
    return next ? next.stepNumber : currentStep;
  }

  if (currentIndex < visibleSteps.length - 1) {
    return visibleSteps[currentIndex + 1].stepNumber;
  }

  return currentStep;
}

/**
 * Resolves the previous visible step number, jumping backward over any skipped/hidden steps.
 */
export function getPreviousVisibleStep(currentStep: number, formData?: StepFormData): number {
  const visibleSteps = getVisibleSteps(formData);
  const currentIndex = visibleSteps.findIndex((s) => s.stepNumber === currentStep);

  if (currentIndex > 0) {
    return visibleSteps[currentIndex - 1].stepNumber;
  }

  return currentStep;
}

export default STEPS;
