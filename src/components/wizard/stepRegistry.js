/**
 * Step 6 (Co-Applicant) Dynamic Visibility Rule:
 * - Always visible if loanType === 'Home'
 * - Visible if loanType === 'Personal' AND loanAmount > 500,000
 * - Visible if loanType === 'Business' AND loanAmount > 2,000,000
 * - Otherwise false
 *
 * @param {object} [formData]
 * @returns {boolean}
 */
export function isStep6Visible(formData) {
  if (!formData) return false;

  const rawLoanType = String(formData.loanType || formData.loanCategory || '').trim().toLowerCase();
  const loanAmount = Number(formData.loanAmount) || 0;

  if (rawLoanType === 'home') {
    return true;
  }

  if (rawLoanType === 'personal' && loanAmount > 500000) {
    return true;
  }

  if (rawLoanType === 'business' && loanAmount > 2000000) {
    return true;
  }

  return false;
}

/**
 * Statutory 8-Step Loan Application Registry
 */
export const STEPS = [
  {
    id: 'step-1-basic-details',
    stepNumber: 1,
    title: 'Personal & Identity Details',
    shortTitle: 'Identity',
    description: 'PAN validation, legal name, mobile OTP, and date of birth verification.',
    isStepVisible: () => true,
  },
  {
    id: 'step-2-kyc-verification',
    stepNumber: 2,
    title: 'KYC & Aadhaar Authentication',
    shortTitle: 'KYC',
    description: 'UIDAI Aadhaar Verhoeff validation, CKYC registry lookup, and DigiLocker consent.',
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
 *
 * @param {object} [formData]
 * @returns {Array} Visible step definitions
 */
export function getVisibleSteps(formData) {
  return STEPS.filter((step) => step.isStepVisible(formData));
}

/**
 * Checks whether a specific step number is visible given the form state.
 *
 * @param {number} stepNumber
 * @param {object} [formData]
 * @returns {boolean}
 */
export function isStepActive(stepNumber, formData) {
  const step = STEPS.find((s) => s.stepNumber === stepNumber);
  return step ? step.isStepVisible(formData) : false;
}

/**
 * Resolves the next visible step number, jumping over any skipped/hidden steps.
 *
 * @param {number} currentStep
 * @param {object} [formData]
 * @returns {number}
 */
export function getNextVisibleStep(currentStep, formData) {
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
 *
 * @param {number} currentStep
 * @param {object} [formData]
 * @returns {number}
 */
export function getPreviousVisibleStep(currentStep, formData) {
  const visibleSteps = getVisibleSteps(formData);
  const currentIndex = visibleSteps.findIndex((s) => s.stepNumber === currentStep);

  if (currentIndex > 0) {
    return visibleSteps[currentIndex - 1].stepNumber;
  }

  return currentStep;
}

export default STEPS;
