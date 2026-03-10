/**
 * Token Refresh Utilities
 *
 * Banking/Government Security:
 * - Automatic token refresh before expiration
 * - Refresh token rotation (ORY Hydra default)
 * - Graceful handling of refresh failures
 *
 * OAuth 2.0 Token Refresh Flow:
 * 1. Check if access_token is expiring soon
 * 2. Use refresh_token to get new access_token
 * 3. Update session with new tokens
 * 4. Hydra automatically rotates refresh_token (security best practice)
 */

import { SessionData, updateSession, deleteSession } from './session-store';

// Server-side only URLs
const AUTH_SERVER_PUBLIC_URL = process.env.AUTH_SERVER_PUBLIC_URL || 'http://auth-server:4444';
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || '300b3f56-ecdc-4ebd-a3ad-c76647cb307b';
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || 'frontend-secret';

/**
 * Check if token is expiring soon
 * Banking: Refresh 5 minutes before expiration
 */
export function isTokenExpiringSoon(session: SessionData): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  // Check if expires_at is within 5 minutes
  return session.expires_at - now < fiveMinutes;
}

/**
 * Refresh access token using refresh_token
 *
 * @param sessionId - Current session ID
 * @param session - Current session data
 * @returns true if refresh successful, false otherwise
 */
export async function refreshAccessToken(
  sessionId: string,
  session: SessionData
): Promise<boolean> {
  if (!session.refresh_token) {
    console.warn('[token-refresh] No refresh token available');
    return false;
  }

  try {
    console.log('[token-refresh] Refreshing access token for session:', sessionId.substring(0, 16) + '...');

    // OAuth2 token refresh request
    const tokenUrl = `${AUTH_SERVER_PUBLIC_URL}/oauth2/token`;

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[token-refresh] Refresh failed:', errorData);

      // Banking: ถ้า refresh token expired/invalid → logout
      if (response.status === 401 || response.status === 400) {
        console.warn('[token-refresh] Refresh token invalid, deleting session');
        await deleteSession(sessionId);
      }

      return false;
    }

    const tokenData = await response.json();

    // Update session with new tokens
    // Hydra automatically rotates refresh_token (OAuth 2.0 best practice)
    const updated = await updateSession(sessionId, {
      access_token: tokenData.access_token,
      id_token: tokenData.id_token,
      refresh_token: tokenData.refresh_token || session.refresh_token, // Fallback if not rotated
    });

    if (updated) {
      console.log('[token-refresh]  Token refreshed successfully');
      return true;
    } else {
      console.error('[token-refresh] Failed to update session');
      return false;
    }
  } catch (error) {
    console.error('[token-refresh] Error refreshing token:', error);
    return false;
  }
}

/**
 * Middleware helper: Check and refresh token if needed
 *
 * Use case: ใน middleware หรือ API route ที่ต้องการ access_token
 *
 * @param sessionId - Current session ID
 * @param session - Current session data
 * @returns Updated session if refreshed, original session otherwise
 */
export async function ensureValidToken(
  sessionId: string,
  session: SessionData
): Promise<SessionData | null> {
  // ถ้า token ยังไม่หมดอายุ → ใช้ได้เลย
  if (!isTokenExpiringSoon(session)) {
    return session;
  }

  console.log('[token-refresh] Token expiring soon, attempting refresh...');

  // พยายาม refresh
  const refreshed = await refreshAccessToken(sessionId, session);

  if (!refreshed) {
    // Refresh failed → session invalid
    console.error('[token-refresh] Failed to refresh, session invalid');
    return null;
  }

  // ดึง session ใหม่หลัง refresh (มี updated tokens)
  // NOTE: ต้อง import getSession จาก session-store แล้วเรียกใช้
  // แต่เพื่อหลีกเลี่ยง circular dependency ให้ caller ทำเอง

  return session; // Caller should re-fetch session
}

/**
 * Revoke refresh token (use case: logout)
 *
 * Banking/Government: ควร revoke tokens เมื่อ logout
 */
export async function revokeRefreshToken(refreshToken: string): Promise<boolean> {
  try {
    const revokeUrl = `${AUTH_SERVER_PUBLIC_URL}/oauth2/revoke`;

    const params = new URLSearchParams({
      token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    const response = await fetch(revokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('[token-refresh] Revoke failed:', await response.text());
      return false;
    }

    console.log('[token-refresh]  Refresh token revoked');
    return true;
  } catch (error) {
    console.error('[token-refresh] Error revoking token:', error);
    return false;
  }
}
