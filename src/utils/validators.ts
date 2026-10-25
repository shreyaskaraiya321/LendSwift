import pinCodeDataset from './pinCodeData.json';

/**
 * ============================================================================
 * 1. PAN (Permanent Account Number) Validation
 * ============================================================================
 */

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export type PanEntityType =
  | 'Individual'
  | 'Company'
  | 'Partnership Firm'
  | 'Hindu Undivided Family (HUF)'
  | 'Association of Persons (AOP)'
  | 'Trust'
  | 'Body of Individuals (BOI)'
  | 'Local Authority'
  | 'Artificial Juridical Person'
  | 'Government Agency'
  | 'Unknown';

export const PAN_ENTITY_MAP: Record<string, PanEntityType> = {
  P: 'Individual',
  C: 'Company',
  F: 'Partnership Firm',
  H: 'Hindu Undivided Family (HUF)',
  A: 'Association of Persons (AOP)',
  T: 'Trust',
  B: 'Body of Individuals (BOI)',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  G: 'Government Agency',
};

export interface PanValidationResult {
  isValid: boolean;
  entityType: string | null;
  error: string | null;
}

/**
 * Validates an Indian PAN number against format specification and loan-type entity rules.
 *
 * Statutory Rules:
 * - Format: 5 uppercase letters, 4 digits, 1 uppercase letter (e.g. ABCDE1234F).
 * - 4th character:
 *     'P' -> Individual (strictly required for Personal and Home loans).
 *     'C' -> Company, 'F' -> Partnership Firm, 'P' -> Sole Proprietor (allowed for Business loans).
 *
 * @param pan - 10-character PAN string
 * @param loanType - Optional loan category ('personal', 'home', 'business')
 * @returns {PanValidationResult}
 */
export function validatePAN(pan: string, loanType?: string): PanValidationResult {
  if (!pan || typeof pan !== 'string') {
    return {
      isValid: false,
      entityType: null,
      error: 'PAN is required and must be a valid string',
    };
  }

  const normalizedPan = pan.trim().toUpperCase();

  if (!PAN_REGEX.test(normalizedPan)) {
    return {
      isValid: false,
      entityType: null,
      error: 'Invalid PAN structure. Must match format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)',
    };
  }

  const fourthChar = normalizedPan.charAt(3);
  const entityType = PAN_ENTITY_MAP[fourthChar] || 'Unknown';

  if (!loanType) {
    return {
      isValid: true,
      entityType,
      error: null,
    };
  }

  const normalizedLoan = String(loanType).trim().toLowerCase();

  // Personal and Home loans require 'P' (Individual borrower)
  if (normalizedLoan.includes('personal') || normalizedLoan.includes('home')) {
    if (fourthChar !== 'P') {
      return {
        isValid: false,
        entityType,
        error: `Personal and Home loans require an Individual PAN (4th character "P"). Found: "${fourthChar}" (${entityType})`,
      };
    }
    return {
      isValid: true,
      entityType,
      error: null,
    };
  }

  // Business loans allow 'C' (Company), 'F' (Partnership Firm), and 'P' (Proprietorship)
  if (normalizedLoan.includes('business')) {
    if (fourthChar === 'C' || fourthChar === 'F' || fourthChar === 'P') {
      return {
        isValid: true,
        entityType,
        error: null,
      };
    }
    return {
      isValid: false,
      entityType,
      error: `Business loans require a Company ('C'), Partnership Firm ('F'), or Proprietorship ('P') PAN. Found: "${fourthChar}" (${entityType})`,
    };
  }

  return {
    isValid: true,
    entityType,
    error: null,
  };
}

/**
 * ============================================================================
 * 2. Aadhaar Verhoeff Checksum Algorithm
 * ============================================================================
 */

/**
 * Multiplication table (d) - 10 x 10 Dihedral group D5
 */
export const d: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

/**
 * Permutation table (p) - 8 x 10
 */
export const p: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Inverse table (inv) - 10 elements
 */
export const inv: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a 12-digit Aadhaar number using the statutory UIDAI Verhoeff checksum algorithm.
 *
 * @param aadhaarString - The Aadhaar number string
 * @returns boolean - true if exactly 12 numeric digits and Verhoeff checksum === 0
 */
export function validateAadhaarVerhoeff(aadhaarString: string): boolean {
  if (!aadhaarString || typeof aadhaarString !== 'string') return false;

  const sanitized = aadhaarString.replace(/\s+/g, '');
  if (!/^\d{12}$/.test(sanitized)) return false;

  let c = 0;
  const digits = sanitized.split('').map(Number).reverse();

  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    const pVal = p[i % 8][digit];
    c = d[c][pVal];
  }

  return c === 0;
}

/**
 * Generates the Verhoeff checksum digit for any numeric string.
 */
export function generateVerhoeffChecksum(numStr: string): number {
  const sanitized = numStr.replace(/\s+/g, '');
  let c = 0;
  const digits = sanitized.split('').map(Number).reverse();

  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    const pVal = p[(i + 1) % 8][digit];
    c = d[c][pVal];
  }

  return inv[c];
}

/**
 * ============================================================================
 * 3. PIN Code Dataset & Lookup Utilities
 * ============================================================================
 */

export interface PinCodeRecord {
  pincode: string;
  city: string;
  state: string;
  postOffice: string;
}

export const PIN_CODE_DATA: PinCodeRecord[] = pinCodeDataset as PinCodeRecord[];

/**
 * Looks up a 6-digit Indian PIN code in the statutory dataset.
 */
export function lookupPinCode(pincode: string): PinCodeRecord | null {
  if (!pincode) return null;
  const sanitized = String(pincode).trim();
  const match = PIN_CODE_DATA.find((entry) => entry.pincode === sanitized);
  return match || null;
}
