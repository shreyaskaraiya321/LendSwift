import { z } from 'zod';

/**
 * Official LendSwift Statutory Loan Category Constraints
 */
export const LOAN_TYPE_CONSTRAINTS = {
  Personal: {
    minAmount: 50000,
    maxAmount: 1000000, // ₹10,00,000
    minTenure: 12,
    maxTenure: 60,
    defaultAmount: 300000,
    defaultTenure: 36,
    interestRate: 10.5,
    amountStep: 10000,
    tenureStep: 6,
    purposes: [
      'Debt Consolidation',
      'Home Renovation',
      'Medical Emergency',
      'Wedding & Family Event',
      'Higher Education',
      'Travel & Vacation',
      'Consumer Electronics / Vehicle',
      'Other Personal Expense',
    ],
  },
  Home: {
    minAmount: 500000,
    maxAmount: 10000000, // ₹1,00,00,000
    minTenure: 60,
    maxTenure: 360,
    defaultAmount: 3500000,
    defaultTenure: 240,
    interestRate: 8.5,
    amountStep: 50000,
    tenureStep: 12,
    purposes: [
      'Purchase of Ready-to-Move Flat/Apartment',
      'Under-Construction Property Purchase',
      'Plot Purchase & Home Construction',
      'Home Extension & Floor Addition',
      'Balance Transfer & Top-Up Home Loan',
    ],
  },
  Business: {
    minAmount: 100000,
    maxAmount: 5000000, // ₹50,00,000
    minTenure: 12,
    maxTenure: 120,
    defaultAmount: 1500000,
    defaultTenure: 48,
    interestRate: 14.0,
    amountStep: 25000,
    tenureStep: 6,
    purposes: [
      'Working Capital & Inventory Purchase',
      'Machinery & Commercial Equipment Purchase',
      'Branch & Infrastructure Expansion',
      'Vendor & Supplier Payments',
      'Business Digitalization & Technology',
    ],
  },
};

/**
 * Step 1 Base Object Schema
 */
export const step1BaseSchema = z.object({
  loanType: z.enum(['Personal', 'Home', 'Business'], {
    required_error: 'Please select a loan type (Personal, Home, or Business)',
  }),
  loanAmount: z.coerce
    .number({ required_error: 'Loan amount is required', invalid_type_error: 'Enter a valid amount' })
    .positive('Loan amount must be greater than zero'),
  loanTenure: z.coerce
    .number({ required_error: 'Loan tenure is required', invalid_type_error: 'Enter a valid tenure in months' })
    .int('Tenure must be an integer in months')
    .positive('Tenure must be greater than zero'),
  loanPurpose: z
    .string({ required_error: 'Loan purpose is required' })
    .trim()
    .min(1, 'Please select or enter the purpose of your loan'),
  referralCode: z
    .string()
    .trim()
    .max(16, 'Referral code cannot exceed 16 characters')
    .regex(/^[a-zA-Z0-9_-]*$/, 'Referral code must contain only alphanumeric characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Step 1 Schema: Loan Terms & Category Selection
 */
export const step1Schema = step1BaseSchema.superRefine((data, ctx) => {
    const limits = LOAN_TYPE_CONSTRAINTS[data.loanType];
    if (!limits) return;

    // Loan Amount boundary check
    if (data.loanAmount < limits.minAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanAmount'],
        message: `Minimum loan amount for ${data.loanType} Loan is ₹${limits.minAmount.toLocaleString('en-IN')}`,
      });
    } else if (data.loanAmount > limits.maxAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanAmount'],
        message: `Maximum loan amount for ${data.loanType} Loan is ₹${limits.maxAmount.toLocaleString('en-IN')}`,
      });
    }

    // Loan Tenure boundary check
    if (data.loanTenure < limits.minTenure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanTenure'],
        message: `Minimum tenure for ${data.loanType} Loan is ${limits.minTenure} months (${limits.minTenure / 12} yrs)`,
      });
    } else if (data.loanTenure > limits.maxTenure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanTenure'],
        message: `Maximum tenure for ${data.loanType} Loan is ${limits.maxTenure} months (${limits.maxTenure / 12} yrs)`,
      });
    }
  });

export default step1Schema;
