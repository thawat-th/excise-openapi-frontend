import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

/**
 * GET /api/applications/[id]
 *
 * BFF: Get application details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokens = await getSessionTokens(request);
    if (!tokens) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(
      `${GOVERNANCE_API_URL}/v1/applications/${params.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': tokens.user_id || '',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(formatErrorForLogging(data, 'applications/detail'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Failed to fetch application',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data.data || data);
  } catch (error) {
    console.error('[applications/detail] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/applications/[id]
 *
 * BFF: Update application
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokens = await getSessionTokens(request);
    if (!tokens) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${GOVERNANCE_API_URL}/v1/applications/${params.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': tokens.user_id || '',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(formatErrorForLogging(data, 'applications/update'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Failed to update application',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data.data || data);
  } catch (error) {
    console.error('[applications/update] PATCH Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/applications/[id]
 *
 * BFF: Delete application (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokens = await getSessionTokens(request);
    if (!tokens) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(
      `${GOVERNANCE_API_URL}/v1/applications/${params.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': tokens.user_id || '',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(formatErrorForLogging(data, 'applications/delete'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Failed to delete application',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Application deleted' });
  } catch (error) {
    console.error('[applications/delete] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
