import { NextRequest } from 'next/server';
import { proxyPUT } from '@/lib/oathkeeper-proxy';

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the authenticated user
 *
 * This route proxies to Oathkeeper which:
 * 1. Validates Bearer token with Kratos
 * 2. Forwards request to backend with user headers
 */
export async function PUT(request: NextRequest) {
  return proxyPUT(request, '/v1/notifications/read-all');
}
