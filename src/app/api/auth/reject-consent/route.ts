import { NextRequest, NextResponse } from 'next/server';

// Server-side only - connect to Hydra Admin API
const OAUTH_ADMIN_URL = process.env.AUTH_INTERNAL_ADMIN_URL || 'http://auth-server:4445';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consentChallenge, error, errorDescription } = body;

    console.log('[reject-consent] Received request for challenge:', consentChallenge);
    console.log('[reject-consent] Using OAUTH_ADMIN_URL:', OAUTH_ADMIN_URL);

    if (!consentChallenge) {
      return NextResponse.json(
        { error: 'consentChallenge is required' },
        { status: 400 }
      );
    }

    const url = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/consent/reject?consent_challenge=${encodeURIComponent(consentChallenge)}`;
    console.log('[reject-consent] Calling URL:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error || 'access_denied',
        error_description: errorDescription || 'User denied access',
      }),
    });

    console.log('[reject-consent] Hydra response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('[reject-consent] Hydra error response:', data);
      return NextResponse.json(
        { error: 'Failed to reject consent challenge', details: data },
        { status: response.status }
      );
    }

    console.log('[reject-consent] Success, returning redirect URL');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[reject-consent] Error in reject-consent API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
