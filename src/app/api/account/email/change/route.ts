import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

// BFF Pattern: Use internal Kratos for server-side API calls
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://api-audit-service:5002';

interface EmailChangeRequest {
  newEmail: string;
  password: string; // Require password for security
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
  metadata?: Record<string, any>,
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
        target_label: metadata?.new_email || email,
        ip_address: ipAddress,
        user_agent: userAgent,
        service_name: 'frontend',
        service_version: '1.0.0',
        message,
        error_message: outcome === 'failure' ? reason : '',
        reason: reason || '',
        metadata: JSON.stringify(metadata || {}),
      }),
    });
  } catch (error) {
    console.error('[email-change] Failed to log audit event:', error);
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

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/account/email/change
 * Request email change - sends verification to new email
 *
 * Flow:
 * 1. User submits new email + current password
 * 2. Verify password is correct
 * 3. Update email in Kratos (triggers verification email)
 * 4. User must verify new email before it's active
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

    const body: EmailChangeRequest = await request.json();
    const { newEmail, password } = body;

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'New email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Get current session info via reverse proxy
    // This ensures cookies from same origin (localhost:3000/kratos/* → localhost:4433/*)
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
        'Cookie': `ory_kratos_session=${kratosSessionToken}` // Fallback if token header doesn't work
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
    const currentEmail = session.identity?.traits?.email || '';

    // Check if new email is same as current
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      );
    }

    // First, verify password by attempting a login
    // Create a login flow to verify password via reverse proxy
    const loginFlowResponse = await fetch(`${IDENTITY_INTERNAL_URL}/self-service/login/api`);
    if (!loginFlowResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify credentials' },
        { status: 500 }
      );
    }
    const loginFlow = await loginFlowResponse.json();

    // Verify password via reverse proxy
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
      await logAuditEvent(
        'email_change',
        'failure',
        identityId,
        currentEmail,
        clientIP,
        userAgent,
        'Email change failed: invalid password',
        { new_email: newEmail },
        'invalid_password'
      );

      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    console.log('[email-change] Password verified for:', currentEmail);

    // Create settings flow via reverse proxy
    const settingsFlowResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings/api`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
      }
    );

    if (!settingsFlowResponse.ok) {
      const errorText = await settingsFlowResponse.text();
      console.error('[email-change] Failed to create settings flow:', errorText);

      if (settingsFlowResponse.status === 403) {
        return NextResponse.json(
          { error: 'Session requires re-authentication', code: 'session_refresh_required' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to initialize email change' },
        { status: 500 }
      );
    }

    const settingsFlow = await settingsFlowResponse.json();
    console.log('[email-change] Created settings flow:', settingsFlow.id);

    // Get current traits and update email
    const currentTraits = session.identity?.traits || {};
    const updatedTraits = {
      ...currentTraits,
      email: newEmail,
    };

    // Submit profile update with new email via reverse proxy
    const updateResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings?flow=${settingsFlow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
        body: JSON.stringify({
          method: 'profile',
          traits: updatedTraits,
        }),
      }
    );

    const updateResult = await updateResponse.json();
    console.log('[email-change] Settings update response:', updateResponse.status);

    // Check for errors
    if (!updateResponse.ok) {
      const errorMessages = updateResult.ui?.messages
        ?.filter((m: any) => m.type === 'error')
        ?.map((m: any) => m.text)
        ?.join(', ');

      // Check if email is already taken
      const emailTaken = updateResult.ui?.nodes?.some((n: any) =>
        n.messages?.some((m: any) => m.id === 4000007)
      );

      if (emailTaken) {
        await logAuditEvent(
          'email_change',
          'failure',
          identityId,
          currentEmail,
          clientIP,
          userAgent,
          'Email change failed: email already in use',
          { new_email: newEmail },
          'email_taken'
        );

        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 409 }
        );
      }

      await logAuditEvent(
        'email_change',
        'failure',
        identityId,
        currentEmail,
        clientIP,
        userAgent,
        'Email change failed',
        { new_email: newEmail },
        errorMessages || 'unknown_error'
      );

      return NextResponse.json(
        { error: errorMessages || 'Failed to update email' },
        { status: 400 }
      );
    }

    // Success - email updated, verification email sent
    console.log('[email-change] Email change requested:', currentEmail, '->', newEmail);

    await logAuditEvent(
      'email_change_requested',
      'success',
      identityId,
      currentEmail,
      clientIP,
      userAgent,
      `Email change requested from ${currentEmail} to ${newEmail}. Verification email sent.`,
      { old_email: currentEmail, new_email: newEmail }
    );

    return NextResponse.json({
      success: true,
      message: 'Verification email sent to new address',
      newEmail,
      requiresVerification: true,
    });
  } catch (error) {
    console.error('[email-change] Error:', error);
    return NextResponse.json(
      { error: 'Failed to change email' },
      { status: 500 }
    );
  }
}
