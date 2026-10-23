import { z } from 'zod';

/**
 * Validates Indian Permanent Account Number (PAN):
 * 1. 10 alphanumeric characters
 * 2. Format: [A-Z]{5}[0-9]{4}[A-Z]{1}
 * 3. 4th character must be 'P' for Individual borrower
 * 4. Normalizes input to uppercase
 */
export const panSchema = z
  .string({ required_error: 'PAN is mandatory for credit assessment' })
  .trim()
  .transform((val) => val.toUpperCase())
  .refine((val) => val.length === 10, {
    message: 'PAN must be exactly 10 characters',
  })
  .refine((val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), {
    message: 'Invalid PAN structure. Must match format: ABCDE1234F',
  })
  .refine((val) => val[3] === 'P', {
    message: '4th character must be "P" for Individual loan applicants',
  });
