import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest } from 'next/server';

const PROXY_INTERNAL_URL = process.env.PROXY_INTERNAL_URL || 'http://proxy:4455';

/**
 * GET /api/notifications/stream
 *
 * SSE (Server-Sent Events) proxy endpoint for real-time notifications
 *
 * This endpoint:
 * 1. Extracts session token from httpOnly cookie
 * 2. Forwards request to Oathkeeper with Bearer token
 * 3. Streams response back to client
 *
 * Client usage:
 *   const eventSource = new EventSource('/api/notifications/stream', {
 *     withCredentials: true
 *   });
 */
export async function GET(request: NextRequest) {
  // Extract session token from cookie
  const sessionToken = await getKratosSessionToken(request);

  if (!sessionToken) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: No session token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Forward request to Oathkeeper with Bearer token
    const response = await fetch(`${PROXY_INTERNAL_URL}/api/v1/notifications/stream`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Accept': 'text/event-stream',
      },
      // Important: Don't set a timeout - SSE connections are long-lived
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Backend error: ${response.status}` }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Stream the response body back to the client
    // This maintains the SSE connection
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });

  } catch (error) {
    console.error('[SSE Proxy] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to connect to notification stream' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
