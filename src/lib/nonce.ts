/**
 * Generate a random nonce for CSP inline scripts
 * Nonce should be unique per request to prevent CSP violations
 */
export function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
}
