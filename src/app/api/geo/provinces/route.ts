import { NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

/**
 * GET /api/geo/provinces
 * Proxy to governance service - Get all provinces
 */
export async function GET() {
  try {
    const response = await fetch(`${GOVERNANCE_API_URL}/v1/geo/provinces`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache', // Cache provinces as they rarely change
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'geo/provinces'));

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

    return NextResponse.json(data);
  } catch (error) {
    console.error('[geo/provinces] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}
