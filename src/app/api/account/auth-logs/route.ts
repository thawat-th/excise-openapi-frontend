import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://api-audit-service:5002';

/**
 * GET /api/account/auth-logs
 * Fetch authentication logs for the current user from audit service
 */
export async function GET(request: NextRequest) {
  try {
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get current user's email from Kratos session
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
      },
    });

    if (!whoamiResponse.ok) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();
    const userEmail = session.identity?.traits?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Could not identify user' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch auth logs from audit service
    const auditResponse = await fetch(
      `${AUDIT_SERVICE_URL}/v1/audit/events?` +
      `actor_email=${encodeURIComponent(userEmail)}` +
      `&event_category=authentication` +
      `&limit=${limit}` +
      `&offset=${offset}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!auditResponse.ok) {
      console.error('[auth-logs] Failed to fetch audit events');
      return NextResponse.json(
        { error: 'Failed to fetch auth logs' },
        { status: 500 }
      );
    }

    const auditResult = await auditResponse.json();
    const events = auditResult.data?.audits || [];
    const total = auditResult.data?.total || 0;

    // Map audit events to auth log format
    const logs = events.map((event: any) => ({
      id: event.id,
      action: mapEventTypeToAction(event.event_type),
      device: parseDevice(event.user_agent),
      location: event.geo_country || 'Unknown',
      ip: maskIpAddress(event.ip_address || 'Unknown'),
      time: event.timestamp,
      success: event.status === 'success',
    }));

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('[GET auth-logs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auth logs' },
      { status: 500 }
    );
  }
}

function mapEventTypeToAction(eventType: string): string {
  const actionMap: Record<string, string> = {
    login: 'Login',
    login_success: 'Login',
    login_failure: 'Login attempt',
    login_failure_credentials: 'Login attempt',
    login_failure_email_not_verified: 'Login attempt',
    login_failure_totp: 'Login attempt',
    logout: 'Logout',
    password_change: 'Password changed',
    mfa_change: 'MFA changed',
    totp_enabled: 'MFA enabled',
    totp_disabled: 'MFA disabled',
  };
  return actionMap[eventType] || eventType;
}

function parseDevice(userAgent: string | null): string {
  if (!userAgent) return 'Unknown';

  const ua = userAgent.toLowerCase();

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
  }

  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    os = 'MacOS';
  } else if (ua.includes('linux') && !ua.includes('android')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  return `${browser} on ${os}`;
}

function maskIpAddress(ip: string): string {
  if (!ip || ip === 'Unknown') return 'Unknown';

  // Handle IPv4
  const ipv4Parts = ip.split('.');
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.xxx.xxx`;
  }

  return ip;
}
