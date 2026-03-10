import { NextRequest, NextResponse } from 'next/server';

// Server-side only - connect to Hydra Admin API
// Use environment variable to support both Docker and local development
const OAUTH_ADMIN_URL = process.env.AUTH_INTERNAL_ADMIN_URL || 'http://auth-server:4445';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const loginChallenge = searchParams.get('login_challenge');

    console.log('[login-challenge] Received request for challenge:', loginChallenge);
    console.log('[login-challenge] Using OAUTH_ADMIN_URL:', OAUTH_ADMIN_URL);

    if (!loginChallenge) {
      return NextResponse.json(
        { error: 'login_challenge parameter is required' },
        { status: 400 }
      );
    }

    const url = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/login?login_challenge=${encodeURIComponent(loginChallenge)}`;
    console.log('[login-challenge] Calling URL:', url);

    // Server-side call to Hydra admin API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[login-challenge] Hydra response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('[login-challenge] Hydra error response:', data);
      return NextResponse.json(
        { error: 'Failed to fetch login challenge from auth server', details: data },
        { status: response.status }
      );
    }

    console.log('[login-challenge] Success, returning challenge data');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[login-challenge] Error in login-challenge API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
