import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/session-store';
import { verifyCookie } from '@/lib/crypto-utils';

const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://api-audit-service:5002';

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

// Helper to log audit events
async function logAuditEvent(
  eventType: string,
  outcome: 'success' | 'failure',
  identityId: string,
  email: string,
  ipAddress: string,
  userAgent: string,
  message: string,
  reason?: string
): Promise<void> {
  try {
    await fetch(`${AUDIT_SERVICE_URL}/v1/audit/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        event_kind: 'event',
        event_category: 'iam',
        event_outcome: outcome,
        status: outcome,
        actor_id: identityId,
        actor_email: email,
        actor_role: 'user',
        target_type: 'identity',
        target_id: identityId,
        target_label: email,
        ip_address: ipAddress,
        user_agent: userAgent,
        service_name: 'frontend',
        service_version: '1.0.0',
        message,
        error_message: outcome === 'failure' ? reason : '',
        reason: reason || '',
      }),
    });
  } catch (error) {
    console.error('[password-change] Failed to log audit event:', error);
  }
}

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''
  );
}

/**
 * POST /api/account/password/change
 * Change user password using Kratos Settings flow
 *
 * Flow:
 * 1. Validate current session
 * 2. Get user email from session
 * 3. Verify current password via Kratos Login API
 * 4. Create settings flow with fresh session
 * 5. Submit new password
 * 6. Optionally revoke other sessions
 */
export async function POST(request: NextRequest) {
  try {
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No session. Please log in again.', code: 'no_session' },
        { status: 401 }
      );
    }

    const body: PasswordChangeRequest = await request.json();
    const { currentPassword, newPassword, revokeOtherSessions } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength (basic validation, Kratos has its own policy)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password', code: 'same_password' },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Step 1: Get current session info (to get user email)
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: { 'X-Session-Token': kratosSessionToken },
    });

    if (!whoamiResponse.ok) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.', code: 'session_expired' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();
    const identityId = session.identity?.id;
    const email = session.identity?.traits?.email || '';

    if (!email) {
      return NextResponse.json(
        { error: 'Could not determine user email' },
        { status: 500 }
      );
    }

    // Step 2: Verify current password via Kratos Login API
    // Create a login flow first
    const loginFlowResponse = await fetch(`${IDENTITY_INTERNAL_URL}/self-service/login/api`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!loginFlowResponse.ok) {
      console.error('[password-change] Failed to create login flow');
      return NextResponse.json(
        { error: 'Failed to verify current password' },
        { status: 500 }
      );
    }

    const loginFlow = await loginFlowResponse.json();
    console.log('[password-change] Created login flow for verification:', loginFlow.id);

    // Submit current password for verification
    const verifyResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/login?flow=${loginFlow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          method: 'password',
          identifier: email,
          password: currentPassword,
        }),
      }
    );

    const verifyResult = await verifyResponse.json();

    // Check if login failed (wrong password)
    if (!verifyResponse.ok || verifyResult.ui?.messages?.some((m: any) => m.type === 'error')) {
      console.log('[password-change] Current password verification failed');

      // Log failed attempt
      await logAuditEvent(
        'password_change',
        'failure',
        identityId,
        email,
        clientIP,
        userAgent,
        'Password change failed - incorrect current password',
        'Current password is incorrect'
      );

      return NextResponse.json(
        { error: 'Current password is incorrect', code: 'incorrect_password' },
        { status: 400 }
      );
    }

    // Step 3: Get the new session token from successful login
    // This gives us a fresh "privileged" session
    const newSessionToken = verifyResult.session_token;

    if (!newSessionToken) {
      console.error('[password-change] No session token in login response');
      return NextResponse.json(
        { error: 'Failed to create privileged session' },
        { status: 500 }
      );
    }

    console.log('[password-change] Current password verified, got fresh session');

    // Step 4: Create settings flow with fresh privileged session
    const settingsFlowResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings/api`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': newSessionToken,
        },
      }
    );

    if (!settingsFlowResponse.ok) {
      const errorText = await settingsFlowResponse.text();
      console.error('[password-change] Failed to create settings flow:', errorText);

      return NextResponse.json(
        { error: 'Failed to initialize password change' },
        { status: 500 }
      );
    }

    const settingsFlow = await settingsFlowResponse.json();
    console.log('[password-change] Created settings flow:', settingsFlow.id);

    // Step 5: Submit new password
    const settingsResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings?flow=${settingsFlow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Session-Token': newSessionToken,
        },
        body: JSON.stringify({
          method: 'password',
          password: newPassword,
        }),
      }
    );

    const settingsResult = await settingsResponse.json();
    console.log('[password-change] Settings response status:', settingsResponse.status);

    // Check for errors
    if (!settingsResponse.ok || settingsResult.ui?.messages?.some((m: any) => m.type === 'error')) {
      const errorMessages = settingsResult.ui?.messages
        ?.filter((m: any) => m.type === 'error')
        ?.map((m: any) => m.text)
        ?.join(', ') || 'Password change failed';

      // Log failed attempt
      await logAuditEvent(
        'password_change',
        'failure',
        identityId,
        email,
        clientIP,
        userAgent,
        'Password change failed',
        errorMessages
      );

      return NextResponse.json(
        { error: errorMessages },
        { status: 400 }
      );
    }

    // Password changed successfully
    console.log('[password-change] Password changed successfully for:', identityId);

    // Step 6: Revoke other sessions if requested
    let revokedCount = 0;
    if (revokeOtherSessions) {
      try {
        // Use the new session token to revoke other sessions
        const revokeResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'X-Session-Token': newSessionToken,
          },
        });

        if (revokeResponse.ok) {
          try {
            const revokeResult = await revokeResponse.json();
            revokedCount = revokeResult.count || 0;
          } catch {
            // Response might be empty
          }
          console.log('[password-change] Revoked', revokedCount, 'other sessions');
        }
      } catch (error) {
        console.error('[password-change] Failed to revoke other sessions:', error);
      }
    }

    // Log success
    await logAuditEvent(
      'password_change',
      'success',
      identityId,
      email,
      clientIP,
      userAgent,
      `Password changed successfully${revokeOtherSessions ? `. Revoked ${revokedCount} other sessions` : ''}`,
    );

    // BFF Pattern: Update server-side session with new Kratos session token
    const signedSessionId = request.cookies.get('excise_session')?.value;
    if (signedSessionId) {
      const sessionId = verifyCookie(signedSessionId);
      if (sessionId) {
        await updateSession(sessionId, {
          kratos_session_token: newSessionToken,
        });
        console.log('[password-change] Updated BFF session with new Kratos token');
      }
    }

    // Return success (no cookie manipulation in BFF pattern)
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      sessionsRevoked: revokedCount,
    });
  } catch (error) {
    console.error('[password-change] Error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
