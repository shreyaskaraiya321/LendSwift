import { z } from 'zod';

import { validateGSTIN } from '../utils/validators.js';

/**
 * 1. Salaried Branch Schema
 */
export const salariedEmploymentSchema = z.object({
  employmentType: z.literal('Salaried'),
  companyName: z
    .string({ required_error: 'Employer / Company name is required' })
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name cannot exceed 100 characters'),
  designation: z
    .string({ required_error: 'Designation is required' })
    .trim()
    .min(2, 'Designation must be at least 2 characters')
    .max(100, 'Designation cannot exceed 100 characters'),
  monthlyNetSalary: z.coerce
    .number({
      required_error: 'Monthly net salary is required',
      invalid_type_error: 'Enter valid monthly salary',
    })
    .min(15000, 'Minimum monthly net salary must be at least ₹15,000'),
  yearsOfExperience: z.coerce
    .number({
      required_error: 'Total years of experience is required',
      invalid_type_error: 'Enter valid years of experience',
    })
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
  loanType: z.string().optional(),
});

/**
 * 2. Self-Employed Branch Schema
 */
export const selfEmployedSchema = z.object({
  employmentType: z.literal('Self-Employed'),
  businessName: z
    .string({ required_error: 'Business / Profession name is required' })
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters'),
  businessType: z
    .string({ required_error: 'Business type or profession is required' })
    .trim()
    .min(2, 'Please select or enter your business type'),
  annualTurnover: z.coerce
    .number({
      required_error: 'Annual turnover is required',
      invalid_type_error: 'Enter valid annual turnover',
    })
    .min(300000, 'Minimum annual turnover must be at least ₹3,00,000'),
  yearsInBusiness: z.coerce
    .number({
      required_error: 'Years in business is required',
      invalid_type_error: 'Enter valid years in business',
    })
    .min(2, 'Minimum 2 years in business required for credit assessment'),
  monthlyIncome: z.coerce
    .number({
      required_error: 'Estimated monthly income is required',
      invalid_type_error: 'Enter valid monthly income',
    })
    .min(15000, 'Monthly income must be at least ₹15,000'),
  loanType: z.string().optional(),
});

/**
 * 3. Business Owner Branch Schema
 */
export const businessOwnerSchema = z.object({
  employmentType: z.literal('Business Owner'),
  businessName: z
    .string({ required_error: 'Registered enterprise name is required' })
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters'),
  businessType: z
    .string({ required_error: 'Business constitution type is required' })
    .trim()
    .min(2, 'Please select business constitution type'),
  annualTurnover: z.coerce
    .number({
      required_error: 'Annual turnover is required',
      invalid_type_error: 'Enter valid annual turnover',
    })
    .min(300000, 'Minimum annual turnover must be at least ₹3,00,000'),
  yearsInBusiness: z.coerce
    .number({
      required_error: 'Years in business is required',
      invalid_type_error: 'Enter valid years in business',
    })
    .min(1, 'Minimum 1 year in business required'),
  monthlyIncome: z.coerce
    .number({
      required_error: 'Monthly income / drawing is required',
      invalid_type_error: 'Enter valid monthly income',
    })
    .min(15000, 'Monthly income must be at least ₹15,000'),
  gstNumber: z
    .string({ required_error: '15-character GSTIN is required' })
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => validateGSTIN(val).isValid, {
      message: 'Invalid 15-character GSTIN format with valid state code and embedded PAN structure',
    }),
  businessAddress: z
    .string({ required_error: 'Registered business address is required' })
    .trim()
    .min(5, 'Business address must be at least 5 characters')
    .max(200, 'Business address cannot exceed 200 characters'),
  loanType: z.string().optional(),
});

/**
 * Discriminated Union across 3 employment types
 */
export const step5EmploymentUnion = z.discriminatedUnion('employmentType', [
  salariedEmploymentSchema,
  selfEmployedSchema,
  businessOwnerSchema,
]);

/**
 * Step 5 Schema with Cross-Step Validation:
 * If Step 1 loanType === 'Business', enforce that employmentType cannot be 'Salaried'.
 */
export const step5Schema = step5EmploymentUnion.superRefine((data, ctx) => {
  const normalizedLoanType = String(data.loanType || '').trim().toLowerCase();
  if (normalizedLoanType === 'business' && data.employmentType === 'Salaried') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['employmentType'],
      message: 'Business loans require applicant to be Self-Employed or a Business Owner. Salaried applicants are not eligible.',
    });
  }
});

/**
 * Base Object Schema for composite whole-form merging in loanApplicationSchema
 */
export const step5BaseSchema = z.object({
  employmentType: z.enum(['Salaried', 'Self-Employed', 'Business Owner'], {
    required_error: 'Please select your employment type',
  }).default('Salaried'),
  companyName: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  monthlyNetSalary: z.coerce.number().optional(),
  yearsOfExperience: z.coerce.number().optional(),
  businessName: z.string().optional().or(z.literal('')),
  businessType: z.string().optional().or(z.literal('')),
  annualTurnover: z.coerce.number().optional(),
  yearsInBusiness: z.coerce.number().optional(),
  monthlyIncome: z.coerce.number().optional(),
  gstNumber: z.string().optional().or(z.literal('')),
  businessAddress: z.string().optional().or(z.literal('')),
});

export default step5Schema;
