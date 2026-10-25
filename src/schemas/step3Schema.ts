import { z } from 'zod';

import { validateAadhaarVerhoeff, validatePAN } from '@/utils/validators';

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const VOTER_ID_REGEX = /^[A-Z]{3}[0-9]{7}$/;
export const PASSPORT_REGEX = /^[A-Z][0-9]{7}$/;

/**
 * Step 3 Base Object Schema
 */
export const step3BaseSchema = z.object({
  panNumber: z
    .string({ required_error: 'PAN number is required' })
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => PAN_REGEX.test(val), {
      message: 'Invalid PAN format. Must be 5 uppercase letters, 4 numbers, and 1 letter (e.g. ABCDE1234F)',
    }),

  aadhaarNumber: z
    .string({ required_error: '12-digit Aadhaar number is required' })
    .trim()
    .transform((val) => val.replace(/\s+/g, ''))
    .refine((val) => /^\d{12}$/.test(val), {
      message: 'Aadhaar must be exactly 12 numeric digits',
    })
    .refine((val) => validateAadhaarVerhoeff(val), {
      message: 'Aadhaar checksum failed. Please verify the 12 digits.',
    }),

  aadhaarConsent: z.boolean({
    required_error: 'UIDAI Aadhaar consent is mandatory',
  }).refine((val) => val === true, {
    message: 'You must provide consent for UIDAI Aadhaar verification under RBI & PMLA norms',
  }),

  voterId: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => !val || VOTER_ID_REGEX.test(val), {
      message: 'Invalid Voter ID format. Expected 3 letters followed by 7 digits (e.g. ABC1234567)',
    })
    .optional()
    .or(z.literal('')),

  passportNumber: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => !val || PASSPORT_REGEX.test(val), {
      message: 'Invalid Indian Passport format. Expected 1 letter followed by 7 digits (e.g. A1234567)',
    })
    .optional()
    .or(z.literal('')),

  // Cross-step context fields
  loanType: z.string().optional(),
  loanAmount: z.coerce.number().optional(),
  isPanVerified: z.boolean().optional(),
  isAadhaarVerified: z.boolean().optional(),
});

/**
 * Step 3 Schema with dynamic PAN entity and conditional passport validation
 */
export const step3Schema = step3BaseSchema.superRefine((data, ctx) => {
  // 1. PAN Entity validation against loan type
  const panResult = validatePAN(data.panNumber, data.loanType);
  if (!panResult.isValid && panResult.error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['panNumber'],
      message: panResult.error,
    });
  }

  // 2. Conditional Passport check: mandatory if Home Loan > ₹50,00,000
  const isHomeLoan = String(data.loanType || '').trim().toLowerCase() === 'home';
  const isAboveFiftyLakhs = Number(data.loanAmount || 0) > 5000000;

  if (isHomeLoan && isAboveFiftyLakhs) {
    if (!data.passportNumber || !PASSPORT_REGEX.test(data.passportNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passportNumber'],
        message: 'Passport number is mandatory for Home Loans exceeding ₹50 Lakhs under statutory AML/PMLA regulations',
      });
    }
  }
});

export type Step3FormData = z.infer<typeof step3Schema>;
export default step3Schema;
