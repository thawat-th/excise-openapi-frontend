/**
 * Typed Error Classes for ORY SDK
 * Provides proper error handling and context
 */

import { KratosErrorResponse, GenericError, AuthError } from './types';

/**
 * Base error class for all auth errors
 */
export class AuthErrorBase extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, any>,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Kratos/Hydra API returned an error
 */
export class ApiError extends AuthErrorBase {
  constructor(statusCode: number, message: string, details?: Record<string, any>) {
    super('api_error', statusCode, message, details);
  }
}

/**
 * Flow expired or not found
 */
export class FlowExpiredError extends AuthErrorBase {
  constructor(flowId?: string) {
    super(
      'flow_expired',
      410,
      `Authentication flow expired or not found${flowId ? ` (${flowId})` : ''}. Please try again.`,
    );
  }
}

/**
 * Invalid flow submission (validation errors)
 */
export class ValidationError extends AuthErrorBase {
  constructor(
    message: string,
    public fieldErrors: Record<string, string> = {},
  ) {
    super('validation_error', 400, message, {}, fieldErrors);
  }
}

/**
 * User is not authenticated
 */
export class UnauthorizedError extends AuthErrorBase {
  constructor(message: string = 'Not authenticated') {
    super('unauthorized', 401, message);
  }
}

/**
 * User doesn't have permission
 */
export class ForbiddenError extends AuthErrorBase {
  constructor(message: string = 'Access denied') {
    super('forbidden', 403, message);
  }
}

/**
 * Session is invalid or expired
 */
export class SessionError extends AuthErrorBase {
  constructor(message: string = 'Session invalid or expired') {
    super('session_error', 401, message);
  }
}

/**
 * Network or connection error
 */
export class NetworkError extends AuthErrorBase {
  constructor(message: string = 'Network request failed') {
    super('network_error', 0, message);
  }
}

/**
 * Recovery flow specific errors
 */
export class RecoveryError extends AuthErrorBase {
  constructor(message: string) {
    super('recovery_error', 400, message);
  }
}

/**
 * Verification flow specific errors
 */
export class VerificationError extends AuthErrorBase {
  constructor(message: string) {
    super('verification_error', 400, message);
  }
}

/**
 * Account linking errors
 * v25.4.0: Failed account linking now returns 400 (was 200 in earlier versions)
 */
export class AccountLinkingError extends AuthErrorBase {
  constructor(message: string = 'Failed to link account. Account may already be linked.') {
    super('account_linking_error', 400, message);
  }
}

/**
 * Parse Kratos/Hydra error response and throw appropriate error
 */
export function handleKratosError(response: any, fallbackMessage: string = 'An error occurred'): never {
  if (!response) {
    throw new ApiError(500, fallbackMessage);
  }

  // Handle Kratos error format
  const kratosError = (response as KratosErrorResponse).error;
  if (kratosError) {
    const message = kratosError.message || kratosError.reason || fallbackMessage;
    const statusCode = kratosError.code || response.status || 400;

    // Check for specific error types
    if (kratosError.id === 'self_service_flow_expired') {
      throw new FlowExpiredError();
    }

    if (kratosError.id === 'self_service_flow_token_invalid') {
      throw new FlowExpiredError();
    }

    if (kratosError.id === 'session_inactive') {
      throw new SessionError('Your session has expired. Please log in again.');
    }

    // v25.4.0: Account linking errors
    if (kratosError.id === 'self_service_link_account_error' || statusCode === 400 && fallbackMessage.includes('link')) {
      throw new AccountLinkingError(message);
    }

    // Extract field-level validation errors
    const fieldErrors: Record<string, string> = {};
    if (kratosError.details?.form?.nodes) {
      for (const node of kratosError.details.form.nodes) {
        if (node.messages) {
          for (const msg of node.messages) {
            fieldErrors[node.attributes?.name] = msg.text;
          }
        }
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(message, fieldErrors);
    }

    throw new ApiError(statusCode, message, kratosError.details);
  }

  // Handle generic error format
  const genericError = (response as GenericError).error;
  if (genericError) {
    throw new ApiError(500, genericError.message || fallbackMessage, {
      id: genericError.id,
      reason: genericError.reason,
    });
  }

  // Fallback for unknown error format
  throw new ApiError(response.status || 500, fallbackMessage);
}

/**
 * Convert error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AuthErrorBase) {
    switch (error.code) {
      case 'flow_expired':
        return 'Your session expired. Please start over.';
      case 'validation_error':
        return error.message;
      case 'unauthorized':
        return 'Please log in to continue.';
      case 'forbidden':
        return 'You do not have permission to perform this action.';
      case 'session_error':
        return 'Your session is invalid. Please log in again.';
      case 'network_error':
        return 'Network error. Please check your connection and try again.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

/**
 * Convert field errors to user-friendly format
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ValidationError) {
    return error.fieldErrors || {};
  }
  if (error instanceof AuthErrorBase && error.fieldErrors) {
    return error.fieldErrors;
  }
  return {};
}

/**
 * Check if error is a specific type
 */
export const isFlowExpired = (error: unknown): error is FlowExpiredError =>
  error instanceof FlowExpiredError;

export const isValidationError = (error: unknown): error is ValidationError =>
  error instanceof ValidationError;

export const isUnauthorized = (error: unknown): error is UnauthorizedError =>
  error instanceof UnauthorizedError;

export const isForbidden = (error: unknown): error is ForbiddenError =>
  error instanceof ForbiddenError;

export const isSessionError = (error: unknown): error is SessionError =>
  error instanceof SessionError;

export const isNetworkError = (error: unknown): error is NetworkError =>
  error instanceof NetworkError;
