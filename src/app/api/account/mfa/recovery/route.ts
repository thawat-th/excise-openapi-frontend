import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://api-governance-service:5001';

/**
 * GET /api/account/mfa/recovery
 * Get recovery codes
 * BFF Pattern: Use kratos_session_token from Redis session
 */
export async function GET(request: NextRequest) {
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

    // Get identity from Kratos Admin API with lookup_secret credential
    const identityResponse = await fetch(
      `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}?include_credential=lookup_secret`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!identityResponse.ok) {
      console.error('[mfa/recovery] Failed to get identity');
      return NextResponse.json(
        { error: 'Failed to get recovery codes' },
        { status: 500 }
      );
    }

    const identity = await identityResponse.json();

    // Check if lookup_secret (recovery codes) exist
    const lookupSecret = identity.credentials?.lookup_secret;
    let codes: string[] = [];

    if (lookupSecret?.config?.recovery_codes) {
      codes = lookupSecret.config.recovery_codes
        .filter((c: any) => !c.used_at)
        .map((c: any) => c.code);
    }

    return NextResponse.json({
      codes,
      hasRecoveryCodes: codes.length > 0,
    });
  } catch (error) {
    console.error('[GET mfa/recovery] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get recovery codes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/mfa/recovery
 * Regenerate recovery codes
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

    // Generate new recovery codes
    const codes = generateRecoveryCodes(12);

    // Get current identity
    const identityResponse = await fetch(
      `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!identityResponse.ok) {
      console.error('[mfa/recovery] Failed to get identity');
      return NextResponse.json(
        { error: 'Failed to regenerate recovery codes' },
        { status: 500 }
      );
    }

    const identity = await identityResponse.json();

    // Update identity with new lookup_secret credential
    const updateResponse = await fetch(
      `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          schema_id: identity.schema_id,
          traits: identity.traits,
          state: identity.state,
          credentials: {
            ...identity.credentials,
            lookup_secret: {
              config: {
                recovery_codes: codes.map(code => ({ code })),
              },
            },
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('[mfa/recovery] Failed to update identity:', errorText);
      return NextResponse.json(
        { error: 'Failed to regenerate recovery codes' },
        { status: 500 }
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
          event_type: 'recovery_codes_regenerated',
          event_category: 'authentication',
          event_outcome: 'success',
          user_id: identityId,
          user_email: userEmail,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          service_name: 'frontend',
          message: 'User regenerated recovery codes',
        }),
      });
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }

    return NextResponse.json({
      codes,
      hasRecoveryCodes: true,
    });
  } catch (error) {
    console.error('[POST mfa/recovery] Error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate recovery codes' },
      { status: 500 }
    );
  }
}

/**
 * Generate recovery codes
 */
function generateRecoveryCodes(count: number): string[] {
  const codes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars

  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 12; j++) {
      if (j > 0 && j % 4 === 0) code += '-';
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    codes.push(code);
  }

  return codes;
}
