import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

/**
 * GET /api/registrations/organization/track/[code]
 * Get registration by tracking code (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const response = await fetch(`${GOVERNANCE_API_URL}/v1/registrations/organization/track/${code}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'registrations/organization/track'));

      return NextResponse.json(
        {
          success: false,
          error: errorMessage || 'Failed to get registration status',
          code: errorCode,
          trace_id: traceId
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[registrations/organization/track/[code]] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get registration status' },
      { status: 500 }
    );
  }
}
