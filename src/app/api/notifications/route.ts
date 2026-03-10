import { NextRequest } from 'next/server';
import { proxyGET } from '@/lib/oathkeeper-proxy';

/**
 * GET /api/notifications
 * List notifications for the authenticated user
 * 
 * This route proxies to Oathkeeper which:
 * 1. Validates Bearer token with Kratos
 * 2. Forwards request to backend with user headers
 */
export async function GET(request: NextRequest) {
  return proxyGET(request, '/v1/notifications');
}
