import { z, ZodTypeAny } from 'zod';

import { StepNumber } from '@/types/wizard';

import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
} from './loanSchema';

/**
 * Returns the exact Zod schema for validating the specified step.
 * Enables step-level isolation and progressive validation in React Hook Form.
 */
export function getStepSchema(step: StepNumber): ZodTypeAny {
  switch (step) {
    case 1:
      return step1Schema;
    case 2:
      return step2Schema;
    case 3:
      return step3Schema;
    case 4:
      return step4Schema;
    case 5:
      return step5Schema;
    case 6:
      return step6Schema;
    case 7:
      return step7Schema;
    case 8:
      return step8Schema;
    default:
      return z.object({});
  }
}

/**
 * Returns the list of field names that belong to a specific step.
 * Useful for triggering step-specific validation triggers in react-hook-form: `trigger(getStepFields(currentStep))`
 */
export function getStepFields(step: StepNumber): string[] {
  switch (step) {
    case 1:
      return ['fullName', 'panNumber', 'mobileNumber', 'isMobileVerified', 'email', 'dateOfBirth', 'gender', 'maritalStatus'];
    case 2:
      return ['aadhaarNumber', 'isAadhaarVerified', 'digiLockerConsent', 'ckycConsent'];
    case 3:
      return ['employmentType', 'employerName', 'officialEmail', 'monthlyNetIncome', 'salaryCreditMode', 'totalWorkExperienceMonths', 'existingMonthlyEmi'];
    case 4:
      return ['loanAmount', 'tenureMonths', 'loanPurpose', 'customPurposeDetails', 'acceptedInterestRate', 'calculatedEmi', 'keyFactStatementAcknowledged'];
    case 5:
      return ['currentAddress', 'isPermanentSameAsCurrent', 'permanentAddress'];
    case 6:
      return ['bankAccountNumber', 'confirmBankAccountNumber', 'ifscCode', 'bankName', 'branchName', 'accountType', 'accountHolderName', 'eNachAutoDebitConsent'];
    case 7:
      return ['incomeProofType', 'incomeProofFileName', 'bankStatementFileName', 'selfieVerificationConsent', 'geolocationConsent'];
    case 8:
      return ['cibilScoreConsent', 'rbiFairPracticesConsent', 'privacyPolicyConsent', 'eSignOtpVerified'];
    default:
      return [];
  }
}
