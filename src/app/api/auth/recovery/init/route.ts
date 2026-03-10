import { NextRequest, NextResponse } from 'next/server';
import { verifyAltchaPayload } from '@/lib/altcha';
import { extractErrorMessage, extractErrorCode, extractTraceId, isRateLimitError, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';
const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/auth/recovery/init
 * Send password reset OTP code via Go service (same flow as registration)
 *
 * Flow:
 * 1. Verify ALTCHA CAPTCHA (prevent bots)
 * 2. Check if user exists in Kratos
 * 3. Generate OTP via Go service
 * 4. Send email via Go service
 * 5. Return success (always, to prevent user enumeration)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, altchaPayload } = body;

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate CAPTCHA
    if (!altchaPayload) {
      return NextResponse.json(
        { error: 'Please complete the security verification', code: 'altcha_required' },
        { status: 400 }
      );
    }

    // Step 1: Verify ALTCHA CAPTCHA
    const altchaResult = verifyAltchaPayload(altchaPayload);
    if (!altchaResult.valid) {
      console.log('[recovery/init] ALTCHA verification failed:', altchaResult.error);
      return NextResponse.json(
        { error: 'Security verification failed. Please try again.', code: 'altcha_failed' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log('[recovery/init] Requesting OTP for password reset:', normalizedEmail);

    // Call Go service to send OTP with password_reset purpose
    // Go service will:
    // - Generate 6-digit OTP
    // - Store in Redis with 5-minute expiry
    // - Send password reset email template via SMTP
    // - Apply purpose-specific rate limiting
    const otpResponse = await fetch(`${GOVERNANCE_API_URL}/v1/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        purpose: 'password_reset', // Purpose: password_reset (separate from email_verification)
      }),
    });

    const otpResult = await otpResponse.json();

    if (!otpResponse.ok) {
      const errorMessage = extractErrorMessage(otpResult);
      const errorCode = extractErrorCode(otpResult);
      const traceId = extractTraceId(otpResult);

      console.error(formatErrorForLogging(otpResult, 'recovery/init'));

      // Handle rate limiting explicitly (don't hide it to prevent enumeration)
      if (otpResponse.status === 429 || isRateLimitError(otpResult)) {
        const match = errorMessage?.match(/(\d+) seconds/);
        const remainingSeconds = match ? parseInt(match[1]) : 60;
        return NextResponse.json(
          {
            error: errorMessage,
            code: errorCode || 'rate_limited',
            remainingSeconds,
            trace_id: traceId
          },
          { status: 429 }
        );
      }

      // For other errors, return success to prevent user enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.',
      });
    }
    console.log('[recovery/init] OTP sent successfully, flowId:', otpResult.data?.flowId);

    // ALWAYS return success to prevent user enumeration
    // Include flowId for frontend to use in verification step
    return NextResponse.json({
      success: true,
      flowId: otpResult.data?.flowId || 'unknown', // Return flowId from Go service (nested in data)
      message: 'If an account exists with this email, you will receive a password reset code.',
      // Don't expose OTP expiry or other details to prevent enumeration
    });
  } catch (error) {
    console.error('[recovery/init] Error:', error);

    // ALWAYS return success to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset code.',
    });
  }
}
