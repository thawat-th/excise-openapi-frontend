import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

/**
 * GET /api/admin/statistics
 *
 * BFF Pattern: ดึง platform statistics จาก Go backend (GET /v1/admin/statistics)
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

    const response = await fetch(`${GOVERNANCE_API_URL}/v1/admin/statistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': tokens.user_id || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || 'Failed to fetch statistics' },
        { status: response.status }
      );
    }

    return NextResponse.json(data.data || {});
  } catch (error) {
    console.error('[admin/statistics] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
