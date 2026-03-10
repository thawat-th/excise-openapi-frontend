import { NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

/**
 * GET /api/occupations
 * Proxy to governance service - Get all occupations
 * Supports optional query params: major_group, search
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const majorGroup = searchParams.get('major_group');
    const search = searchParams.get('search');

    const params = new URLSearchParams();
    if (majorGroup) params.append('major_group', majorGroup);
    if (search) params.append('search', search);

    const queryString = params.toString();
    const url = `${GOVERNANCE_API_URL}/v1/occupations${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache', // Cache occupations as they rarely change
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = extractErrorMessage(data);
      const errorCode = extractErrorCode(data);
      const traceId = extractTraceId(data);

      console.error(formatErrorForLogging(data, 'occupations'));

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: errorCode,
          trace_id: traceId
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[occupations] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch occupations' },
      { status: 500 }
    );
  }
}
