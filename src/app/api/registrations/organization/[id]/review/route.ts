import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

/**
 * PUT /api/registrations/organization/[id]/review
 * Update registration status (admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${GOVERNANCE_API_URL}/v1/registrations/organization/${id}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'registrations/organization/[id]/review'));

      return NextResponse.json(
        {
          success: false,
          error: errorMessage || 'Failed to update registration status',
          code: errorCode,
          trace_id: traceId
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[registrations/organization/[id]/review] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update registration status' },
      { status: 500 }
    );
  }
}
