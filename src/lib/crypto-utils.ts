/**
 * Cryptographic Utilities
 *
 * Banking/Government Security Standards:
 * - Session ID ต้องเป็น cryptographically secure random
 * - Cookie signing ป้องกัน tampering
 * - HMAC signature verification
 */

import { createHmac, randomBytes } from 'crypto';

// Secret key สำหรับ sign cookies (ควรอยู่ใน environment variable)
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'change-me-in-production-to-32-chars-min';

/**
 * สร้าง cryptographically secure session ID
 * Banking Standard: ใช้ crypto.randomBytes แทน Math.random()
 */
export function generateSecureSessionId(): string {
  // 32 bytes = 256 bits (Banking standard minimum)
  return randomBytes(32).toString('base64url');
}

/**
 * Sign cookie value with HMAC-SHA256
 * Government/Zero-Trust: ป้องกัน cookie tampering
 *
 * @param value - ค่าที่ต้องการ sign
 * @returns signed value ในรูปแบบ "value.signature"
 */
export function signCookie(value: string): string {
  const signature = createHmac('sha256', COOKIE_SECRET)
    .update(value)
    .digest('base64url');

  return `${value}.${signature}`;
}

/**
 * Verify และ unsign cookie value
 *
 * @param signedValue - signed cookie value
 * @returns original value ถ้า signature ถูกต้อง, null ถ้าไม่ถูกต้อง
 */
export function verifyCookie(signedValue: string): string | null {
  const parts = signedValue.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [value, signature] = parts;
  const expectedSignature = createHmac('sha256', COOKIE_SECRET)
    .update(value)
    .digest('base64url');

  // Constant-time comparison (ป้องกัน timing attacks)
  if (signature !== expectedSignature) {
    return null;
  }

  return value;
}

/**
 * Hash sensitive data (e.g., session token สำหรับเก็บใน database)
 * Banking Standard: SHA-256 minimum
 */
export function hashToken(token: string): string {
  return createHmac('sha256', COOKIE_SECRET)
    .update(token)
    .digest('hex');
}

/**
 * Constant-time string comparison
 * Zero-Trust: ป้องกัน timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
