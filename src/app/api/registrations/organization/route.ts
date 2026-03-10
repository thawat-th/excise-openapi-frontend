import { NextRequest, NextResponse } from 'next/server';
import { proxyGET } from '@/lib/oathkeeper-proxy';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001/api';

/**
 * POST /api/registrations/organization
 * Create a new organization registration with file uploads (public, no auth)
 */
export async function POST(request: NextRequest) {
  try {
    // Get FormData from request (contains both JSON data and files)
    const formData = await request.formData();

    // Forward FormData directly to Go backend
    const response = await fetch(`${GOVERNANCE_API_URL}/v1/registrations/organization`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type - fetch will set multipart/form-data with boundary automatically
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'registrations/organization POST'));

      return NextResponse.json(
        {
          success: false,
          error: errorMessage || 'Failed to create registration',
          code: errorCode,
          trace_id: traceId
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[registrations/organization] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/registrations/organization
 * List all registrations (admin only)
 * 
 * This route proxies to Oathkeeper which:
 * 1. Validates Bearer token with Kratos
 * 2. Checks platform_admin permission with Keto
 * 3. Forwards request to backend with user headers
 */
export async function GET(request: NextRequest) {
  return proxyGET(request, '/v1/registrations/organization');
}
