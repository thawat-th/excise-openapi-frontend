/**
 * API Error Handler for Governance Service
 *
 * Handles both old (string) and new (object) error response formats
 * from the API Governance Service.
 *
 * Old format: { success: false, error: "Error message" }
 * New format: { success: false, error: { code: "...", message: "...", trace_id: "..." } }
 */

export interface GovernanceServiceErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
  trace_id: string;
  timestamp: string;
  documentation_url?: string;
}

export interface GovernanceServiceResponse {
  success: boolean;
  data?: any;
  error?: GovernanceServiceErrorDetail | string; // Support both old and new format
  message?: string;
}

/**
 * Extracts error message from API response
 * Supports both old (string) and new (object) error formats
 */
export function extractErrorMessage(response: GovernanceServiceResponse): string {
  if (!response.error) {
    return 'Unknown error';
  }

  if (typeof response.error === 'object') {
    return response.error.message;
  }

  return response.error;
}

/**
 * Extracts error code from API response
 * Returns undefined for old format (string errors)
 */
export function extractErrorCode(response: GovernanceServiceResponse): string | undefined {
  if (typeof response.error === 'object') {
    return response.error.code;
  }
  return undefined;
}

/**
 * Extracts trace ID from API response for debugging
 * Returns undefined for old format (string errors)
 */
export function extractTraceId(response: GovernanceServiceResponse): string | undefined {
  if (typeof response.error === 'object') {
    return response.error.trace_id;
  }
  return undefined;
}

/**
 * Extracts error details from API response
 * Returns undefined for old format or if no details available
 */
export function extractErrorDetails(response: GovernanceServiceResponse): Record<string, any> | undefined {
  if (typeof response.error === 'object') {
    return response.error.details;
  }
  return undefined;
}

/**
 * Checks if error is a specific error code
 */
export function isErrorCode(response: GovernanceServiceResponse, code: string): boolean {
  const errorCode = extractErrorCode(response);
  return errorCode === code;
}

/**
 * Checks if error is a rate limit error
 */
export function isRateLimitError(response: GovernanceServiceResponse): boolean {
  return isErrorCode(response, 'RATE_LIMIT_EXCEEDED');
}

/**
 * Checks if error is a validation error
 */
export function isValidationError(response: GovernanceServiceResponse): boolean {
  return isErrorCode(response, 'VALIDATION_ERROR');
}

/**
 * Checks if error is an unauthorized error
 */
export function isUnauthorizedError(response: GovernanceServiceResponse): boolean {
  return isErrorCode(response, 'UNAUTHORIZED');
}

/**
 * Format error for logging with trace ID
 */
export function formatErrorForLogging(response: GovernanceServiceResponse, context?: string): string {
  const message = extractErrorMessage(response);
  const code = extractErrorCode(response);
  const traceId = extractTraceId(response);

  let logMessage = context ? `[${context}] ` : '';
  logMessage += message;

  if (code) {
    logMessage += ` (code: ${code})`;
  }

  if (traceId) {
    logMessage += ` [trace_id: ${traceId}]`;
  }

  return logMessage;
}
