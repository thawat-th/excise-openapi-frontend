import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

/**
 * GET /api/geo/subdistricts/[code]/postalcode
 * Proxy to governance service - Get postal code by subdistrict code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Validate subdistrict code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subdistrict code format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${GOVERNANCE_API_URL}/v1/geo/subdistricts/${code}/postalcode`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'geo/subdistricts/postalcode'));

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: errorCode,
          trace_id: traceId
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[geo/subdistricts/postalcode] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch postal code' },
      { status: 500 }
    );
  }
}
