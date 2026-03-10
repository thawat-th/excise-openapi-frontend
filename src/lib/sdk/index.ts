/**
 * ORY SDK Exports
 * Main entry point for all SDK functionality
 */

// Configuration
export * from './config';

// Type definitions
export type {
  // Kratos
  Identity,
  Session,
  AuthenticationMethod,
  VerifiableAddress,
  RecoveryAddress,
  LoginFlow,
  RegistrationFlow,
  RecoveryFlow,
  VerificationFlow,
  SettingsFlow,
  UiContainer,
  UiNode,
  UiNodeAttributes,
  UiNodeMeta,
  UiText,
  FlowSubmitPayload,
  KratosErrorResponse,
  GenericError,
  // Hydra
  OAuth2Client,
  TokenResponse,
  TokenInfo,
  Userinfo,
  LoginChallenge,
  ConsentChallenge,
  LogoutChallenge,
  // API
  ApiResponse,
  AuthError,
} from './types';

// Errors
export {
  AuthErrorBase,
  ApiError,
  FlowExpiredError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  SessionError,
  NetworkError,
  RecoveryError,
  VerificationError,
  AccountLinkingError,
  handleKratosError,
  getErrorMessage,
  getFieldErrors,
  isFlowExpired,
  isValidationError,
  isUnauthorized,
  isForbidden,
  isSessionError,
  isNetworkError,
} from './errors';

// Kratos SDK
export { kratos } from './kratos';

// Hydra SDK
export { hydra } from './hydra';

// Session management
export { sessionManager, validateServerSession } from './session';
export type { TokenStorage } from './session';
