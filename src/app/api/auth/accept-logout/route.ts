import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session-store';
import { verifyCookie } from '@/lib/crypto-utils';

// Server-side only - connect to Hydra Admin API
const OAUTH_ADMIN_URL = process.env.AUTH_INTERNAL_ADMIN_URL || 'http://auth-server:4445';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logoutChallenge } = body;

    if (!logoutChallenge) {
      return NextResponse.json(
        { error: 'logoutChallenge is required' },
        { status: 400 }
      );
    }

    const url = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/logout/accept?logout_challenge=${encodeURIComponent(logoutChallenge)}`;
    console.log('[accept-logout] Accepting:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[accept-logout] Error:', data);
      return NextResponse.json(
        { error: 'Failed to accept logout', details: data },
        { status: response.status }
      );
    }

    console.log('[accept-logout] Success, redirect_to:', data.redirect_to);

    // BFF Pattern: Destroy server-side session
    const sessionCookie = request.cookies.get('excise_session');
    if (sessionCookie) {
      const sessionId = verifyCookie(sessionCookie.value);
      if (sessionId) {
        await deleteSession(sessionId);
      }
    }

    // Clear all auth cookies on logout
    const jsonResponse = NextResponse.json(data);
    jsonResponse.cookies.delete('access_token');
    jsonResponse.cookies.delete('refresh_token');
    jsonResponse.cookies.delete('id_token');
    jsonResponse.cookies.delete('authenticated');
    jsonResponse.cookies.delete('ory_kratos_session');
    jsonResponse.cookies.delete('excise_session'); // BFF session cookie

    return jsonResponse;
  } catch (error) {
    console.error('[accept-logout] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
