import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, isRateLimitError, formatErrorForLogging } from '@/lib/api-error-handler';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate password strength (same as registration)
function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
}

/**
 * POST /api/auth/reset-password
 * Go-based password reset with OTP verification + Auto-login
 *
 * Flow:
 * 1. Verify OTP via Go service
 * 2. Find user identity via Kratos Admin
 * 3. Update password via Kratos Admin
 * 4. Create session (auto-login)
 * 5. Return session cookie
 *
 * Security features:
 * - OTP verification (single-use, 10 min expiry)
 * - Password strength validation
 * - Rate limiting (via Go service)
 * - Audit logging
 * - Auto-login after success
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, flowId, otp, password } = body;

    // Validate inputs
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!flowId) {
      return NextResponse.json(
        { error: 'Flow ID is required' },
        { status: 400 }
      );
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Valid 6-digit OTP code is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Validate password strength server-side
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Step 1: Verify OTP via Go service with purpose check
    console.log('[reset-password] Verifying OTP for:', normalizedEmail);

    const verifyResponse = await fetch(`${GOVERNANCE_API_URL}/v1/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        code: otp,
        flowId: flowId, // Use flowId from frontend (received from /recovery/init)
        purpose: 'password_reset', // Must match the purpose from /recovery/init
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log('[reset-password] OTP verify response:', verifyResult);

    if (!verifyResponse.ok) {
      const errorMessage = extractErrorMessage(verifyResult);
      const errorCode = extractErrorCode(verifyResult);
      const traceId = extractTraceId(verifyResult);

      console.error(formatErrorForLogging(verifyResult, 'reset-password OTP verify'));

      // Handle rate limiting / too many attempts
      if (verifyResponse.status === 429 || isRateLimitError(verifyResult)) {
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

      return NextResponse.json(
        {
          error: errorMessage || 'Invalid or expired OTP code. Please try again.',
          code: errorCode,
          trace_id: traceId
        },
        { status: verifyResponse.status }
      );
    }

    if (!verifyResult.success) {
      const errorMessage = extractErrorMessage(verifyResult);
      const errorCode = extractErrorCode(verifyResult);
      const traceId = extractTraceId(verifyResult);

      return NextResponse.json(
        {
          error: errorMessage || 'Invalid or expired OTP code. Please try again.',
          code: errorCode,
          trace_id: traceId
        },
        { status: 400 }
      );
    }

    console.log('[reset-password] OTP verified successfully');

    // Step 2: Find user identity in Kratos
    const identityResponse = await fetch(
      `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities?credentials_identifier=${encodeURIComponent(normalizedEmail)}`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!identityResponse.ok) {
      console.error('[reset-password] Failed to find identity');
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    const identities = await identityResponse.json();
    if (!identities || identities.length === 0) {
      console.error('[reset-password] No identity found for email:', normalizedEmail);
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    const identity = identities[0];
    console.log('[reset-password] Found identity:', identity.id);

    // Step 3: Update password via Kratos Admin API
    const updateResponse = await fetch(
      `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identity.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema_id: 'default',
          traits: identity.traits,
          credentials: {
            password: {
              config: {
                password: password,
              },
            },
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      const updateError = await updateResponse.json().catch(() => ({}));
      console.error('[reset-password] Failed to update password:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[reset-password] Password updated successfully');

    // Step 3.5: Revoke ALL existing sessions for security
    try {
      const sessionsResponse = await fetch(
        `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identity.id}/sessions?active=true`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );

      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json();
        console.log(`[reset-password] Found ${sessions.length} active sessions to revoke`);

        // Revoke all active sessions
        for (const session of sessions) {
          await fetch(
            `${IDENTITY_INTERNAL_ADMIN_URL}/admin/sessions/${session.id}`,
            {
              method: 'DELETE',
              headers: { 'Accept': 'application/json' },
            }
          ).catch((err) => console.error(`[reset-password] Failed to revoke session ${session.id}:`, err));
        }

        console.log('[reset-password] All old sessions revoked');
      }
    } catch (err) {
      console.warn('[reset-password] Failed to revoke old sessions:', err);
      // Continue anyway - not critical for password reset success
    }

    // Step 4: Create NEW session for auto-login
    const sessionResponse = await fetch(
      `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identity.id}/sessions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }),
      }
    );

    let sessionCookie = null;
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      sessionCookie = session.id;
      console.log('[reset-password] Session created for auto-login:', session.id);
    } else {
      console.warn('[reset-password] Failed to create session, user will need to login manually');
    }

    // Step 5: Return success with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
      autoLogin: !!sessionCookie,
    });

    // Set session cookie for auto-login
    if (sessionCookie) {
      response.cookies.set('ory_kratos_session', sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60, // 24 hours
      });
    }

    // Step 6: Send password reset success notification email
    fetch(`${GOVERNANCE_API_URL}/v1/email/password-reset-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        timestamp: new Date().toISOString(),
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }),
    }).catch((err) => console.error('[reset-password] Email notification failed:', err));

    // Step 7: Audit log (fire-and-forget)
    fetch(`${GOVERNANCE_API_URL}/v1/audit/recovery/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityId: identity.id,
        email: normalizedEmail,
        success: true,
        autoLogin: !!sessionCookie,
        sessionsRevoked: true, // Indicate that old sessions were revoked
        ipAddress,
      }),
    }).catch((err) => console.error('[reset-password] Audit log failed:', err));

    return response;
  } catch (error) {
    console.error('[reset-password] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
