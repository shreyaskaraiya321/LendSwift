import { z } from 'zod';

/**
 * Validates Indian Financial System Code (IFSC):
 * 1. Exactly 11 characters
 * 2. First 4 characters must be alphabetic (Bank code)
 * 3. 5th character must be '0' (Reserved)
 * 4. Last 6 characters are alphanumeric (Branch identifier)
 */
export const ifscSchema = z
  .string({ required_error: 'IFSC code is required for disbursal' })
  .trim()
  .transform((val) => val.toUpperCase())
  .refine((val) => val.length === 11, {
    message: 'IFSC must be exactly 11 characters',
  })
  .refine((val) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val), {
    message: 'Invalid IFSC format. 5th character must be 0 (e.g., HDFC0001234)',
  });
