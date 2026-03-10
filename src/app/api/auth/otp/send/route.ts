import { NextRequest, NextResponse } from 'next/server';
import { verifyAltchaPayload } from '@/lib/altcha';
import { extractErrorMessage, extractErrorCode, extractTraceId, isRateLimitError, formatErrorForLogging } from '@/lib/api-error-handler';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, altchaPayload } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verify ALTCHA
    if (!altchaPayload) {
      return NextResponse.json(
        { error: 'Please complete the security verification', code: 'altcha_required' },
        { status: 400 }
      );
    }

    const altchaResult = verifyAltchaPayload(altchaPayload);
    if (!altchaResult.valid) {
      console.log('[ALTCHA] Verification failed:', altchaResult.error);
      return NextResponse.json(
        { error: 'Security verification failed. Please try again.', code: 'altcha_failed' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in Kratos
    try {
      const identitiesResponse = await fetch(
        `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities?credentials_identifier=${encodeURIComponent(normalizedEmail)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (identitiesResponse.ok) {
        const identities = await identitiesResponse.json();
        if (identities && identities.length > 0) {
          console.log(`[OTP] Email already exists: ${normalizedEmail}`);
          return NextResponse.json(
            { error: 'An account with this email already exists.', code: 'email_exists' },
            { status: 409 }
          );
        }
      }
    } catch (checkError) {
      console.error('[OTP] Error checking existing email:', checkError);
      // Continue with registration flow even if check fails
    }

    // Call Go service to send OTP (handles rate limiting, storage, and email sending)
    console.log(`[OTP] Calling Go service: ${GOVERNANCE_API_URL}/v1/otp/send`);

    const goResponse = await fetch(`${GOVERNANCE_API_URL}/v1/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    const goResult = await goResponse.json();
    console.log('[OTP] Go service response:', JSON.stringify(goResult));

    if (!goResponse.ok) {
      // Extract error using new helper (supports both old and new format)
      const errorMessage = extractErrorMessage(goResult);
      const errorCode = extractErrorCode(goResult);
      const traceId = extractTraceId(goResult);

      console.error(formatErrorForLogging(goResult, 'OTP'));

      // Handle rate limiting from Go service
      if (goResponse.status === 429 || isRateLimitError(goResult)) {
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

      return NextResponse.json(
        {
          error: errorMessage || 'Failed to send verification code',
          code: errorCode,
          trace_id: traceId
        },
        { status: goResponse.status }
      );
    }

    console.log(`[OTP] Verification code sent for ${normalizedEmail}`);

    // Go service returns data in nested "data" field
    const responseData = goResult.data || goResult;

    return NextResponse.json({
      success: true,
      message: responseData.message || goResult.message || 'Verification code sent successfully',
      flowId: responseData.flowId,
      expiresIn: responseData.expiresIn || 300,
    });
  } catch (error) {
    console.error('[OTP] Error sending code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
