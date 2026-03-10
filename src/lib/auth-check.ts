/**
 * Auth Helper for API Routes
 * ใช้ตรวจสอบ authentication และ return fallback/error ถ้าไม่มี session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getKratosSessionToken } from './session-helpers';

/**
 * Check if user is authenticated (has access token)
 * Returns null if authenticated, NextResponse with error/fallback if not
 */
export async function checkAuth(request: NextRequest, options?: {
  allowFallback?: boolean;
  fallbackData?: any;
}): Promise<{ accessToken: string; error: null } | { accessToken: null; error: NextResponse }> {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    console.warn('[checkAuth] No access token found');

    // Check if running in standalone dev mode vs Docker production
    const isStandaloneDev = process.env.NODE_ENV !== 'production';

    if (isStandaloneDev && options?.allowFallback) {
      console.warn('[checkAuth] Standalone dev mode - returning fallback data');
      return {
        accessToken: null,
        error: NextResponse.json(options.fallbackData || { data: null })
      };
    }

    // Production/Docker: Return 401
    console.warn('[checkAuth] Production mode - session expired');
    return {
      accessToken: null,
      error: NextResponse.json(
        { error: 'Session expired. Please login again.' },
        { status: 401 }
      )
    };
  }

  return { accessToken, error: null };
}

/**
 * Check if user has Kratos session token (for backend API calls via Oathkeeper)
 * Returns null if authenticated, NextResponse with error/fallback if not
 */
export async function checkKratosSession(request: NextRequest, options?: {
  allowFallback?: boolean;
  fallbackData?: any;
}): Promise<{ sessionToken: string; error: null } | { sessionToken: null; error: NextResponse }> {
  const sessionToken = await getKratosSessionToken(request);

  if (!sessionToken) {
    console.warn('[checkKratosSession] No Kratos session token found');

    const isStandaloneDev = process.env.NODE_ENV !== 'production';

    if (isStandaloneDev && options?.allowFallback) {
      console.warn('[checkKratosSession] Standalone dev mode - returning fallback data');
      return {
        sessionToken: null,
        error: NextResponse.json(options.fallbackData || { data: null })
      };
    }

    // Production/Docker: Return 401
    return {
      sessionToken: null,
      error: NextResponse.json(
        { error: 'Session expired. Please login again.' },
        { status: 401 }
      )
    };
  }

  return { sessionToken, error: null };
}
