import { NextRequest } from 'next/server';
import { proxyDELETE } from '@/lib/oathkeeper-proxy';

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 *
 * This route proxies to Oathkeeper which:
 * 1. Validates Bearer token with Kratos
 * 2. Forwards request to backend with user headers
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  return proxyDELETE(request, `/v1/notifications/${id}`);
}
