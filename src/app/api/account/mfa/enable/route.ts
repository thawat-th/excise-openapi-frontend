import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://api-governance-service:5001';

/**
 * POST /api/account/mfa/enable
 * Verify TOTP code and enable 2FA via Kratos settings flow
 * BFF Pattern: Use kratos_session_token from Redis session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flowId, totpCode } = body;

    if (!flowId || !totpCode) {
      return NextResponse.json(
        { error: 'Flow ID and TOTP code are required' },
        { status: 400 }
      );
    }

    // Validate TOTP code format (6 digits)
    if (!/^\d{6}$/.test(totpCode)) {
      return NextResponse.json(
        { error: 'TOTP code must be 6 digits' },
        { status: 400 }
      );
    }

    // BFF Pattern: Get kratos_session_token from Redis session
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get user session from Kratos to get identity info for audit
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
      },
    });

    if (!whoamiResponse.ok) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();
    const identityId = session.identity?.id;
    const userEmail = session.identity?.traits?.email || '';

    // Submit TOTP code to Kratos settings flow with X-Session-Token
    const submitResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings?flow=${flowId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
        body: JSON.stringify({
          method: 'totp',
          totp_code: totpCode,
        }),
      }
    );

    const result = await submitResponse.json();

    if (!submitResponse.ok) {
      console.error('[mfa/enable] TOTP verification failed');

      // Check for invalid code
      const invalidCode = result.ui?.messages?.some((m: any) => m.id === 4000006);
      if (invalidCode) {
        // Log audit event for failed attempt
        try {
          await fetch(`${AUDIT_SERVICE_URL}/api/v1/audit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              event_type: 'totp_enable_failed',
              event_category: 'authentication',
              event_outcome: 'failure',
              user_id: identityId,
              user_email: userEmail,
              ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              user_agent: request.headers.get('user-agent') || 'unknown',
              service_name: 'frontend',
              message: 'User failed to enable TOTP - invalid code',
            }),
          });
        } catch (auditError) {
          console.error('Audit logging failed:', auditError);
        }

        return NextResponse.json(
          { error: 'Invalid verification code. Please try again.' },
          { status: 400 }
        );
      }

      // Other error
      const errorMessage = result.ui?.messages?.[0]?.text || 'Failed to enable 2FA';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Success - TOTP enabled
    console.log('[mfa/enable] TOTP enabled for:', identityId);

    // Log audit event for success
    try {
      await fetch(`${AUDIT_SERVICE_URL}/api/v1/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'totp_enabled',
          event_category: 'authentication',
          event_outcome: 'success',
          user_id: identityId,
          user_email: userEmail,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          service_name: 'frontend',
          message: 'User successfully enabled TOTP two-factor authentication',
        }),
      });
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully',
      identity: result.identity,
    });
  } catch (error) {
    console.error('[POST mfa/enable] Error:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}
