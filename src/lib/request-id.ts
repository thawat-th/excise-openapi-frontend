/**
 * X-Request-ID helper functions for request tracing
 *
 * Usage:
 * - Server-side: Request ID is automatically set by middleware
 * - Client-side: Use getRequestId() to get from response header or generate new
 * - API calls: Use createRequestHeaders() to include X-Request-ID
 */

const REQUEST_ID_HEADER = 'X-Request-ID';

/**
 * Generate a new request ID (UUID v4)
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Get current request ID from document or generate new one
 * Note: In Next.js, the middleware sets X-Request-ID which can be accessed
 * via response headers on the client side
 */
export function getRequestId(): string {
  // Try to get from a meta tag if set by the server
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="x-request-id"]');
    if (meta) {
      return meta.getAttribute('content') || generateRequestId();
    }
  }

  // Generate a new one for client-side requests
  return generateRequestId();
}

/**
 * Create headers object with X-Request-ID for fetch requests
 * @param additionalHeaders - Additional headers to include
 * @param requestId - Optional specific request ID to use
 */
export function createRequestHeaders(
  additionalHeaders?: Record<string, string>,
  requestId?: string
): Headers {
  const headers = new Headers(additionalHeaders);
  headers.set(REQUEST_ID_HEADER, requestId || getRequestId());
  return headers;
}

/**
 * Wrapper for fetch that automatically includes X-Request-ID
 */
export async function fetchWithRequestId(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const requestId = getRequestId();

  const headers = new Headers(init?.headers);
  if (!headers.has(REQUEST_ID_HEADER)) {
    headers.set(REQUEST_ID_HEADER, requestId);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

/**
 * Extract request ID from response headers
 */
export function getRequestIdFromResponse(response: Response): string | null {
  return response.headers.get(REQUEST_ID_HEADER);
}
