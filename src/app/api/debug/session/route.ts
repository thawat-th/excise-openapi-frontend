import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session-store';
import { verifyCookie } from '@/lib/crypto-utils';
import { getClientIP } from '@/lib/ip-utils';

/**
 * GET /api/debug/session
 *
 * Debug endpoint to check session status
 * WARNING: Remove in production or protect with auth
 */
export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check all cookies
    const allCookies = request.cookies.getAll();
    const cookieNames = allCookies.map(c => c.name);

    // Check for BFF session cookie
    const signedSessionId = request.cookies.get('excise_session')?.value;

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      cookies_found: cookieNames,
      has_excise_session: !!signedSessionId,
      client_ip: clientIP,
      user_agent: userAgent,
    };

    if (!signedSessionId) {
      debugInfo.error = 'No excise_session cookie found - user needs to login';
      debugInfo.solution = 'Clear all cookies and login again to create BFF session';
      return NextResponse.json(debugInfo);
    }

    // Try to verify cookie signature
    debugInfo.signed_session_id_preview = signedSessionId.substring(0, 20) + '...';
    const sessionId = verifyCookie(signedSessionId);

    if (!sessionId) {
      debugInfo.error = 'Invalid cookie signature';
      debugInfo.solution = 'Cookie has been tampered with or wrong COOKIE_SECRET';
      return NextResponse.json(debugInfo);
    }

    debugInfo.session_id_preview = sessionId.substring(0, 16) + '...';

    // Try to get session from store
    const session = await getSession(sessionId, {
      ip_address: clientIP,
      user_agent: userAgent,
    });

    if (!session) {
      debugInfo.error = 'No session found in store';
      debugInfo.solution = 'Session expired or doesn\'t exist - login again';
      return NextResponse.json(debugInfo);
    }

    // Session found! Check what's inside
    debugInfo.session_found = true;
    debugInfo.session_data = {
      has_access_token: !!session.access_token,
      has_id_token: !!session.id_token,
      has_refresh_token: !!session.refresh_token,
      has_kratos_session_token: !!session.kratos_session_token,
      has_user_id: !!session.user_id,
      created_at: new Date(session.created_at).toISOString(),
      last_accessed: new Date(session.last_accessed).toISOString(),
      expires_at: new Date(session.expires_at).toISOString(),
      ip_address: session.ip_address,
    };

    // Check token lengths (preview)
    if (session.access_token) {
      debugInfo.access_token_preview = session.access_token.substring(0, 20) + '...';
    }
    if (session.kratos_session_token) {
      debugInfo.kratos_session_token_preview = session.kratos_session_token.substring(0, 20) + '...';
    }

    debugInfo.success = true;
    debugInfo.message = 'BFF session is working correctly!';

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug error',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
