import { NextRequest, NextResponse } from 'next/server';

// Server-side only - connect to Hydra Admin API
const OAUTH_ADMIN_URL = process.env.AUTH_INTERNAL_ADMIN_URL || 'http://auth-server:4445';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const logoutChallenge = searchParams.get('logout_challenge');

    if (!logoutChallenge) {
      return NextResponse.json(
        { error: 'logout_challenge is required' },
        { status: 400 }
      );
    }

    const url = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/logout?logout_challenge=${encodeURIComponent(logoutChallenge)}`;
    console.log('[logout-challenge] Fetching:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('[logout-challenge] Error:', data);
      return NextResponse.json(
        { error: 'Failed to fetch logout challenge', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[logout-challenge] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
