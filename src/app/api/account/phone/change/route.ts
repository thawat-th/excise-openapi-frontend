import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

// BFF Pattern: Use internal Kratos for server-side API calls
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

interface PhoneChangeRequest {
  newPhone: string;
  password: string;
}

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''
  );
}

// Phone validation (Thai phone number: 10 digits starting with 0)
const PHONE_REGEX = /^0\d{9}$/;

/**
 * POST /api/account/phone/change
 * Request phone number change - sends OTP to new phone
 */
export async function POST(request: NextRequest) {
  try {
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No session. Please log in again.' },
        { status: 401 }
      );
    }

    const body: PhoneChangeRequest = await request.json();
    const { newPhone, password } = body;

    if (!newPhone || !password) {
      return NextResponse.json(
        { error: 'New phone number and password are required' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!PHONE_REGEX.test(newPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Must be 10 digits starting with 0.' },
        { status: 400 }
      );
    }

    // Get current session info
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: { 'X-Session-Token': kratosSessionToken },
    });

    if (!whoamiResponse.ok) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();
    const identityId = session.identity?.id;
    const currentEmail = session.identity?.traits?.email || '';
    const currentPhone = session.identity?.traits?.mobile || '';

    // Check if new phone is same as current
    if (newPhone === currentPhone) {
      return NextResponse.json(
        { error: 'New phone must be different from current phone' },
        { status: 400 }
      );
    }

    // Verify password
    const loginFlowResponse = await fetch(`${IDENTITY_INTERNAL_URL}/self-service/login/api`);
    if (!loginFlowResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify credentials' },
        { status: 500 }
      );
    }
    const loginFlow = await loginFlowResponse.json();

    const passwordVerifyResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/login?flow=${loginFlow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          method: 'password',
          identifier: currentEmail,
          password,
        }),
      }
    );

    if (!passwordVerifyResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    console.log('[phone-change] Password verified for:', currentEmail);

    // TODO: Send OTP to new phone number via SMS service
    // For now, we'll simulate OTP sending via governance service
    const otpResponse = await fetch(`${GOVERNANCE_API_URL}/v1/otp/phone/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: newPhone,
        purpose: 'phone_change',
        identity_id: identityId,
      }),
    });

    const otpResult = await otpResponse.json();

    if (!otpResponse.ok) {
      const errorMessage = extractErrorMessage(otpResult);
      const errorCode = extractErrorCode(otpResult);
      const traceId = extractTraceId(otpResult);

      console.error(formatErrorForLogging(otpResult, 'phone-change'));

      return NextResponse.json(
        {
          error: errorMessage || 'Failed to send OTP',
          code: errorCode,
          trace_id: traceId
        },
        { status: otpResponse.status }
      );
    }

    console.log('[phone-change] OTP sent to:', newPhone);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to new phone number',
      newPhone,
      requiresVerification: true,
    });
  } catch (error) {
    console.error('[phone-change] Error:', error);
    return NextResponse.json(
      { error: 'Failed to change phone number' },
      { status: 500 }
    );
  }
}
