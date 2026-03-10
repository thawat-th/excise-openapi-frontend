import { NextRequest, NextResponse } from 'next/server';
import { getKratosSessionToken } from './session-helpers';

const PROXY_INTERNAL_URL = process.env.PROXY_INTERNAL_URL || 'http://proxy:4455';

/**
 * Proxy request to Oathkeeper with session token as Bearer token
 *
 * BFF Pattern: Get Kratos session token from server-side session store
 *
 * @param request - Next.js request object
 * @param path - Backend API path (e.g., '/v1/registrations/organization')
 * @param options - Additional fetch options
 * @returns NextResponse with backend data or error
 */
export async function proxyToOathkeeper(
  request: NextRequest,
  path: string,
  options: RequestInit = {}
): Promise<NextResponse> {
  try {
    // BFF Pattern: Get Kratos session token from server-side session store
    const sessionToken = await getKratosSessionToken(request);

    if (!sessionToken) {
      console.warn('[proxyToOathkeeper] No Kratos session token found');
      console.warn('[proxyToOathkeeper] This is expected in local dev due to cookie domain mismatch');

      // Local dev fallback: Return empty data for GET requests
      if (request.method === 'GET') {
        console.warn('[proxyToOathkeeper] Returning empty data for local dev');

        // Return appropriate empty responses based on endpoint
        if (path.includes('/notifications/unread/count')) {
          return NextResponse.json({ success: true, data: { count: 0 } });
        } else if (path.includes('/notifications')) {
          return NextResponse.json({
            success: true,
            data: {
              notifications: [],
              total: 0,
              page: 1,
              page_size: 10
            }
          });
        }

        // Default empty response
        return NextResponse.json({ success: true, data: [] });
      }

      // For POST/PUT/DELETE, still return 401
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No session token' },
        { status: 401 }
      );
    }

    // Build full URL with query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    const url = `${PROXY_INTERNAL_URL}/api${fullPath}`;

    // Forward request to Oathkeeper with Bearer token
    const response = await fetch(url, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${sessionToken}`,  // ← Key change: Bearer token instead of cookie
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body,
      ...options,
    });

    // Get response data
    const data = await response.json();

    // Return with same status code
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('[proxyToOathkeeper] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Proxy GET request to Oathkeeper
 */
export async function proxyGET(request: NextRequest, path: string): Promise<NextResponse> {
  return proxyToOathkeeper(request, path, { method: 'GET' });
}

/**
 * Proxy POST request to Oathkeeper
 */
export async function proxyPOST(request: NextRequest, path: string): Promise<NextResponse> {
  const body = await request.text();
  return proxyToOathkeeper(request, path, { method: 'POST', body });
}

/**
 * Proxy PUT request to Oathkeeper
 */
export async function proxyPUT(request: NextRequest, path: string): Promise<NextResponse> {
  const body = await request.text();
  return proxyToOathkeeper(request, path, { method: 'PUT', body });
}

/**
 * Proxy DELETE request to Oathkeeper
 */
export async function proxyDELETE(request: NextRequest, path: string): Promise<NextResponse> {
  return proxyToOathkeeper(request, path, { method: 'DELETE' });
}
