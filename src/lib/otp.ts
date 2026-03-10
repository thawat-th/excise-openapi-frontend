/**
 * Email OTP Management
 * Simple OTP generation, storage, and validation
 */

interface OTPSession {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const OTP_SESSION_KEY = 'excise_otp_session';

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP session in sessionStorage
 * In production, this would be server-side
 */
export function storeOTPSession(email: string, code: string): void {
  const session: OTPSession = {
    code,
    email,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  };
  sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
}

/**
 * Retrieve stored OTP session
 */
export function getOTPSession(): OTPSession | null {
  try {
    const stored = sessionStorage.getItem(OTP_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Verify OTP code
 * Returns: { valid: boolean, error?: string }
 */
export function verifyOTP(code: string): {
  valid: boolean;
  error?: string;
  email?: string;
} {
  const session = getOTPSession();

  if (!session) {
    return {
      valid: false,
      error: 'No OTP session found. Please request a new OTP.',
    };
  }

  if (Date.now() > session.expiresAt) {
    clearOTPSession();
    return {
      valid: false,
      error: 'OTP has expired. Please request a new one.',
    };
  }

  if (session.attempts >= MAX_ATTEMPTS) {
    clearOTPSession();
    return {
      valid: false,
      error: 'Maximum verification attempts exceeded. Please request a new OTP.',
    };
  }

  if (code !== session.code) {
    session.attempts += 1;
    sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
    return {
      valid: false,
      error: `Invalid OTP code. ${MAX_ATTEMPTS - session.attempts} attempts remaining.`,
    };
  }

  clearOTPSession();
  return {
    valid: true,
    email: session.email,
  };
}

/**
 * Clear OTP session
 */
export function clearOTPSession(): void {
  sessionStorage.removeItem(OTP_SESSION_KEY);
}

/**
 * Mock email send (logs to console in dev)
 * In production, this would call a real email service
 */
export function mockEmailOTP(email: string, code: string): void {
  console.log(`[MOCK EMAIL OTP] Sending OTP to ${email}: ${code}`);
  console.log(`[MOCK EMAIL OTP] OTP expires in 5 minutes`);
}
