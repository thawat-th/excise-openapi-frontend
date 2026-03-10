import crypto from 'crypto';

const HMAC_KEY = process.env.ALTCHA_HMAC_KEY || 'altcha-secret-key-change-in-production';

// Store used challenges to prevent replay attacks
const usedChallenges = new Set<string>();

interface AltchaPayload {
  algorithm: string;
  challenge: string;
  number: number;
  salt: string;
  signature: string;
}

export function verifyAltchaPayload(base64Payload: string): { valid: boolean; error?: string } {
  try {
    // Decode base64 payload
    const jsonString = Buffer.from(base64Payload, 'base64').toString('utf-8');
    const payload: AltchaPayload = JSON.parse(jsonString);

    const { algorithm, challenge, number, salt, signature } = payload;

    // Check algorithm
    if (algorithm !== 'SHA-256') {
      return { valid: false, error: 'Invalid algorithm' };
    }

    // Check for replay attack
    if (usedChallenges.has(challenge)) {
      return { valid: false, error: 'Challenge already used' };
    }

    // Check expiration from salt
    const expiresMatch = salt.match(/expires=(\d+)/);
    if (expiresMatch) {
      const expires = parseInt(expiresMatch[1], 10);
      if (Date.now() / 1000 > expires) {
        return { valid: false, error: 'Challenge expired' };
      }
    }

    // Verify challenge: SHA-256(salt + number) should equal challenge
    const expectedChallenge = crypto
      .createHash('sha256')
      .update(salt + number)
      .digest('hex');

    if (expectedChallenge !== challenge) {
      return { valid: false, error: 'Invalid solution' };
    }

    // Verify signature: HMAC-SHA256(challenge) should equal signature
    const expectedSignature = crypto
      .createHmac('sha256', HMAC_KEY)
      .update(challenge)
      .digest('hex');

    if (expectedSignature !== signature) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Mark challenge as used
    usedChallenges.add(challenge);

    // Clean up old challenges (keep only last 10000)
    if (usedChallenges.size > 10000) {
      const firstChallenge = usedChallenges.values().next().value as string | undefined;
      if (firstChallenge) {
        usedChallenges.delete(firstChallenge);
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('[ALTCHA] Verification error:', error);
    return { valid: false, error: 'Invalid payload' };
  }
}
