/**
 * Client-Side Encryption Utilities for RBI PII & Financial Data Protection
 * Uses Web Crypto API (AES-256-GCM) with random 12-byte IV per encryption.
 */

export const DEFAULT_SECRET_KEY = 'LendSwift_RBI_Encrypted_PII_Key_2026';

const getSubtleCrypto = (): SubtleCrypto => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API (crypto.subtle) is not supported in this runtime environment');
};

const getRandomValues = (array: Uint8Array): Uint8Array => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    return globalThis.crypto.getRandomValues(array);
  }
  throw new Error('Web Crypto API (crypto.getRandomValues) is not available');
};

/**
 * Derives a 256-bit AES-GCM CryptoKey from a secret passphrase using SHA-256.
 */
export async function deriveKey(secretKey: string = DEFAULT_SECRET_KEY): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  const keyBytes = new TextEncoder().encode(secretKey);
  const hash = await subtle.digest('SHA-256', keyBytes);

  return subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypts a plaintext string or object with AES-256-GCM.
 * Generates a fresh cryptographically secure random 12-byte IV per encryption.
 *
 * @param plainText - Text or JSON payload to encrypt
 * @param secretKey - Encryption key/passphrase (defaults to LendSwift application key)
 * @returns Combined base64 encoded IV (12 bytes) + ciphertext + auth tag
 */
export async function encryptData(
  plainText: unknown,
  secretKey: string = DEFAULT_SECRET_KEY
): Promise<string> {
  if (plainText === null || plainText === undefined) {
    return '';
  }

  const subtle = getSubtleCrypto();
  const stringified = typeof plainText === 'string' ? plainText : JSON.stringify(plainText);
  const dataBuffer = new TextEncoder().encode(stringified);

  // 12-byte IV standard for AES-GCM
  const iv = getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveKey(secretKey);

  const encryptedBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    cryptoKey,
    dataBuffer
  );

  // Combine IV (12 bytes) + Ciphertext + GCM Tag
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return uint8ArrayToBase64(combined);
}

/**
 * Decrypts a base64 encoded AES-256-GCM ciphertext string.
 * Extracts the 12-byte IV from the payload and handles corruption errors gracefully.
 *
 * @param cipherText - Base64 encoded IV + ciphertext string
 * @param secretKey - Key/passphrase used during encryption
 * @returns Decrypted plaintext string, or null if corrupted or invalid key
 */
export async function decryptData(
  cipherText: string,
  secretKey: string = DEFAULT_SECRET_KEY
): Promise<string | null> {
  if (!cipherText || typeof cipherText !== 'string') {
    return null;
  }

  try {
    const subtle = getSubtleCrypto();
    const combined = base64ToUint8Array(cipherText);

    // Minimum payload: 12-byte IV + 16-byte GCM authentication tag = 28 bytes
    if (combined.length < 28) {
      return null;
    }

    const iv = combined.slice(0, 12);
    const ciphertextBytes = combined.slice(12);

    const cryptoKey = await deriveKey(secretKey);

    const decryptedBuffer = await subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      cryptoKey,
      ciphertextBytes as unknown as BufferSource
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    // Handle corruption, invalid tag, or mismatched key errors gracefully
    return null;
  }
}

export default {
  encryptData,
  decryptData,
  deriveKey,
  DEFAULT_SECRET_KEY,
};
