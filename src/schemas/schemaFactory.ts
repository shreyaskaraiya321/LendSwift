import { z, ZodTypeAny } from 'zod';

import { StepNumber } from '@/types/wizard';

import { step1Schema } from './step1Schema';
import { step2Schema } from './step2Schema';
import { step3Schema } from './step3Schema';
import { step4Schema } from './step4Schema';
import { step5Schema } from './step5Schema';
import { step6Schema } from './step6Schema';
import { step7Schema } from './step7Schema';
import { step8Schema } from './step8Schema';



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
      return ['loanType', 'loanAmount', 'loanTenure', 'loanPurpose', 'referralCode'];
    case 2:
      return [
        'fullName',
        'dob',
        'gender',
        'maritalStatus',
        'fatherName',
        'motherName',
        'email',
        'mobileNumber',
        'alternateMobile',
      ];
    case 3:
      return [
        'panNumber',
        'aadhaarNumber',
        'aadhaarConsent',
        'voterId',
        'passportNumber',
      ];
    case 4:
      return [
        'currentAddressLine1',
        'currentAddressLine2',
        'pincode',
        'city',
        'state',
        'residenceType',
        'yearsAtAddress',
        'monthlyRentAmount',
        'previousAddressLine',
        'sameAsPermanent',
        'permanentAddressLine1',
        'permanentAddressLine2',
        'permanentPincode',
        'permanentCity',
        'permanentState',
      ];
    case 5:
      return [
        'employmentType',
        'companyName',
        'designation',
        'monthlyNetSalary',
        'yearsOfExperience',
        'businessName',
        'businessType',
        'annualTurnover',
        'yearsInBusiness',
        'monthlyIncome',
        'gstNumber',
        'businessAddress',
      ];
    case 6:
      return [
        'coApplicantName',
        'relationship',
        'coApplicantPan',
        'coApplicantIncome',
        'coApplicantConsent',
      ];
    case 7:
      return [
        'docPanCard',
        'docAadhaarFront',
        'docAadhaarBack',
        'docSalarySlips',
        'docItrReturns',
        'docPropertyDocs',
        'docBusinessRegistration',
        'digitalSignature',
      ];

    case 8:
      return [
        'consentInformationAccuracy',
        'consentCreditBureau',
        'consentTermsKfs',
        'consentRegulatoryComm',
      ];
    default:
      return [];
  }
}

