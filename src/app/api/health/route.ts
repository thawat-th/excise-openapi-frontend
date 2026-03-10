import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for Docker healthcheck
 *
 * Returns 200 OK if the service is healthy
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'excise-frontend'
    },
    { status: 200 }
  );
}
