import { z } from 'zod';

import { validateVerhoeff } from '@/utils/verhoeff';

/**
 * Validates 12-digit Indian Aadhaar Number:
 * 1. Must be exactly 12 numerical digits
 * 2. Cannot start with 0 or 1 (UIDAI allocation standard)
 * 3. Must satisfy the Verhoeff checksum algorithm
 */
export const aadhaarSchema = z
  .string({ required_error: 'Aadhaar is required for e-KYC verification' })
  .trim()
  .transform((val) => val.replace(/\s+/g, ''))
  .refine((val) => /^\d{12}$/.test(val), {
    message: 'Aadhaar must be exactly 12 numeric digits',
  })
  .refine((val) => !val.startsWith('0') && !val.startsWith('1'), {
    message: 'Aadhaar cannot begin with 0 or 1',
  })
  .refine((val) => validateVerhoeff(val), {
    message: 'Invalid Aadhaar checksum (Verhoeff check failed)',
  });
