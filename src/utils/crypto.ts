/**
 * Cryptographic utility using native Web Crypto API for client-side
 * tamper-proofing, payload hashing, and PII masking.
 */

/**
 * Computes a SHA-256 hex digest for any serializable payload.
 */
export async function hashPayload(data: unknown): Promise<string> {
  const jsonStr = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonStr);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback lightweight hash for non-crypto environments
  let hash = 0;
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Generates an RBI-compliant Unique Application Reference Number (ARN)
 * Format: LS-YYYYMMDD-XXXXX
 */
export function generateApplicationReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
  return `LS-${dateStr}-${randomSuffix}`;
}

/**
 * Masks Personally Identifiable Information (PII) for client logs and local audit trails.
 */
export function maskPii(
  value: string,
  type: 'pan' | 'aadhaar' | 'account' | 'mobile' | 'email'
): string {
  if (!value) return '';

  switch (type) {
    case 'pan':
      return value.length === 10 ? `${value.slice(0, 5)}XXXX${value.slice(9)}` : 'XXXXX';
    case 'aadhaar':
      return value.length >= 4 ? `XXXX-XXXX-${value.slice(-4)}` : 'XXXX';
    case 'account':
      return value.length >= 4 ? `••••••••${value.slice(-4)}` : '••••';
    case 'mobile':
      return value.length >= 4 ? `+91 XXXXX ${value.slice(-4)}` : '+91 XXXXX';
    case 'email': {
      const parts = value.split('@');
      if (parts.length !== 2) return '••••@••••';
      const name = parts[0];
      const maskedName = name.length > 2 ? `${name[0]}•••${name[name.length - 1]}` : '••';
      return `${maskedName}@${parts[1]}`;
    }
    default:
      return '••••';
  }
}
