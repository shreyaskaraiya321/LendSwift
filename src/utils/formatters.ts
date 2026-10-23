/**
 * Formats a number into the Indian numbering system (Lakhs & Crores) with Rupee symbol.
 * Example: 250000 -> "₹2,50,000"
 */
export function formatIndianCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats an Indian mobile number into "+91 XXXXX XXXXX" or "XXXXX XXXXX"
 */
export function formatMobile(mobile: string | undefined): string {
  if (!mobile) return '';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  const clean10 = digits.slice(-10);
  return `+91 ${clean10.slice(0, 5)} ${clean10.slice(5)}`;
}

/**
 * Formats Aadhaar into 4-digit grouped chunks "XXXX XXXX 1234"
 */
export function formatAadhaar(aadhaar: string | undefined, mask = false): string {
  if (!aadhaar) return '';
  const digits = aadhaar.replace(/\D/g, '').slice(0, 12);
  if (digits.length === 0) return '';

  if (mask && digits.length === 12) {
    return `XXXX XXXX ${digits.slice(8)}`;
  }

  const parts = digits.match(/.{1,4}/g);
  return parts ? parts.join(' ') : digits;
}

/**
 * Normalizes and formats an Indian PAN card string.
 */
export function formatPan(pan: string | undefined, mask = false): string {
  if (!pan) return '';
  const upper = pan.toUpperCase().trim().slice(0, 10);
  if (mask && upper.length === 10) {
    return `${upper.slice(0, 5)}XXXX${upper.slice(9)}`;
  }
  return upper;
}

/**
 * Normalizes an Indian Financial System Code (IFSC) to uppercase.
 */
export function formatIfsc(ifsc: string | undefined): string {
  if (!ifsc) return '';
  return ifsc.toUpperCase().trim().slice(0, 11);
}

/**
 * Formats an ISO Date string or Date object to Indian human-readable date "24 Oct 2026"
 */
export function formatDateIndian(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Masks bank account number for display ("XXXX XXXX 4920")
 */
export function maskBankAccount(accountNumber: string | undefined): string {
  if (!accountNumber) return '';
  const clean = accountNumber.replace(/\D/g, '');
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  return `•••• •••• ${last4}`;
}
