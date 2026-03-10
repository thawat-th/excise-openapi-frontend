import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

/**
 * GET /api/auth/session
 * Verify session by checking Kratos session
 * BFF Pattern: Use kratos_session_token from Redis session
 */
export async function GET(request: NextRequest) {
  try {
    // BFF Pattern: Get kratos_session_token from Redis session
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { authenticated: false, error: 'No session' },
        { status: 401 }
      );
    }

    // Verify session with Kratos whoami
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
      },
    });

    if (!whoamiResponse.ok) {
      // Session is invalid or expired
      return NextResponse.json(
        { authenticated: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();

    // Return session info
    return NextResponse.json({
      authenticated: true,
      active: session.active,
      subject: session.identity?.id,
      email: session.identity?.traits?.email,
      expires_at: session.expires_at,
      authenticated_at: session.authenticated_at,
    });
  } catch (error) {
    console.error('[session] Error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
