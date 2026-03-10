/**
 * Centralized Fetch Helper with Error Handling
 *
 * Features:
 * - 401 auto-redirect to login
 * - Detailed error logging (Java-style stack trace)
 * - DEBUG/WARN/ERROR/SUCCESS logs
 * - Automatic error body capture
 */

export interface FetchOptions extends RequestInit {
  /** Context name for logging (e.g., 'sessions', 'account') */
  context?: string;
}

export interface FetchResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Enhanced fetch with automatic 401 handling and detailed logging
 *
 * @param url - API endpoint URL
 * @param options - Fetch options with optional context
 * @returns Promise<Response> - Throws on error for try-catch handling
 */
export async function fetchWithLogging(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { context = 'api', ...fetchOptions } = options;

  console.log(`[${context}][DEBUG] Fetching from ${url}`);
  if (fetchOptions.method && fetchOptions.method !== 'GET') {
    console.log(`[${context}][DEBUG] Method: ${fetchOptions.method}`);
  }

  const response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized - session expired or not logged in
  if (response.status === 401) {
    console.warn(`[${context}][WARN] 401 Unauthorized - redirecting to login`);
    const responseText = await response.clone().text();
    console.warn(`[${context}][WARN] Response:`, responseText);
    window.location.href = '/auth/login';
    throw new Error('Unauthorized');
  }

  // Log non-OK responses with details
  if (!response.ok) {
    const errorBody = await response.clone().text();
    const error = new Error(`API Error: ${response.status} ${response.statusText}`);

    console.error(`[${context}][ERROR] API returned error status`);
    console.error(`[${context}][ERROR] URL:`, url);
    console.error(`[${context}][ERROR] Status:`, response.status);
    console.error(`[${context}][ERROR] Status Text:`, response.statusText);
    console.error(`[${context}][ERROR] Response Body:`, errorBody);
    console.error(`[${context}][ERROR] Stack trace:`, error.stack);

    throw error;
  }

  // Success
  console.log(`[${context}][SUCCESS] Request successful (${response.status})`);
  return response;
}

/**
 * Fetch JSON data with automatic error handling
 *
 * @param url - API endpoint URL
 * @param options - Fetch options with optional context
 * @returns FetchResult<T> - Never throws, returns { success, data?, error? }
 */
export async function fetchJSON<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const { context = 'api', ...fetchOptions } = options;

  try {
    const response = await fetchWithLogging(url, { context, ...fetchOptions });
    const data = await response.json();

    console.log(`[${context}][SUCCESS] Parsed JSON response`);
    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (err) {
    console.error(`[${context}][ERROR] Fetch failed:`, url);
    console.error(`[${context}][ERROR] Type: ${err instanceof Error ? err.constructor.name : typeof err}`);
    console.error(`[${context}][ERROR] Message: ${err instanceof Error ? err.message : String(err)}`);

    if (err instanceof Error && err.stack) {
      console.error(`[${context}][ERROR] Stack:`, err.stack);
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Fetch with automatic try-catch and error callback
 *
 * Usage:
 * ```ts
 * await safeFetch('/api/sessions', {
 *   context: 'sessions',
 *   onSuccess: (data) => setSessions(data.sessions),
 *   onError: (error) => setError(error),
 * });
 * ```
 */
export async function safeFetch<T = any>(
  url: string,
  options: FetchOptions & {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
): Promise<void> {
  const { onSuccess, onError, ...fetchOptions } = options;

  const result = await fetchJSON<T>(url, fetchOptions);

  if (result.success && result.data) {
    onSuccess?.(result.data);
  } else {
    onError?.(result.error || 'Unknown error');
  }
}

/**
 * API Helper Functions - REST Methods
 */

/**
 * GET request
 */
export async function apiGet<T = any>(
  url: string,
  context?: string
): Promise<FetchResult<T>> {
  return fetchJSON<T>(url, { context, method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  context?: string
): Promise<FetchResult<T>> {
  return fetchJSON<T>(url, {
    context,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  url: string,
  body?: any,
  context?: string
): Promise<FetchResult<T>> {
  return fetchJSON<T>(url, {
    context,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  url: string,
  context?: string
): Promise<FetchResult<T>> {
  return fetchJSON<T>(url, { context, method: 'DELETE' });
}
