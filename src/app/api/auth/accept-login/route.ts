import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/session-store';

// Server-side only - connect to services via Docker internal network or localhost
const OAUTH_ADMIN_URL = process.env.AUTH_INTERNAL_ADMIN_URL || 'http://auth-server:4445';
const KRATOS_HOST = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const KRATOS_ADMIN_HOST = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://api-audit-service:5002';

// Map event types to ECS-compliant audit event
const EVENT_TYPE_MAP: Record<string, { event_type: string; status: string; event_outcome: string; message: string }> = {
  success: {
    event_type: 'login',
    status: 'success',
    event_outcome: 'success',
    message: 'User logged in successfully',
  },
  failure: {
    event_type: 'login',
    status: 'failure',
    event_outcome: 'failure',
    message: 'Login failed',
  },
  failure_credentials: {
    event_type: 'login',
    status: 'failure',
    event_outcome: 'failure',
    message: 'Invalid credentials',
  },
  failure_email_not_verified: {
    event_type: 'login',
    status: 'failure',
    event_outcome: 'failure',
    message: 'Email not verified',
  },
  failure_totp: {
    event_type: 'login',
    status: 'failure',
    event_outcome: 'failure',
    message: 'Invalid TOTP code',
  },
};

// Helper function to log login audit events to api-audit-service
async function logLoginAudit(
  eventType: 'success' | 'failure' | 'failure_credentials' | 'failure_email_not_verified' | 'failure_totp',
  email: string,
  ipAddress?: string,
  identityId?: string,
  reason?: string,
  userAgent?: string,
  sessionId?: string
): Promise<void> {
  try {
    const eventData = EVENT_TYPE_MAP[eventType] || EVENT_TYPE_MAP.failure;

    await fetch(`${AUDIT_SERVICE_URL}/v1/audit/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Event basics
        event_type: eventData.event_type,
        status: eventData.status,

        // ECS Event Classification
        event_kind: 'event',
        event_category: 'authentication',
        event_outcome: eventData.event_outcome,

        // Actor fields
        actor_id: identityId || '',
        actor_email: email,
        actor_role: 'user',

        // Target fields
        target_type: 'session',
        target_id: sessionId || '',
        target_label: email,

        // Client context
        ip_address: ipAddress || '',
        user_agent: userAgent || '',

        // Session context
        session_id: sessionId || '',

        // Service context
        service_name: 'frontend',
        service_version: '1.0.0',

        // Human-readable info
        message: eventData.message,
        error_message: eventData.event_outcome === 'failure' ? reason : '',
        reason: reason || '',
      }),
    });
  } catch (error) {
    console.error('[accept-login] Failed to log audit event:', error);
  }
}

// Helper function to get client IP from request
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''
  );
}

// Helper function to check if user has TOTP enabled
async function hasTOTPEnabled(identityId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${KRATOS_ADMIN_HOST}/admin/identities/${identityId}?include_credential=totp`
    );
    if (!response.ok) return false;

    const identity = await response.json();
    const totpCredential = identity.credentials?.totp;
    return !!(totpCredential?.identifiers?.length > 0);
  } catch (error) {
    console.error('[accept-login] Error checking TOTP status:', error);
    return false;
  }
}

// Helper function to accept Hydra login
async function acceptHydraLogin(
  loginChallenge: string,
  identity: any,
  email: string,
  rememberMe: boolean,
  aal: 'aal1' | 'aal2' = 'aal1',
  kratosSessionToken?: string
) {
  const url = `${OAUTH_ADMIN_URL}/admin/oauth2/auth/requests/login/accept?login_challenge=${encodeURIComponent(loginChallenge)}`;

  return fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: identity.id,
      remember: false, // DISABLE remember - force consent
      remember_for: 0,
      // Store in context - forwarded to consent
      context: {
        email,
        email_verified: true,
        given_name: identity.traits?.first_name || '',
        family_name: identity.traits?.last_name || '',
        traits: identity.traits,
        aal,
        kratos_session_token: kratosSessionToken,
      },
    }),
  });
}

/**
 * POST /api/auth/accept-login
 *
 * Handles login with Ory Kratos:
 * - Password login → Check if user has TOTP → Redirect to 2FA if needed
 * - TOTP submission → Complete AAL2 login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loginChallenge, subject, password, totpCode, flowId, rememberMe } = body;
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Read session token from httpOnly cookie (for TOTP submission)
    const sessionTokenFromCookie = request.cookies.get('mfa_session_token')?.value;

    console.log('[accept-login] Request for challenge:', loginChallenge?.substring(0, 20) + '...');

    if (!loginChallenge || !subject) {
      return NextResponse.json(
        { error: 'loginChallenge and subject are required' },
        { status: 400 }
      );
    }

    // =====================================================
    // CASE 1: TOTP submission (second step)
    // =====================================================
    if (totpCode && flowId && sessionTokenFromCookie) {
      console.log('[accept-login] TOTP submission for flow:', flowId);

      if (!/^\d{6}$/.test(totpCode)) {
        return NextResponse.json({ error: 'TOTP code must be 6 digits' }, { status: 400 });
      }

      // Submit TOTP to AAL2 flow with session token from cookie
      const totpResponse = await fetch(
        `${KRATOS_HOST}/self-service/login?flow=${flowId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Session-Token': sessionTokenFromCookie,
          },
          body: JSON.stringify({ method: 'totp', totp_code: totpCode }),
        }
      );

      const totpResult = await totpResponse.json();
      console.log('[accept-login] TOTP response status:', totpResponse.status);

      if (!totpResponse.ok) {
        const errors = [
          ...(totpResult.ui?.messages?.filter((m: any) => m.type === 'error') || []),
          ...(totpResult.ui?.nodes?.flatMap((n: any) => n.messages?.filter((m: any) => m.type === 'error') || []) || []),
        ];
        logLoginAudit('failure_totp', subject, clientIP, '', 'Invalid TOTP', userAgent);
        return NextResponse.json(
          { error: errors[0]?.text || 'Invalid TOTP code' },
          { status: 400 }
        );
      }

      // Get identity - may be null in API flow, fetch from Admin API
      let identity = totpResult.session?.identity;
      if (!identity) {
        const identityResponse = await fetch(
          `${KRATOS_ADMIN_HOST}/admin/identities?credentials_identifier=${encodeURIComponent(subject)}`
        );
        if (identityResponse.ok) {
          const identities = await identityResponse.json();
          identity = identities[0];
        }
      }

      if (!identity) {
        return NextResponse.json({ error: 'Failed to get identity' }, { status: 500 });
      }

      // Accept Hydra login (AAL2)
      console.log('[accept-login] 🔍 Accepting Hydra login (AAL2) with session token:', sessionTokenFromCookie?.substring(0, 20) + '...');
      const hydraResponse = await acceptHydraLogin(loginChallenge, identity, subject, rememberMe, 'aal2', sessionTokenFromCookie);
      const hydraData = await hydraResponse.json();
      console.log('[accept-login] 🔍 Hydra accept-login response:', JSON.stringify(hydraData, null, 2));

      if (!hydraResponse.ok) {
        console.error('[accept-login] Hydra error:', hydraData);
        return NextResponse.json(
          { error: 'Failed to complete login', details: hydraData },
          { status: hydraResponse.status }
        );
      }

      logLoginAudit('success', subject, clientIP, identity.id, '2FA verified', userAgent, sessionTokenFromCookie);
      console.log('[accept-login] 2FA login successful');

      // BFF Pattern: Clear MFA session cookie
      const response = NextResponse.json(hydraData);
      response.cookies.set('mfa_session_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 0, // Delete cookie
      });

      return response;
    }

    // =====================================================
    // CASE 2: Password submission (first step)
    // =====================================================
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    console.log('[accept-login] Password login for:', subject);

    // Create login flow with browser's user-agent
    const flowResponse = await fetch(`${KRATOS_HOST}/self-service/login/api`, {
      headers: {
        'User-Agent': userAgent,
        'X-Forwarded-For': clientIP,
      },
    });
    if (!flowResponse.ok) {
      return NextResponse.json({ error: 'Failed to initialize login' }, { status: 500 });
    }
    const flow = await flowResponse.json();
    console.log('[accept-login] Created flow:', flow.id);

    // Submit password with browser's user-agent so Kratos stores it
    const kratosResponse = await fetch(
      `${KRATOS_HOST}/self-service/login?flow=${flow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': userAgent,
          'X-Forwarded-For': clientIP,
        },
        body: JSON.stringify({ method: 'password', identifier: subject, password }),
      }
    );

    const kratosResult = await kratosResponse.json();
    console.log('[accept-login] Kratos response:', kratosResponse.status);

    // Check for errors
    const hasErrors = kratosResult.ui?.messages?.some((m: any) => m.type === 'error');
    if (!kratosResponse.ok || hasErrors) {
      const errorMsgs = kratosResult.ui?.messages?.filter((m: any) => m.type === 'error') || [];

      if (kratosResult.ui?.nodes?.some((n: any) => n.messages?.some((m: any) => m.id === 4000010))) {
        logLoginAudit('failure_email_not_verified', subject, clientIP, '', '', userAgent);
        return NextResponse.json({ error: 'Email not verified', code: 'email_not_verified' }, { status: 403 });
      }

      logLoginAudit('failure_credentials', subject, clientIP, '', '', userAgent);
      return NextResponse.json(
        { error: errorMsgs.map((m: any) => m.text).join(', ') || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // API flow may return session.identity as null
    let identity = kratosResult.session?.identity;
    const kratosSessionToken = kratosResult.session_token;

    if (!identity && kratosSessionToken) {
      // Fetch identity from Admin API
      const identityResponse = await fetch(
        `${KRATOS_ADMIN_HOST}/admin/identities?credentials_identifier=${encodeURIComponent(subject)}`
      );
      if (identityResponse.ok) {
        const identities = await identityResponse.json();
        identity = identities[0];
      }
    }

    if (!identity) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('[accept-login] Password verified for:', identity.id);

    // Check email verification
    const emailAddr = identity.verifiable_addresses?.find((a: any) => a.via === 'email');
    if (emailAddr && !emailAddr.verified) {
      logLoginAudit('failure_email_not_verified', subject, clientIP, identity.id, '', userAgent);
      return NextResponse.json(
        { error: 'Please verify your email before logging in', code: 'email_not_verified' },
        { status: 403 }
      );
    }

    // =====================================================
    // Check if user has TOTP → Redirect to 2FA
    // =====================================================
    const totpEnabled = await hasTOTPEnabled(identity.id);

    if (totpEnabled) {
      console.log('[accept-login] User has TOTP, creating AAL2 flow...');

      // Create AAL2 flow with session token
      const aal2Response = await fetch(
        `${KRATOS_HOST}/self-service/login/api?aal=aal2`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'X-Session-Token': kratosSessionToken },
        }
      );

      let aal2FlowId = '';
      if (aal2Response.ok) {
        const aal2Flow = await aal2Response.json();
        aal2FlowId = aal2Flow.id;
        console.log('[accept-login] Created AAL2 flow:', aal2FlowId);
      }

      // Set httpOnly cookie with session token for 2FA page
      const response = NextResponse.json({
        requires_2fa: true,
        flow_id: aal2FlowId,
        redirect_to: `/auth/2fa?login_challenge=${encodeURIComponent(loginChallenge)}&flow_id=${aal2FlowId}&email=${encodeURIComponent(subject)}`,
      });

      response.cookies.set('mfa_session_token', kratosSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 300, // 5 minutes
      });

      console.log('[accept-login] Set mfa_session_token cookie');
      return response;
    }

    // =====================================================
    // No 2FA → Accept Hydra login directly
    // =====================================================
    console.log('[accept-login] No 2FA, accepting with Hydra...');
    console.log('[accept-login] 🔍 Accepting with session token:', kratosSessionToken?.substring(0, 20) + '...');
    const hydraResponse = await acceptHydraLogin(loginChallenge, identity, subject, rememberMe, 'aal1', kratosSessionToken);
    const hydraData = await hydraResponse.json();
    console.log('[accept-login] 🔍 Hydra accept-login response:', JSON.stringify(hydraData, null, 2));

    if (!hydraResponse.ok) {
      console.error('[accept-login] Hydra error:', hydraData);
      return NextResponse.json(
        { error: 'Failed to accept login', details: hydraData },
        { status: hydraResponse.status }
      );
    }

    logLoginAudit('success', subject, clientIP, identity.id, '', userAgent, kratosSessionToken);
    console.log('[accept-login] Login successful');

    // BFF Pattern: ไม่ส่ง kratos_session_token ใน cookie
    // จะถูกเก็บไว้ใน session store หลังจาก token exchange
    const response = NextResponse.json(hydraData);
    return response;

  } catch (error) {
    console.error('[accept-login] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
