import { z } from 'zod';

const indianMobileRegex = /^[6-9]\d{9}$/;

/**
 * Calculates accurate age from YYYY-MM-DD string.
 *
 * @param {string} dobString
 * @returns {number}
 */
export function calculateAge(dobString) {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Step 2 Base Object Schema
 */
export const step2BaseSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name as per PAN is required' })
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(70, 'Name cannot exceed 70 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name should only contain alphabets and standard punctuation'),

  dob: z
    .string({ required_error: 'Date of birth is required' })
    .trim()
    .refine(
      (val) => {
        const age = calculateAge(val);
        return age >= 21 && age <= 65;
      },
      {
        message: 'Applicant must be between 21 and 65 years of age as per RBI lending guidelines',
      }
    ),

  gender: z.enum(['male', 'female', 'transgender', 'prefer_not_to_say'], {
    required_error: 'Please select gender',
  }),

  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
    required_error: 'Please select marital status',
  }),

  fatherName: z
    .string({ required_error: "Father's full name is required" })
    .trim()
    .min(3, "Father's name must be at least 3 characters")
    .max(70, "Father's name cannot exceed 70 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name should only contain alphabets and spaces'),

  motherName: z
    .string({ required_error: "Mother's full name is required" })
    .trim()
    .min(3, "Mother's name must be at least 3 characters")
    .max(70, "Mother's name cannot exceed 70 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name should only contain alphabets and spaces'),

  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Enter a valid email address')
    .toLowerCase(),

  isEmailVerified: z.boolean().optional().default(false),

  mobileNumber: z
    .string({ required_error: 'Mobile number is required' })
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => indianMobileRegex.test(val), {
      message: 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9',
    }),

  isMobileVerified: z.boolean().optional().default(false),

  alternateMobile: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => !val || indianMobileRegex.test(val), {
      message: 'Alternate mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9',
    })
    .optional()
    .or(z.literal('')),

  // Optional cross-step context passed from Step 1
  loanTenure: z.coerce.number().optional(),
});

/**
 * Step 2 Schema: Personal Information & Statutory Age Gating
 */
export const step2Schema = step2BaseSchema.superRefine((data, ctx) => {
    // 1. Alternate mobile number must differ from primary mobile number
    if (data.alternateMobile && data.alternateMobile === data.mobileNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobile'],
        message: 'Alternate mobile number must be different from primary mobile number',
      });
    }

    // 2. Dynamic cross-step logic: Age + loan tenure must not exceed 65 years
    if (data.dob && data.loanTenure) {
      const currentAge = calculateAge(data.dob);
      const tenureInYears = data.loanTenure / 12;
      const ageAtMaturity = currentAge + tenureInYears;

      if (ageAtMaturity > 65) {
        const maxPermittedTenureMonths = Math.max(12, Math.floor((65 - currentAge) * 12));
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dob'],
          message: `Applicant age (${currentAge} yrs) plus tenure (${Math.ceil(tenureYears(data.loanTenure))} yrs) exceeds 65 years at maturity. Maximum tenure allowed for your age is ${maxPermittedTenureMonths} months.`,
        });
      }
    }
  });

function tenureYears(months) {
  return months ? months / 12 : 0;
}

export default step2Schema;
