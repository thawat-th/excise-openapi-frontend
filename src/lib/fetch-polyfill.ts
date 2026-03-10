/**
 * Fetch Polyfill for BFF Pattern
 * Automatically adds credentials: 'include' for all /api calls
 *
 * IMPORTANT: This must be imported in layout.tsx (root) BEFORE any other code
 */

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Only modify requests to /api/*
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (url.startsWith('/api')) {
      // Add credentials: 'include' if not already set
      const modifiedInit: RequestInit = {
        ...init,
        credentials: init?.credentials || 'include',
      };

      console.log('[fetch-polyfill] Auto-adding credentials to:', url);
      return originalFetch(input, modifiedInit);
    }

    // For non-API calls, use original fetch
    return originalFetch(input, init);
  };

  console.log('[fetch-polyfill]  Fetch polyfill installed - all /api calls will include credentials');
}
