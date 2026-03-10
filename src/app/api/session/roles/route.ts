import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

/**
 * GET /api/session/roles
 *
 * BFF Pattern: ดึง user roles จาก Go backend (GET /v1/session/roles)
 *
 * Response:
 * - is_individual: boolean
 * - is_org_member: boolean
 * - is_platform_admin: boolean
 * - individual_profile: object (if exists)
 * - organizations: OrganizationMembership[] (if org member)
 */
export async function GET(request: NextRequest) {
  try {
    const tokens = await getSessionTokens(request);
    if (!tokens) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const response = await fetch(`${GOVERNANCE_API_URL}/v1/session/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': tokens.user_id || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'session/roles'));

      return NextResponse.json(
        {
          error: errorMessage || 'Failed to fetch user roles',
          code: errorCode,
          trace_id: traceId,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data.data || {});
  } catch (error) {
    console.error('[session/roles] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
