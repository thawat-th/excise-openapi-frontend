import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

/**
 * GET /api/organizations/[orgId]/members
 *
 * BFF: ดึงรายชื่อสมาชิกในองค์กร
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const tokens = await getSessionTokens(request);
    if (!tokens) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(
      `${GOVERNANCE_API_URL}/v1/organizations/${params.orgId}/members`,
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
      console.error(formatErrorForLogging(data, 'organizations/members'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Failed to fetch members',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      members: data.data?.members || data.data || [],
    });
  } catch (error) {
    console.error('[organizations/members] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
