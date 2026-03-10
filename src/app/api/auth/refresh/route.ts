/**
 * Token Refresh API Endpoint
 *
 * Banking/Government Security:
 * - Proactive token refresh (frontend can call before expiration)
 * - Rate limiting to prevent abuse
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session-store';
import { refreshAccessToken } from '@/lib/token-refresh';
import { verifyCookie } from '@/lib/crypto-utils';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limiter';
import { getClientIP } from '@/lib/ip-utils';

export async function POST(request: NextRequest) {
  try {
    // Banking: Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = `refresh:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.API);

    if (!rateLimit.allowed) {
      console.warn('[refresh] Rate limit exceeded for IP:', clientIP);
      const response = NextResponse.json(
        { error: 'Too many requests', retry_after: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) },
        { status: 429 }
      );

      const headers = getRateLimitHeaders(rateLimit);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // Get session cookie
    const signedSessionId = request.cookies.get('excise_session')?.value;

    if (!signedSessionId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // Verify cookie signature (Banking: ป้องกัน tampering)
    const sessionId = verifyCookie(signedSessionId);

    if (!sessionId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get session data
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Refresh token
    const refreshed = await refreshAccessToken(sessionId, session);

    if (!refreshed) {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 401 }
      );
    }

    // Success
    const response = NextResponse.json({ success: true, refreshed: true });

    // Set rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimit);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('[refresh] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
