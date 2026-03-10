import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

/**
 * GET /api/account/mfa/status
 * Check if TOTP is enabled for the current user
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
    const email = session.identity?.traits?.email || '';

    // Get identity from Kratos Admin API
    const identityResponse = await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}?include_credential=totp`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!identityResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get identity' },
        { status: 500 }
      );
    }

    const identity = await identityResponse.json();

    // Check if TOTP credential exists and has identifiers
    const totpCredential = identity.credentials?.totp;
    const totpEnabled = !!(totpCredential && totpCredential.identifiers && totpCredential.identifiers.length > 0);

    const lookupSecretCredential = identity.credentials?.lookup_secret;
    const lookupSecretEnabled = !!(lookupSecretCredential && lookupSecretCredential.identifiers && lookupSecretCredential.identifiers.length > 0);

    return NextResponse.json({
      totpEnabled,
      lookupSecretEnabled,
      hasRecoveryCodes: lookupSecretEnabled,
      identityId,
      email,
    });
  } catch (error) {
    console.error('[GET mfa/status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get MFA status' },
      { status: 500 }
    );
  }
}
