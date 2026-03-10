import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://localhost:5001';

/**
 * GET /api/invitations?token=xxx
 *
 * Validate invitation token (public - no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const response = await fetch(
      `${GOVERNANCE_API_URL}/v1/invitations/${encodeURIComponent(token)}/validate`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(formatErrorForLogging(data, 'invitations/validate'));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || 'Invalid or expired invitation',
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      valid: true,
      token: data.data?.token || null,
      member: data.data?.member || null,
    });
  } catch (error) {
    console.error('[invitations/validate] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/invitations
 *
 * Accept or reject invitation (public - token-based auth)
 * Body: { token: string, action: 'accept' | 'reject' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action } = body;

    if (!token || !action) {
      return NextResponse.json({ error: 'Token and action are required' }, { status: 400 });
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json({ error: 'Action must be accept or reject' }, { status: 400 });
    }

    const endpoint = action === 'accept'
      ? `${GOVERNANCE_API_URL}/v1/invitations/accept`
      : `${GOVERNANCE_API_URL}/v1/invitations/reject`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(formatErrorForLogging(data, `invitations/${action}`));
      return NextResponse.json(
        {
          error: extractErrorMessage(data) || `Failed to ${action} invitation`,
          code: extractErrorCode(data),
          trace_id: extractTraceId(data),
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      member: data.data?.member || null,
      message: data.data?.message || null,
    });
  } catch (error) {
    console.error('[invitations/action] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
