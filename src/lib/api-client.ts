/**
 * API Client Helper
 * Wrapper around fetch that automatically includes credentials for BFF Pattern
 */

/**
 * Fetch wrapper that automatically includes credentials
 * Use this for all API calls to ensure cookies are sent
 */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include', // Always include credentials (httpOnly cookies)
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

/**
 * POST with JSON body
 */
export async function apiPost(url: string, body?: any, options?: RequestInit): Promise<Response> {
  return apiFetch(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}

/**
 * PUT with JSON body
 */
export async function apiPut(url: string, body?: any, options?: RequestInit): Promise<Response> {
  return apiFetch(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}

/**
 * DELETE request
 */
export async function apiDelete(url: string, options?: RequestInit): Promise<Response> {
  return apiFetch(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Upload file (multipart/form-data)
 */
export async function apiUpload(url: string, formData: FormData, options?: RequestInit): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    ...options,
    headers: {
      // Don't set Content-Type for FormData - browser sets it automatically with boundary
      ...options?.headers,
    },
  });
}
