import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

/**
 * GET /api/geo/districts/[code]/subdistricts
 * Proxy to governance service - Get subdistricts by district code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Validate district code format (4 digits)
    if (!/^\d{4}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Invalid district code format. Must be 4 digits.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${GOVERNANCE_API_URL}/v1/geo/districts/${code}/subdistricts`, {
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

      console.error(formatErrorForLogging(data, 'geo/districts/subdistricts'));

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
    console.error('[geo/districts/subdistricts] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subdistricts' },
      { status: 500 }
    );
  }
}
