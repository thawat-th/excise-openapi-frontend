import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session-store';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limiter';
import { getClientIP } from '@/lib/ip-utils';
import { signCookie } from '@/lib/crypto-utils';

// Server-side only - connect to Hydra via Docker network or localhost
const AUTH_SERVER_PUBLIC_URL = process.env.AUTH_SERVER_PUBLIC_URL || 'http://auth-server:4444';

// OAuth2 client credentials (should be in env vars)
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || '300b3f56-ecdc-4ebd-a3ad-c76647cb307b';
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || 'frontend-secret';
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

// BFF Pattern: Use reverse proxy for Kratos (same domain as frontend)
// Server-side: Use internal Docker URL for direct connection
// This allows us to receive Kratos session cookie from reverse proxy
const KRATOS_INTERNAL_URL = process.env.KRATOS_INTERNAL_URL || 'http://kratos:4433';

export async function POST(request: NextRequest) {
  try {
    // Banking/Zero-Trust: Get client IP and User-Agent
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('[token] Request from IP:', clientIP);

    // Banking: Rate limiting (ป้องกัน token abuse)
    const rateLimitKey = `token:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.API);

    if (!rateLimit.allowed) {
      console.warn('[token] Rate limit exceeded for IP:', clientIP);
      const response = NextResponse.json(
        { error: 'Too many requests', retry_after: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) },
        { status: 429 }
      );

      // Set rate limit headers
      const headers = getRateLimitHeaders(rateLimit);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    console.log('[token] Exchanging code for tokens');

    // Exchange authorization code for tokens
    const tokenUrl = `${AUTH_SERVER_PUBLIC_URL}/oauth2/token`;

    // OAuth2: Try client_secret_basic first (more secure), fallback to client_secret_post
    // client_secret_basic: credentials in Authorization header (recommended)
    const useBasicAuth = process.env.OAUTH_TOKEN_AUTH_METHOD !== 'client_secret_post';

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (useBasicAuth) {
      // client_secret_basic: credentials in Authorization header
      const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    } else {
      // client_secret_post: credentials in request body
      params.set('client_id', CLIENT_ID);
      params.set('client_secret', CLIENT_SECRET);
    }

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers,
      body: params.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[token] Token exchange failed:', tokenData);
      return NextResponse.json(
        { error: 'Token exchange failed', details: tokenData },
        { status: tokenResponse.status }
      );
    }

    console.log('[token][DEBUG] ========== TOKEN EXCHANGE START ==========');
    console.log('[token][DEBUG] Token exchange successful');
    console.log('[token][DEBUG] Received tokens:', {
      has_access_token: !!tokenData.access_token,
      has_id_token: !!tokenData.id_token,
      has_refresh_token: !!tokenData.refresh_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
    });
    console.log('[token][DEBUG] Full token response:', JSON.stringify(tokenData, null, 2));

    // BFF Pattern: Get Kratos session token from ID token context
    // The accept-login route passes kratos_session_token to Hydra context
    // Hydra includes it in the ID token claims
    let kratosSessionToken: string | undefined;
    let userId: string | undefined;
    let userTraits: any;

    // Decode ID token to get Kratos session token from context
    if (tokenData.id_token) {
      try {
        console.log('[token][DEBUG] Decoding ID token...');
        // JWT format: header.payload.signature
        // We only need payload (base64url encoded)
        const payload = tokenData.id_token.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

        console.log('[token][DEBUG] ========== ID TOKEN PAYLOAD ==========');
        console.log('[token][DEBUG] Full ID token payload:', JSON.stringify(decodedPayload, null, 2));
        console.log('[token][DEBUG] All top-level keys:', Object.keys(decodedPayload));
        console.log('[token][DEBUG] Top-level claims:', {
          sub: decodedPayload.sub,
          email: decodedPayload.email,
          has_kratos_session_token: !!decodedPayload.kratos_session_token,
          has_ext: !!decodedPayload.ext,
        });

        // BFF Pattern: Try multiple locations for kratos_session_token
        // 1. Check root level (direct from session.id_token)
        // 2. Check ext claim (Hydra v2.2+ behavior)
        const extClaims = decodedPayload.ext || {};
        console.log('[token][DEBUG] ext claim keys:', Object.keys(extClaims));
        console.log('[token][DEBUG] ext claim content:', JSON.stringify(extClaims, null, 2));

        // Try root level first (our accept-consent puts context directly in session.id_token)
        if (decodedPayload.kratos_session_token) {
          kratosSessionToken = decodedPayload.kratos_session_token;
          userId = decodedPayload.sub;
          userTraits = decodedPayload.traits;

          console.log('[token][SUCCESS] Kratos session token found at ROOT level:', {
            user_id: userId,
            aal: decodedPayload.aal,
            token_preview: kratosSessionToken?.substring(0, 20) + '...',
            source: 'id_token_root',
          });
        }
        // Fallback to ext claim
        else if (extClaims.kratos_session_token) {
          kratosSessionToken = extClaims.kratos_session_token;
          userId = decodedPayload.sub;
          userTraits = extClaims.traits;

          console.log('[token][SUCCESS] Kratos session token found in EXT claim:', {
            user_id: userId,
            aal: extClaims.aal,
            token_preview: kratosSessionToken?.substring(0, 20) + '...',
            source: 'id_token_ext_claims',
          });
        } else {
          console.warn('[token][WARN] No kratos_session_token found in ID token');
          console.warn('[token][WARN] Checked locations: root level, ext claim');
          console.warn('[token][WARN] Root level keys:', Object.keys(decodedPayload));
          console.warn('[token][WARN] ext claim keys:', Object.keys(extClaims));
          console.warn('[token][WARN] Consent may have failed to forward session data');
        }
      } catch (error) {
        console.error('[token][ERROR] Failed to decode ID token:', error);
        if (error instanceof Error) {
          console.error('[token][ERROR] Error message:', error.message);
          console.error('[token][ERROR] Error stack:', error.stack);
        }
      }
    } else {
      console.warn('[token][WARN] No ID token received from Hydra');
    }

    // BFF Pattern: เก็บ tokens ไว้ server-side (session store)
    // Banking: ใช้ cryptographically secure session ID
    console.log('[token][DEBUG] Creating session with data:', {
      has_access_token: !!tokenData.access_token,
      has_id_token: !!tokenData.id_token,
      has_refresh_token: !!tokenData.refresh_token,
      has_kratos_session_token: !!kratosSessionToken,
      user_id: userId,
      has_user_traits: !!userTraits,
      ip_address: clientIP,
      user_agent: userAgent.substring(0, 50) + '...',
    });

    const sessionId = await createSession(
      {
        access_token: tokenData.access_token,
        id_token: tokenData.id_token,
        refresh_token: tokenData.refresh_token,
        kratos_session_token: kratosSessionToken,
        user_id: userId,
        user_traits: userTraits,
      },
      {
        // Zero-Trust: เก็บ IP และ User-Agent
        ip_address: clientIP,
        user_agent: userAgent,
      }
    );

    console.log('[token][DEBUG] Session created with ID:', sessionId.substring(0, 16) + '...');

    // ส่ง session cookie ไปให้ browser (httpOnly, secure, sameSite)
    const response = NextResponse.json({
      success: true,
      // ไม่ส่ง tokens กลับไปให้ client
    });

    // Banking/Government: Sign cookie เพื่อป้องกัน tampering
    const signedSessionId = signCookie(sessionId);
    console.log('[token][DEBUG] Signed session ID:', signedSessionId.substring(0, 30) + '...');

    // Set session cookie (httpOnly, secure, sameSite=strict)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours (Banking standard)
    };
    console.log('[token][DEBUG] Setting gov_iam_session cookie with options:', cookieOptions);
    response.cookies.set('gov_iam_session', signedSessionId, cookieOptions);

    // Set rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimit);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    console.log('[token][SUCCESS] Created secure BFF session');
    console.log('[token][DEBUG] ========== TOKEN EXCHANGE END ==========');
    return response;
  } catch (error) {
    console.error('[token] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
