import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

// Internal URLs
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';

/**
 * GET /api/account/sessions
 * List all active sessions for the current user from Kratos
 *
 * Flow (BFF Pattern):
 * 1. Get kratos_session_token from BFF session store
 * 2. Call Kratos /sessions/whoami to get current session
 * 3. Return current session info
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[sessions][DEBUG] GET /api/account/sessions called');

    // BFF Pattern: Get Kratos session token from server-side session
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      console.warn('[sessions][WARN] No Kratos session token found');
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('[sessions][DEBUG] Got Kratos token:', kratosSessionToken.substring(0, 20) + '...');
    console.log('[sessions][DEBUG] Calling Kratos whoami with X-Session-Token header');

    // Get current session from Kratos
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
      },
    });

    console.log('[sessions][DEBUG] Kratos whoami response status:', whoamiResponse.status);

    if (!whoamiResponse.ok) {
      const errorText = await whoamiResponse.text();
      console.error('[sessions][ERROR] Kratos whoami failed:', whoamiResponse.status);
      console.error('[sessions][ERROR] Response body:', errorText);
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const kratosSession = await whoamiResponse.json();
    const identityId = kratosSession.identity.id;

    console.log('[sessions] Current session for identity:', identityId);

    // Parse user agent and IP from current request
    const browserUserAgent = request.headers.get('user-agent') || 'Unknown device';
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'Unknown';

    const deviceInfo = parseUserAgent(browserUserAgent);

    // Build current session from Kratos session data
    const currentSession = {
      id: kratosSession.id || 'current',
      device: deviceInfo.device,
      deviceType: deviceInfo.deviceType,
      location: 'Unknown location', // Kratos doesn't store location
      ip: maskIpAddress(clientIP),
      lastActive: 'activeNow',
      current: true,
      authenticatedAt: kratosSession.authenticated_at || new Date().toISOString(),
      expiresAt: kratosSession.expires_at,
    };

    // Note: Kratos doesn't have a "list all sessions by identity" endpoint
    // We only return the current session that the user is using right now
    const sessions = [currentSession];

    console.log('[sessions] Returning', sessions.length, 'session(s)');

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[GET sessions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

function parseUserAgent(userAgent: string): { device: string; deviceType: 'desktop' | 'mobile' | 'tablet' } {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    deviceType = 'mobile';
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    deviceType = 'tablet';
  }

  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    os = 'macOS';
  } else if (ua.includes('linux') && !ua.includes('android')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  return {
    device: `${browser} on ${os}`,
    deviceType,
  };
}

function maskIpAddress(ip: string): string {
  if (!ip || ip === 'Unknown') return 'Unknown';

  // Handle IPv4
  const ipv4Parts = ip.split('.');
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.xxx.xxx`;
  }

  // Handle IPv6 (simplified masking)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:xxxx:xxxx`;
    }
  }

  return ip;
}
