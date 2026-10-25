import { z } from 'zod';

export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Step 4 Base Object Schema
 */
export const step4BaseSchema = z.object({
  currentAddressLine1: z
    .string({ required_error: 'Flat / House number and Building name is required' })
    .trim()
    .min(3, 'Address line must be at least 3 characters')
    .max(120, 'Address line cannot exceed 120 characters'),

  currentAddressLine2: z
    .string()
    .trim()
    .max(120, 'Address line 2 cannot exceed 120 characters')
    .optional()
    .or(z.literal('')),

  pincode: z
    .string({ required_error: '6-digit PIN code is required' })
    .trim()
    .refine((val) => PINCODE_REGEX.test(val), {
      message: 'Enter a valid 6-digit Indian PIN code',
    }),

  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City must be at least 2 characters'),

  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State must be at least 2 characters'),

  residenceType: z.enum(['Owned', 'Rented', 'Company', 'Family'], {
    required_error: 'Please select residence ownership type',
  }),

  yearsAtAddress: z.coerce
    .number({ required_error: 'Please specify years at current address', invalid_type_error: 'Enter valid number of years' })
    .min(0, 'Years at address cannot be negative')
    .max(100, 'Years at address cannot exceed 100'),

  monthlyRentAmount: z.coerce.number().optional(),

  previousAddressLine: z.string().optional().or(z.literal('')),

  sameAsPermanent: z.boolean().default(true),

  permanentAddressLine1: z.string().optional().or(z.literal('')),
  permanentAddressLine2: z.string().optional().or(z.literal('')),
  permanentPincode: z.string().optional().or(z.literal('')),
  permanentCity: z.string().optional().or(z.literal('')),
  permanentState: z.string().optional().or(z.literal('')),
});

/**
 * Step 4 Schema with conditional rent, previous address, and permanent address checks
 */
export const step4Schema = step4BaseSchema.superRefine((data, ctx) => {
  // 1. If residenceType === 'Rented', monthlyRentAmount is mandatory and > 0
  if (data.residenceType === 'Rented') {
    if (!data.monthlyRentAmount || data.monthlyRentAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['monthlyRentAmount'],
        message: 'Monthly rent amount is required for rented residence',
      });
    }
  }

  // 2. If yearsAtAddress < 1, previousAddressLine is mandatory
  if (Number(data.yearsAtAddress) < 1) {
    if (!data.previousAddressLine || data.previousAddressLine.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['previousAddressLine'],
        message: 'Previous address is mandatory when staying less than 1 year at current residence',
      });
    }
  }

  // 3. If !sameAsPermanent, permanent address fields are mandatory
  if (!data.sameAsPermanent) {
    if (!data.permanentAddressLine1 || data.permanentAddressLine1.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['permanentAddressLine1'],
        message: 'Permanent address line 1 is required',
      });
    }

    if (!data.permanentPincode || !PINCODE_REGEX.test(data.permanentPincode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['permanentPincode'],
        message: 'Valid 6-digit permanent address PIN code is required',
      });
    }

    if (!data.permanentCity || data.permanentCity.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['permanentCity'],
        message: 'Permanent city is required',
      });
    }

    if (!data.permanentState || data.permanentState.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['permanentState'],
        message: 'Permanent state is required',
      });
    }
  }
});

export default step4Schema;
