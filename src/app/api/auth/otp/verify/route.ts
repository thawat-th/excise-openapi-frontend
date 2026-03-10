import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, isRateLimitError, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, flowId } = body;

    console.log('[OTP Verify] Received:', { email, code: code ? '***' : 'empty', flowId: flowId || 'EMPTY!' });

    if (!email || !code || !flowId) {
      console.error('[OTP Verify] Missing fields:', { email: !!email, code: !!code, flowId: !!flowId });
      return NextResponse.json(
        { error: 'Email, code, and flowId are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Call Go service to verify OTP (handles brute force protection, validation, and audit logging)
    console.log(`[OTP] Calling Go service: ${GOVERNANCE_API_URL}/v1/otp/verify`);

    const goResponse = await fetch(`${GOVERNANCE_API_URL}/v1/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        code: code,
        flowId: flowId,
      }),
    });

    const goResult = await goResponse.json();
    console.log('[OTP Verify] Go service response:', JSON.stringify(goResult));

    if (!goResponse.ok) {
      // Extract error using new helper (supports both old and new format)
      const errorMessage = extractErrorMessage(goResult);
      const errorCode = extractErrorCode(goResult);
      const traceId = extractTraceId(goResult);

      console.error(formatErrorForLogging(goResult, 'OTP Verify'));

      // Handle rate limiting / too many attempts
      if (goResponse.status === 429 || isRateLimitError(goResult) || errorMessage?.includes('too many failed')) {
        const match = errorMessage?.match(/(\d+) seconds/);
        const remainingSeconds = match ? parseInt(match[1]) : 900;
        return NextResponse.json(
          {
            error: errorMessage,
            code: errorCode || 'too_many_attempts',
            remainingSeconds,
            trace_id: traceId
          },
          { status: 429 }
        );
      }

      // Handle expired/invalid codes
      if (errorMessage?.includes('expired') || errorMessage?.includes('invalid')) {
        // Extract remaining attempts if present
        const attemptsMatch = errorMessage?.match(/(\d+) attempts remaining/);
        const remainingAttempts = attemptsMatch ? parseInt(attemptsMatch[1]) : undefined;

        return NextResponse.json(
          {
            error: errorMessage,
            code: errorCode || (errorMessage?.includes('expired') ? 'session_expired' : 'invalid_code'),
            remainingAttempts,
            trace_id: traceId
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: errorMessage || 'Verification failed',
          code: errorCode,
          trace_id: traceId
        },
        { status: goResponse.status }
      );
    }

    console.log(`[OTP] Email ${normalizedEmail} verified successfully`);

    // Go service returns data in nested "data" field
    const responseData = goResult.data || goResult;

    return NextResponse.json({
      success: true,
      message: responseData.message || goResult.message || 'Email verified successfully',
      verificationToken: responseData.verificationToken,
      email: responseData.email || normalizedEmail,
      flowId: flowId,
      expiresIn: responseData.expiresIn || 1800, // 30 minutes
    });
  } catch (error) {
    console.error('[OTP] Error verifying code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
