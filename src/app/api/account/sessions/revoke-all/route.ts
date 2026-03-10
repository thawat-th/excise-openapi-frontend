import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

// BFF Pattern: Use internal Kratos for server-side API calls
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

/**
 * POST /api/account/sessions/revoke-all
 * Revoke all sessions except current using Kratos self-service API
 */
export async function POST(request: NextRequest) {
  try {
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Verify current session is valid
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

    // Revoke all other sessions using Kratos self-service API
    // DELETE /sessions - Disable My Other Sessions
    const revokeResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/sessions`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
      }
    );

    if (!revokeResponse.ok) {
      const errorText = await revokeResponse.text();
      console.error('[sessions] Failed to revoke all sessions:', errorText);
      return NextResponse.json(
        { error: 'Failed to revoke sessions' },
        { status: 500 }
      );
    }

    // Get revoked count from response
    let revokedCount = 0;
    try {
      const result = await revokeResponse.json();
      revokedCount = result.count || 0;
    } catch {
      // Response might be empty
    }

    console.log(`[sessions] Revoked ${revokedCount} other sessions`);

    return NextResponse.json({
      success: true,
      message: 'All other sessions revoked successfully',
      revokedCount,
    });
  } catch (error) {
    console.error('[POST sessions/revoke-all] Error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
