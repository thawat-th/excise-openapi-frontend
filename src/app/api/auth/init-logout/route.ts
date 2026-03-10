import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';

// Use Kong gateway URL for browser-accessible OAuth endpoints
const OAUTH_BROWSER_URL = process.env.NEXT_PUBLIC_OAUTH_URL || 'http://localhost:8000/auth';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

/**
 * GET /api/auth/init-logout
 * Initiates OAuth2 logout flow by redirecting to Hydra's logout endpoint
 *
 * BFF Pattern: Get id_token from server-side session store
 */
export async function GET(request: NextRequest) {
  // BFF Pattern: Get id_token from server-side session store
  const tokens = await getSessionTokens(request);
  const idToken = tokens?.id_token;

  // Build OAuth2 logout URL (browser-accessible via Kong)
  const logoutUrl = new URL(`${OAUTH_BROWSER_URL}/oauth2/sessions/logout`);

  if (idToken) {
    logoutUrl.searchParams.set('id_token_hint', idToken);
  }

  // Set post logout redirect URI
  logoutUrl.searchParams.set('post_logout_redirect_uri', FRONTEND_URL);

  console.log('[init-logout] Redirecting to OAuth2 logout');

  return NextResponse.redirect(logoutUrl.toString());
}
