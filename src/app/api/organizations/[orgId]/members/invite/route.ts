import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

/**
 * POST /api/organizations/[orgId]/members/invite
 *
 * BFF: ส่งคำเชิญสมาชิกใหม่เข้าร่วมองค์กร
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const tokens = await getSessionTokens(request);
    if (!tokens) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${GOVERNANCE_API_URL}/v1/organizations/${params.orgId}/members/invite`,
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
      console.error(formatErrorForLogging(data, 'organizations/members/invite'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Failed to send invitation',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      member: data.data?.member || null,
    });
  } catch (error) {
    console.error('[organizations/members/invite] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
