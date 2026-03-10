/**
 * Session Helper Functions
 *
 * BFF Pattern: Helpers for API routes to get tokens from server-side session store
 */

import { NextRequest } from 'next/server';
import { getSession } from './session-store';
import { verifyCookie } from './crypto-utils';
import { getClientIP } from './ip-utils';

export interface SessionTokens {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  kratos_session_token?: string;
  user_id?: string;
}

/**
 * Get access token from session for API routes
 *
 * BFF Pattern: Extract signed session cookie → verify → get tokens from store
 *
 * @param request - NextRequest object
 * @returns SessionTokens or null if session invalid
 */
export async function getSessionTokens(request: NextRequest): Promise<SessionTokens | null> {
  console.log('[session-helpers][DEBUG] ========== getSessionTokens() START ==========');
  console.log('[session-helpers][DEBUG] Request URL:', request.url);
  console.log('[session-helpers][DEBUG] Request method:', request.method);

  try {
    // Get signed session cookie
    console.log('[session-helpers][DEBUG] Extracting gov_iam_session cookie...');
    const signedSessionId = request.cookies.get('gov_iam_session')?.value;
    console.log('[session-helpers][DEBUG] Cookie raw value:', signedSessionId ? `${signedSessionId.substring(0, 30)}... (${signedSessionId.length} chars)` : 'undefined');

    // Debug: List all cookies
    const allCookies = request.cookies.getAll();
    console.log('[session-helpers][DEBUG] All cookies present:', allCookies.map(c => c.name).join(', '));

    if (!signedSessionId) {
      console.warn('[session-helpers][WARN] No gov_iam_session cookie found');
      console.log('[session-helpers][DEBUG] ========== getSessionTokens() END (no cookie) ==========');
      return null;
    }

    console.log('[session-helpers][DEBUG] Found session cookie:', signedSessionId.substring(0, 20) + '...');

    // Verify cookie signature (Banking: ป้องกัน tampering)
    console.log('[session-helpers][DEBUG] Verifying cookie signature...');
    const sessionId = verifyCookie(signedSessionId);

    if (!sessionId) {
      console.warn('[session-helpers][WARN] Invalid session signature');
      console.log('[session-helpers][DEBUG] Cookie format:', signedSessionId.includes('.') ? 'Has dot separator' : 'No dot separator');
      console.log('[session-helpers][DEBUG] ========== getSessionTokens() END (invalid signature) ==========');
      return null;
    }

    console.log('[session-helpers][SUCCESS] Verified session ID:', sessionId.substring(0, 16) + '...');
    console.log('[session-helpers][DEBUG] Session ID length:', sessionId.length);

    // Zero-Trust: Get client IP and User-Agent for validation
    console.log('[session-helpers][DEBUG] Extracting client metadata...');
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    console.log('[session-helpers][DEBUG] Client IP:', clientIP);
    console.log('[session-helpers][DEBUG] User-Agent:', userAgent.substring(0, 50) + '...');

    // Get session data from store
    console.log('[session-helpers][DEBUG] Calling getSession() from session-store...');
    const session = await getSession(sessionId, {
      ip_address: clientIP,
      user_agent: userAgent,
    });

    console.log('[session-helpers][DEBUG] getSession() returned:', session ? 'Session object' : 'null');

    if (!session) {
      console.warn('[session-helpers][WARN] No session found in store for ID:', sessionId.substring(0, 16) + '...');
      console.log('[session-helpers][DEBUG] ========== getSessionTokens() END (no session in store) ==========');
      return null;
    }

    console.log('[session-helpers][DEBUG] Session data retrieved:');
    console.log('[session-helpers][DEBUG]   - user_id:', session.user_id);
    console.log('[session-helpers][DEBUG]   - has access_token:', !!session.access_token, session.access_token ? `(${session.access_token.substring(0, 20)}...)` : '');
    console.log('[session-helpers][DEBUG]   - has id_token:', !!session.id_token);
    console.log('[session-helpers][DEBUG]   - has refresh_token:', !!session.refresh_token);
    console.log('[session-helpers][DEBUG]   - has kratos_session_token:', !!session.kratos_session_token, session.kratos_session_token ? `(${session.kratos_session_token.substring(0, 20)}...)` : '');
    console.log('[session-helpers][DEBUG]   - created_at:', new Date(session.created_at).toISOString());
    console.log('[session-helpers][DEBUG]   - last_accessed:', new Date(session.last_accessed).toISOString());
    console.log('[session-helpers][DEBUG]   - expires_at:', new Date(session.expires_at).toISOString());

    // Return tokens (server-side only, never sent to client)
    const tokens: SessionTokens = {
      access_token: session.access_token,
      id_token: session.id_token,
      refresh_token: session.refresh_token,
      kratos_session_token: session.kratos_session_token,
      user_id: session.user_id,
    };

    console.log('[session-helpers][SUCCESS] Returning session tokens');
    console.log('[session-helpers][DEBUG] ========== getSessionTokens() END (success) ==========');
    return tokens;
  } catch (error) {
    console.error('[session-helpers][ERROR] Error getting session tokens:', error);
    if (error instanceof Error) {
      console.error('[session-helpers][ERROR] Error message:', error.message);
      console.error('[session-helpers][ERROR] Error stack:', error.stack);
    }
    console.log('[session-helpers][DEBUG] ========== getSessionTokens() END (error) ==========');
    return null;
  }
}

/**
 * Get access token only (for simple API routes)
 *
 * @param request - NextRequest object
 * @returns access_token string or null
 */
export async function getAccessToken(request: NextRequest): Promise<string | null> {
  console.log('[session-helpers][DEBUG] getAccessToken() called');
  const tokens = await getSessionTokens(request);
  console.log('[session-helpers][DEBUG] getAccessToken() result:', tokens ? 'Has access_token' : 'null');
  return tokens?.access_token || null;
}

/**
 * Get Kratos session token (for Kratos API calls)
 *
 * @param request - NextRequest object
 * @returns kratos_session_token string or null
 */
export async function getKratosSessionToken(request: NextRequest): Promise<string | null> {
  console.log('[session-helpers][DEBUG] getKratosSessionToken() called');
  const tokens = await getSessionTokens(request);
  console.log('[session-helpers][DEBUG] getKratosSessionToken() result:', tokens?.kratos_session_token ? `Has token (${tokens.kratos_session_token.substring(0, 20)}...)` : 'null');
  return tokens?.kratos_session_token || null;
}
