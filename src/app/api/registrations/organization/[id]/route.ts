import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

/**
 * GET /api/registrations/organization/[id]
 * Get registration detail by ID (admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(`${GOVERNANCE_API_URL}/v1/registrations/organization/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'registrations/organization/[id]'));

      return NextResponse.json(
        {
          success: false,
          error: errorMessage || 'Failed to fetch registration detail',
          code: errorCode,
          trace_id: traceId
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[registrations/organization/[id]] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration detail' },
      { status: 500 }
    );
  }
}
