import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectedRoutes, authRoutes, routes } from '@/lib/routes';
import type { PortalType } from '@/config/navigation';

// X-Request-ID Header name
const REQUEST_ID_HEADER = 'X-Request-ID';

// Hydra OAuth2 configuration
const HYDRA_PUBLIC_URL = process.env.NEXT_PUBLIC_OAUTH_URL || 'http://localhost:8000/auth';
const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'excise-frontend';
const OAUTH_REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

// Kratos configuration (internal Docker network for server-side validation)
const KRATOS_PUBLIC_URL = process.env.KRATOS_INTERNAL_URL || 'http://kratos:4433';

// Keto configuration (internal Docker network for permission checks)
const KETO_READ_URL = process.env.KETO_READ_URL || 'http://keto:4466';

function generateState(): string {
  return crypto.randomUUID();
}

function getOAuthAuthorizationUrl(state: string): string {
  const url = new URL(`${HYDRA_PUBLIC_URL}/oauth2/auth`);
  url.searchParams.set('client_id', OAUTH_CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', state);
  return url.toString();
}

function createOAuthRedirectResponse(request: NextRequest, requestId: string, clearCookies = false): NextResponse {
  console.log('[middleware][DEBUG] createOAuthRedirectResponse() called');
  console.log('[middleware][DEBUG] clearCookies:', clearCookies);

  const state = generateState();
  console.log('[middleware][DEBUG] Generated OAuth state:', state.substring(0, 16) + '...');

  const oauthUrl = getOAuthAuthorizationUrl(state);
  console.log('[middleware][DEBUG] OAuth authorization URL:', oauthUrl);

  const response = NextResponse.redirect(oauthUrl);

  // Set oauth_state cookie for CSRF protection
  // SameSite=Lax allows the cookie to be sent on top-level navigation (redirect from Hydra)
  // max-age=600 (10 minutes) to allow time for login+consent flow
  const isSecure = request.nextUrl.protocol === 'https:';
  console.log('[middleware][DEBUG] Setting oauth_state cookie (secure:', isSecure, ')');

  response.cookies.set('oauth_state', state, {
    path: '/',
    maxAge: 600,
    sameSite: 'lax',
    secure: isSecure,
    httpOnly: false, // Needs to be readable by client-side callback page
  });

  // BFF Pattern: Clear session cookie if invalid
  if (clearCookies) {
    console.log('[middleware][DEBUG] Clearing invalid session cookie');
    response.cookies.set('gov_iam_session', '', { path: '/', maxAge: 0 });
    console.log('[middleware][SUCCESS] Cleared invalid session cookie');
  }

  response.headers.set(REQUEST_ID_HEADER, requestId);
  console.log('[middleware][DEBUG] Set X-Request-ID header:', requestId);

  return response;
}

// Validate Kratos session token with Kratos server
async function validateKratosSession(sessionToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${KRATOS_PUBLIC_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': sessionToken,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('[middleware] Kratos validation error:', error);
    return false;
  }
}

// Get user session details from Kratos
async function getKratosSession(sessionToken: string): Promise<any> {
  try {
    const response = await fetch(`${KRATOS_PUBLIC_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': sessionToken,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('[middleware] Failed to get Kratos session:', error);
    return null;
  }
}

// Check user role in Keto
async function checkUserRole(userId: string, role: string): Promise<boolean> {
  try {
    const response = await fetch(`${KETO_READ_URL}/relation-tuples/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespace: 'Role',
        object: role,
        relation: 'member',
        subject_id: userId,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.allowed === true;
    }
    return false;
  } catch (error) {
    console.error('[middleware] Keto check error:', error);
    return false;
  }
}

// Determine user portal based on their roles
async function getUserPortal(userId: string): Promise<PortalType> {
  // Check roles in priority order: platform-admin > organization > individual
  const isPlatformAdmin = await checkUserRole(userId, 'platform_admin');
  if (isPlatformAdmin) {
    return 'platform-admin';
  }

  const isOrganization = await checkUserRole(userId, 'organization');
  if (isOrganization) {
    return 'organization';
  }

  // Default to individual
  return 'individual';
}

export async function middleware(request: NextRequest) {
  console.log('[middleware][DEBUG] ========== MIDDLEWARE START ==========');

  const { pathname, searchParams } = request.nextUrl;
  console.log('[middleware][DEBUG] Request details:');
  console.log('[middleware][DEBUG]   - URL:', request.url);
  console.log('[middleware][DEBUG]   - Method:', request.method);
  console.log('[middleware][DEBUG]   - Pathname:', pathname);
  console.log('[middleware][DEBUG]   - Search params:', Array.from(searchParams.entries()));
  console.log('[middleware][DEBUG]   - has login_challenge:', searchParams.has('login_challenge'));

  // Generate or reuse X-Request-ID for request tracing
  console.log('[middleware][DEBUG] Generating/reusing X-Request-ID...');
  const existingRequestId = request.headers.get(REQUEST_ID_HEADER);
  const requestId = existingRequestId || crypto.randomUUID();
  console.log('[middleware][DEBUG] Request ID:', requestId, existingRequestId ? '(existing)' : '(new)');

  // BFF Pattern: ตรวจสอบ session cookie (httpOnly, secure, sameSite=strict)
  console.log('[middleware][DEBUG] Checking for gov_iam_session cookie...');
  const sessionId = request.cookies.get('gov_iam_session')?.value;

  // Debug: List all cookies
  const allCookies = request.cookies.getAll();
  console.log('[middleware][DEBUG] All cookies present:', allCookies.map(c => c.name).join(', '));

  // Quick check: has session?
  const hasSession = !!sessionId;
  console.log('[middleware][DEBUG] Session cookie:', hasSession ? `Found (${sessionId?.substring(0, 20)}...)` : 'Not found');
  console.log('[middleware][DEBUG] hasSession:', hasSession);

  // Check if current path is protected
  console.log('[middleware][DEBUG] Checking if route is protected...');
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
  console.log('[middleware][DEBUG] Protected routes:', protectedRoutes);
  console.log('[middleware][DEBUG] isProtectedRoute:', isProtectedRoute);

  // Check if current path is an auth route (login/register)
  console.log('[middleware][DEBUG] Checking if route is auth route...');
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );
  console.log('[middleware][DEBUG] Auth routes:', authRoutes);
  console.log('[middleware][DEBUG] isAuthRoute:', isAuthRoute);

  // BYPASS AUTH: Skip authentication for local development wireframe review
  // TODO: Remove this bypass when done reviewing
  const bypassAuth = process.env.BYPASS_AUTH === 'true';

  // For protected routes, check if session cookie exists
  // NOTE: Full session validation happens in API routes (not in middleware)
  // because Edge Runtime doesn't support ioredis
  if (isProtectedRoute && !bypassAuth) {
    console.log('[middleware][DEBUG] Protected route detected!');
    if (!hasSession) {
      // No session cookie - redirect to OAuth
      console.log('[middleware][WARN] No session cookie found on protected route');
      console.log('[middleware][DEBUG] Redirecting to OAuth login...');
      const redirectResponse = createOAuthRedirectResponse(request, requestId);
      console.log('[middleware][DEBUG] Redirect URL:', redirectResponse.headers.get('location'));
      console.log('[middleware][DEBUG] ========== MIDDLEWARE END (OAuth redirect) ==========');
      return redirectResponse;
    }

    // Session cookie exists - let API routes handle validation
    // If session is invalid, API routes will return 401
    console.log('[middleware][SUCCESS] Session cookie found on protected route');
    console.log('[middleware][DEBUG] Proceeding to route (validation will happen in API routes)');
  }

  // Determine user's last portal from cookie (set by UserContextProvider)
  const portalCookie = request.cookies.get('excise_portal')?.value;
  const userPortal: PortalType = (portalCookie === 'organization' ? 'organization' : portalCookie === 'platform-admin' ? 'platform-admin' : 'individual');

  // Handle /auth/login without login_challenge - redirect to Hydra
  if (pathname === '/auth/login' && !searchParams.has('login_challenge')) {
    console.log('[middleware][DEBUG] /auth/login without login_challenge');
    if (hasSession) {
      console.log('[middleware][DEBUG] User already has session, redirecting to dashboard');
      const dashboardUrl = routes.dashboard(userPortal);
      console.log('[middleware][DEBUG] Dashboard URL:', dashboardUrl);
      const response = NextResponse.redirect(new URL(dashboardUrl, request.url));
      response.headers.set(REQUEST_ID_HEADER, requestId);
      console.log('[middleware][DEBUG] ========== MIDDLEWARE END (dashboard redirect) ==========');
      return response;
    }
    console.log('[middleware][DEBUG] No session, starting OAuth flow');
    // Start OAuth flow with proper state cookie
    const oauthResponse = createOAuthRedirectResponse(request, requestId);
    console.log('[middleware][DEBUG] OAuth URL:', oauthResponse.headers.get('location'));
    console.log('[middleware][DEBUG] ========== MIDDLEWARE END (OAuth flow) ==========');
    return oauthResponse;
  }

  // Redirect authenticated users away from auth routes to their portal
  if (isAuthRoute && hasSession && pathname !== '/auth/login') {
    console.log('[middleware][DEBUG] Authenticated user on auth route (not /auth/login)');
    console.log('[middleware][DEBUG] Redirecting to dashboard');
    const dashboardUrl = routes.dashboard(userPortal);
    console.log('[middleware][DEBUG] Dashboard URL:', dashboardUrl);
    const response = NextResponse.redirect(new URL(dashboardUrl, request.url));
    response.headers.set(REQUEST_ID_HEADER, requestId);
    console.log('[middleware][DEBUG] ========== MIDDLEWARE END (auth route redirect) ==========');
    return response;
  }

  // Continue with X-Request-ID header set
  console.log('[middleware][DEBUG] No special handling needed, proceeding to route');
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Set X-Request-ID on both request and response
  response.headers.set(REQUEST_ID_HEADER, requestId);
  console.log('[middleware][DEBUG] Set X-Request-ID header on response:', requestId);

  console.log('[middleware][DEBUG] ========== MIDDLEWARE END (proceed) ==========');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - includes /api/health)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
