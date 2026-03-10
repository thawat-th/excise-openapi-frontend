import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://api-governance-service:5001';

/**
 * POST /api/account/mfa/disable
 * Disable TOTP 2FA via Kratos Admin API
 * BFF Pattern: Use kratos_session_token from Redis session
 */
export async function POST(request: NextRequest) {
  try {
    // BFF Pattern: Get kratos_session_token from Redis session
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get user session from Kratos
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

    // Get current identity from Kratos Admin API
    const identityResponse = await fetch(
      `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!identityResponse.ok) {
      console.error('[mfa/disable] Failed to get identity');
      return NextResponse.json(
        { error: 'Failed to get identity' },
        { status: 500 }
      );
    }

    const identity = await identityResponse.json();

    // Delete TOTP credential via Admin API
    const deleteResponse = await fetch(
      `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}/credentials/totp`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!deleteResponse.ok && deleteResponse.status !== 404) {
      const errorText = await deleteResponse.text();
      console.error('[mfa/disable] TOTP delete error:', errorText);
      return NextResponse.json(
        { error: 'Failed to disable MFA' },
        { status: 400 }
      );
    }

    // Log audit event
    try {
      await fetch(`${AUDIT_SERVICE_URL}/api/v1/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'totp_disabled',
          event_category: 'authentication',
          event_outcome: 'success',
          user_id: identityId,
          user_email: userEmail,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          service_name: 'frontend',
          message: 'User disabled TOTP two-factor authentication',
        }),
      });
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('[POST mfa/disable] Error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
