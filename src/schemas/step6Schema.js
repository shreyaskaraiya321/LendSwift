import { z } from 'zod';

import { PAN_REGEX, validatePAN } from '../utils/validators.js';

export const RELATIONSHIP_OPTIONS = ['Spouse', 'Parent', 'Sibling', 'Business Partner'];

/**
 * Step 6 Base Object Schema
 */
export const step6BaseSchema = z.object({
  coApplicantName: z
    .string({ required_error: 'Co-applicant full legal name as per PAN is required' })
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(70, 'Name cannot exceed 70 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name should only contain alphabets and spaces'),

  relationship: z.enum(['Spouse', 'Parent', 'Sibling', 'Business Partner'], {
    required_error: 'Please select relationship with co-applicant',
  }),

  coApplicantPan: z
    .string({ required_error: 'Co-applicant PAN number is required' })
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => PAN_REGEX.test(val), {
      message: 'Invalid PAN structure. Must be 5 uppercase letters, 4 numbers, and 1 letter (e.g. ABCDE1234F)',
    }),

  coApplicantIncome: z.coerce
    .number({
      required_error: 'Co-applicant monthly income is required',
      invalid_type_error: 'Enter valid monthly income',
    })
    .min(10000, 'Minimum co-applicant monthly income must be at least ₹10,000')
    .max(5000000, 'Income exceeds maximum permissible limit'),

  coApplicantConsent: z.boolean({
    required_error: 'Co-applicant statutory consent is mandatory',
  }).refine((val) => val === true, {
    message: 'Co-applicant consent for credit bureau evaluation and KYC verification is required',
  }),

  // Cross-step context
  panNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  isCoApplicantPanVerified: z.boolean().optional(),
});

/**
 * Step 6 Schema with PAN verification and identity divergence check
 */
export const step6Schema = step6BaseSchema.superRefine((data, ctx) => {
  // 1. Co-applicant PAN cannot be the same as primary applicant's PAN
  if (data.panNumber && data.coApplicantPan) {
    const primaryPan = data.panNumber.trim().toUpperCase();
    const coPan = data.coApplicantPan.trim().toUpperCase();
    if (primaryPan === coPan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coApplicantPan'],
        message: 'Co-applicant PAN cannot be identical to primary applicant PAN',
      });
    }
  }

  // 2. Validate PAN entity format (Individual 'P' required unless Business Partner)
  const panResult = validatePAN(data.coApplicantPan, 'Personal');
  if (data.relationship !== 'Business Partner' && !panResult.isValid && panResult.error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['coApplicantPan'],
      message: panResult.error,
    });
  }
});

export default step6Schema;
