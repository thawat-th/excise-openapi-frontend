import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

/**
 * GET /api/applications/[id]/credentials
 *
 * BFF: List credentials for application
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
      `${GOVERNANCE_API_URL}/v1/applications/${params.id}/credentials`,
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
      console.error(formatErrorForLogging(data, 'applications/credentials'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Failed to fetch credentials',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      credentials: data.data || [],
    });
  } catch (error) {
    console.error('[applications/credentials] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/applications/[id]/credentials
 *
 * BFF: Create new credential for application
 */
export async function POST(
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
      `${GOVERNANCE_API_URL}/v1/applications/${params.id}/credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': tokens.user_id || '',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(formatErrorForLogging(data, 'applications/credentials'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Failed to create credential',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data.data || data, { status: 201 });
  } catch (error) {
    console.error('[applications/credentials] POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
