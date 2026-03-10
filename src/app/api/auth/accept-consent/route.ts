import { NextRequest, NextResponse } from 'next/server';

// Server-side only - connect to Hydra Admin API
const OAUTH_ADMIN_URL = process.env.AUTH_INTERNAL_ADMIN_URL || 'http://auth-server:4445';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consentChallenge, grantScope } = body;

    console.log('[accept-consent] Received request for challenge:', consentChallenge);
    console.log('[accept-consent] Using OAUTH_ADMIN_URL:', OAUTH_ADMIN_URL);

    if (!consentChallenge) {
      return NextResponse.json(
        { error: 'consentChallenge is required' },
        { status: 400 }
      );
    }

    // BFF Pattern: Get consent request to retrieve session data from login step
    const getConsentUrl = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/consent?consent_challenge=${encodeURIComponent(consentChallenge)}`;
    console.log('[accept-consent] Getting consent request:', getConsentUrl);

    const consentRequest = await fetch(getConsentUrl);
    if (!consentRequest.ok) {
      console.error('[accept-consent] Failed to get consent request');
      return NextResponse.json(
        { error: 'Failed to get consent request' },
        { status: consentRequest.status }
      );
    }

    const consentData = await consentRequest.json();
    console.log('[accept-consent] 🔍 Full consent request data:', JSON.stringify(consentData, null, 2));
    console.log('[accept-consent] Consent request data:', {
      subject: consentData.subject,
      has_context: !!consentData.context,
      context_keys: consentData.context ? Object.keys(consentData.context) : [],
    });

    const url = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/consent/accept?consent_challenge=${encodeURIComponent(consentChallenge)}`;
    console.log('[accept-consent] Calling URL:', url);

    // BFF Pattern: Take context from login and put in session.id_token
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_scope: grantScope || [],
        // Put login context into session.id_token for ID token claims
        session: {
          id_token: consentData.context || {},
        },
      }),
    });

    console.log('[accept-consent] Hydra response status:', response.status);

    const data = await response.json();
    console.log('[accept-consent] 🔍 Hydra accept-consent response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('[accept-consent] Hydra error response:', data);
      return NextResponse.json(
        { error: 'Failed to accept consent challenge', details: data },
        { status: response.status }
      );
    }

    console.log('[accept-consent] Success, returning redirect URL');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[accept-consent] Error in accept-consent API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
