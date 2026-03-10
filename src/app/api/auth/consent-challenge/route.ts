import { NextRequest, NextResponse } from 'next/server';

// Server-side only - connect to Hydra Admin API
const OAUTH_ADMIN_URL = process.env.AUTH_INTERNAL_ADMIN_URL || 'http://auth-server:4445';

// First-party client IDs that should skip consent
const FIRST_PARTY_CLIENTS = [
  '300b3f56-ecdc-4ebd-a3ad-c76647cb307b', // excise-frontend
  process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
].filter(Boolean);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const consentChallenge = searchParams.get('consent_challenge');

    console.log('[consent-challenge] Received request for challenge:', consentChallenge);

    if (!consentChallenge) {
      return NextResponse.json(
        { error: 'consent_challenge parameter is required' },
        { status: 400 }
      );
    }

    // Get consent challenge from Hydra
    const url = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/consent?consent_challenge=${encodeURIComponent(consentChallenge)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[consent-challenge] Hydra error response:', data);
      return NextResponse.json(
        { error: 'Failed to fetch consent challenge from auth server', details: data },
        { status: response.status }
      );
    }

    const clientId = data.client?.client_id;
    const isFirstParty = FIRST_PARTY_CLIENTS.includes(clientId);

    console.log('[consent-challenge] skip:', data.skip, 'client:', clientId, 'isFirstParty:', isFirstParty);

    // Auto-accept for first-party apps
    if (isFirstParty) {
      console.log('[consent-challenge] Auto-accepting consent for first-party app');

      const acceptUrl = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/consent/accept?consent_challenge=${encodeURIComponent(consentChallenge)}`;
      const acceptResponse = await fetch(acceptUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_scope: data.requested_scope,
          grant_access_token_audience: data.requested_access_token_audience,
          remember: true,
          remember_for: 3600,
          // BFF Pattern: Forward login context to ID token
          session: {
            id_token: data.context || {},
          },
        }),
      });

      const acceptData = await acceptResponse.json();

      if (!acceptResponse.ok) {
        console.error('[consent-challenge] Auto-accept failed:', acceptData);
        return NextResponse.json(data); // Fall back to showing consent page
      }

      console.log('[consent-challenge] Auto-accept successful, redirect:', acceptData.redirect_to);

      // Return redirect info so client can redirect
      return NextResponse.json({
        ...data,
        auto_accepted: true,
        redirect_to: acceptData.redirect_to,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[consent-challenge] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
