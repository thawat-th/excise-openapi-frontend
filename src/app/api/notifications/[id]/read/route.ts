import { NextRequest } from 'next/server';
import { proxyPUT } from '@/lib/oathkeeper-proxy';

/**
 * PUT /api/notifications/[id]/read
 * Mark a specific notification as read
 *
 * This route proxies to Oathkeeper which:
 * 1. Validates Bearer token with Kratos
 * 2. Forwards request to backend with user headers
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  return proxyPUT(request, `/v1/notifications/${id}/read`);
}
