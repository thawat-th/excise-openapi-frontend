import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

/**
 * POST /api/applications/[id]/credentials/[credentialId]/revoke
 *
 * BFF: Revoke a credential
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; credentialId: string } }
) {
  try {
    const tokens = await getSessionTokens(request);
    if (!tokens) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const response = await fetch(
      `${GOVERNANCE_API_URL}/v1/applications/${params.id}/credentials/${params.credentialId}/revoke`,
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
      console.error(formatErrorForLogging(data, 'applications/credentials/revoke'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Failed to revoke credential',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Credential revoked' });
  } catch (error) {
    console.error('[applications/credentials/revoke] POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
