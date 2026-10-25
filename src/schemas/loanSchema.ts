import { z } from 'zod';

import { MAX_LOAN_AMOUNT, MIN_LOAN_AMOUNT } from '@/constants/loanConstants';

import { aadhaarSchema } from './aadhaarSchema';
import { ifscSchema } from './ifscSchema';
import { panSchema } from './panSchema';
import { step1BaseSchema } from './step1Schema';
import { step2BaseSchema } from './step2Schema';
import { step3BaseSchema } from './step3Schema';
import { step4BaseSchema } from './step4Schema';
import { step5BaseSchema } from './step5Schema';
import { step6BaseSchema as step6BaseFromStep6 } from './step6Schema';
import { step7BaseSchema as step7BaseFromStep7 } from './step7Schema';

// Common Indian mobile regex (starts with 6, 7, 8, or 9 and has 10 digits)
const indianMobileRegex = /^[6-9]\d{9}$/;
const indianPincodeRegex = /^[1-9][0-9]{5}$/;

/**
 * Step 1: Personal & Primary Identity Schema (Legacy / Sub-schema)
 */
export const step1IdentitySchema = z.object({
  fullName: z
    .string({ required_error: 'Full name as per PAN is required' })
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(70, 'Name cannot exceed 70 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name should only contain alphabets and spaces'),
  panNumber: panSchema,
  mobileNumber: z
    .string({ required_error: 'Mobile number is required' })
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => indianMobileRegex.test(val), {
      message: 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9',
    }),
  isMobileVerified: z.boolean().refine((val) => val === true, {
    message: 'Mobile OTP verification is mandatory',
  }),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Enter a valid email address')
    .toLowerCase(),
  dateOfBirth: z
    .string({ required_error: 'Date of birth is required' })
    .refine((val) => {
      const dob = new Date(val);
      if (isNaN(dob.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= 21 && age <= 60;
    }, {
      message: 'Applicant must be between 21 and 60 years of age as per RBI lending guidelines',
    }),
  gender: z.enum(['male', 'female', 'transgender', 'prefer_not_to_say'], {
    required_error: 'Please select gender',
  }),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
    required_error: 'Please select marital status',
  }),
});

/**
 * Step 2: KYC & Identity Verification Schema (Legacy / Sub-schema)
 */
export const step2KycSchema = z.object({
  aadhaarNumber: aadhaarSchema,
  isAadhaarVerified: z.boolean().refine((val) => val === true, {
    message: 'Aadhaar e-KYC authentication is required',
  }),
  digiLockerConsent: z.boolean().refine((val) => val === true, {
    message: 'Consent for DigiLocker document fetch is mandatory',
  }),
  ckycConsent: z.boolean().refine((val) => val === true, {
    message: 'Consent for CKYC registry lookup is mandatory',
  }),
  panCardHolderName: z.string().optional(),
});

/**
 * Step 3: Employment & Income Schema (Legacy / Sub-schema)
 */
export const step3EmploymentSchema = z.object({
  employmentType: z.enum(['salaried', 'self_employed_professional', 'business_owner'], {
    required_error: 'Please select your employment type',
  }),
  employerName: z
    .string({ required_error: 'Employer / Business name is required' })
    .trim()
    .min(2, 'Employer name must be at least 2 characters')
    .max(100, 'Employer name cannot exceed 100 characters'),
  officialEmail: z.string().trim().email('Invalid official email format').optional().or(z.literal('')),
  monthlyNetIncome: z
    .number({ required_error: 'Monthly net in-hand salary is required' })
    .min(25000, 'Minimum monthly net income of ₹25,000 required for LendSwift eligibility')
    .max(5000000, 'Income exceeds maximum personal loan limit'),
  salaryCreditMode: z.enum(['bank_transfer', 'cheque', 'cash'], {
    required_error: 'Please specify how salary is received',
  }).refine((val) => val !== 'cash', {
    message: 'RBI regulations require demonstrable bank or cheque salary credits',
  }),
  totalWorkExperienceMonths: z
    .number({ required_error: 'Total work experience is required' })
    .min(6, 'Minimum 6 months of verifiable work experience required'),
  existingMonthlyEmi: z
    .number()
    .min(0, 'Existing monthly EMI cannot be negative')
    .default(0),
});

/**
 * Step 4: Loan Requirement & Terms Schema (Legacy / Sub-schema)
 */
export const step4LoanRequirementSchema = z.object({
  loanAmount: z
    .number({ required_error: 'Please choose a loan amount' })
    .min(MIN_LOAN_AMOUNT, `Minimum loan amount is ₹${MIN_LOAN_AMOUNT.toLocaleString('en-IN')}`)
    .max(MAX_LOAN_AMOUNT, `Maximum loan amount is ₹${MAX_LOAN_AMOUNT.toLocaleString('en-IN')}`),
  tenureMonths: z
    .number({ required_error: 'Please select loan repayment tenure' })
    .min(6, 'Minimum tenure is 6 months')
    .max(60, 'Maximum tenure is 60 months'),
  loanPurpose: z.enum(
    [
      'medical_emergency',
      'home_renovation',
      'education',
      'debt_consolidation',
      'wedding_family_event',
      'business_expansion',
      'travel_vacation',
      'vehicle_purchase',
      'other',
    ],
    { required_error: 'Please specify the purpose of the loan' }
  ),
  customPurposeDetails: z.string().max(250).optional(),
  acceptedInterestRate: z.number().min(8).max(36),
  calculatedEmi: z.number().positive('Calculated EMI must be greater than zero'),
  keyFactStatementAcknowledged: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the RBI Key Fact Statement (KFS) before proceeding',
  }),
});

/**
 * Address Sub-schema
 */
const addressSubSchema = z.object({
  line1: z
    .string({ required_error: 'Address line 1 is required' })
    .trim()
    .min(5, 'Address line must be at least 5 characters')
    .max(120, 'Address cannot exceed 120 characters'),
  line2: z.string().trim().max(120).optional(),
  landmark: z.string().trim().max(80).optional(),
  pincode: z
    .string({ required_error: 'PIN code is required' })
    .trim()
    .refine((val) => indianPincodeRegex.test(val), {
      message: 'Enter a valid 6-digit Indian postal PIN code',
    }),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City name is required'),
  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State name is required'),
  residenceType: z.enum(['owned_self', 'owned_family', 'rented', 'company_provided'], {
    required_error: 'Select residential status',
  }),
  yearsAtCurrentAddress: z
    .number({ required_error: 'Specify duration at address' })
    .min(0, 'Cannot be negative')
    .max(70, 'Invalid duration'),
});

/**
 * Step 5: Residential Address Schema (Legacy / Sub-schema)
 */
export const step5AddressLegacySchema = z.object({
  currentAddress: addressSubSchema.optional(),
  isPermanentSameAsCurrent: z.boolean().optional(),
  permanentAddress: addressSubSchema.optional(),
});

/**
 * Step 6: Bank Account & Disbursal Base Schema (Legacy / Sub-schema)
 */
export const step6BankBaseLegacySchema = z.object({
  bankAccountNumber: z
    .string({ required_error: 'Bank account number is required' })
    .trim()
    .min(9, 'Bank account must be between 9 and 18 digits')
    .max(18, 'Bank account cannot exceed 18 digits')
    .regex(/^\d+$/, 'Account number must contain only numbers')
    .optional()
    .or(z.literal('')),
  confirmBankAccountNumber: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  ifscCode: ifscSchema.optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),
  branchName: z.string().optional().or(z.literal('')),
  accountType: z.enum(['savings', 'current']).optional(),
  accountHolderName: z.string().optional().or(z.literal('')),
  eNachAutoDebitConsent: z.boolean().optional(),
});

/**
 * Step 7: Document Upload Verification Schema (Legacy / Sub-schema)
 */
export const step7LegacySchema = z.object({
  incomeProofType: z.enum(['salary_slip_3_months', 'itr_acknowledgment', 'bank_statement_6_months']).optional(),
  incomeProofFileName: z.string().optional(),
  bankStatementFileName: z.string().optional(),
  selfieVerificationConsent: z.boolean().optional(),
  geolocationConsent: z.boolean().optional(),
});

/**
 * Step 8: Final Review & e-Sign Agreement Schema
 */
export const step8Schema = z.object({
  cibilScoreConsent: z.boolean().refine((val) => val === true, {
    message: 'Explicit consent required to pull credit report from CIBIL / Experian',
  }),
  rbiFairPracticesConsent: z.boolean().refine((val) => val === true, {
    message: 'You must accept the NBFC Fair Practices Code and Loan Agreement terms',
  }),
  privacyPolicyConsent: z.boolean().refine((val) => val === true, {
    message: 'Acceptance of RBI Digital Lending Data Protection Privacy Policy is required',
  }),
  eSignOtpVerified: z.boolean().refine((val) => val === true, {
    message: 'Aadhaar e-Sign OTP confirmation is required to execute the digital contract',
  }),
  applicationReferenceNumber: z.string().optional(),
  submissionTimestamp: z.string().optional(),
});

/**
 * Full Composite Loan Application Schema
 */
export const loanApplicationSchema = step1BaseSchema
  .merge(step2BaseSchema)
  .merge(step3BaseSchema)
  .merge(step4BaseSchema)
  .merge(step5BaseSchema)
  .merge(step6BaseFromStep6)
  .merge(step7BaseFromStep7)
  .merge(step1IdentitySchema)
  .merge(step2KycSchema)
  .merge(step3EmploymentSchema)
  .merge(step4LoanRequirementSchema)
  .merge(step5AddressLegacySchema)
  .merge(step6BankBaseLegacySchema)
  .merge(step7LegacySchema)
  .merge(step8Schema);

