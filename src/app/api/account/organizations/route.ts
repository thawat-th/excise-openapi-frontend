import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/session-helpers';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    // Get access token from session
    const accessToken = await getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Call backend API to get user's organizations
    const response = await fetch(`${GOVERNANCE_API_URL}/v1/profiles/organizations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'account/organizations'));

      return NextResponse.json(
        {
          error: errorMessage || 'Failed to fetch organizations',
          code: errorCode,
          trace_id: traceId
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      organizations: data.data || [],
      count: data.count || 0,
    });
  } catch (error) {
    console.error('[organizations] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
