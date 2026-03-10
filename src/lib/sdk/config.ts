/**
 * SDK Configuration
 * Manages URLs and environment variables
 *
 * IMPORTANT: Variable naming convention
 * - NEXT_PUBLIC_* = CLIENT-SIDE (browser), baked into bundle
 * - *_INTERNAL_URL = SERVER-SIDE (API routes), Docker service names
 * - *_ADMIN_URL = SERVER-SIDE (API routes), Admin APIs
 */

// =============================================================================
// IDENTITY SERVICE (ORY Kratos)
// Function: User identity, authentication, self-service flows
// =============================================================================
// Default Identity service URLs for Kubernetes (k3d/k8s)
const DEFAULT_IDENTITY_INTERNAL_URL = 'http://excise-openapi-identity:4433';
const DEFAULT_IDENTITY_ADMIN_URL = 'http://excise-openapi-identity:4434';

export const IdentityService = {
  // PUBLIC URL: Used by browser to fetch identity flows
  // Goes through Kong Gateway for same-domain cookies (BFF Pattern)
  PUBLIC_URL: process.env.NEXT_PUBLIC_IDENTITY_URL ||
    (typeof window !== 'undefined' ? `${window.location.origin}/identity` : 'http://localhost:3000/identity'),

  // INTERNAL URL: Server-side only (API routes, server components)
  // Direct connection to identity service via Docker network
  // Note: Use 'identity' for Docker Compose, 'excise-openapi-identity' for Kubernetes
  INTERNAL_URL: process.env.IDENTITY_INTERNAL_URL || DEFAULT_IDENTITY_INTERNAL_URL,

  // ADMIN URL: Server-side only (API routes)
  // Admin API for identity management operations
  // Note: Use 'identity' for Docker Compose, 'excise-openapi-identity' for Kubernetes
  ADMIN_URL: process.env.IDENTITY_INTERNAL_ADMIN_URL || DEFAULT_IDENTITY_ADMIN_URL,
};

// Legacy alias for backward compatibility
export const KratosConfig = IdentityService;

// =============================================================================
// OAUTH2 SERVICE (ORY Hydra)
// Function: OAuth2/OIDC provider, token issuance, client management
// =============================================================================
// Default OAuth2 service URLs for Kubernetes (k3d/k8s)
const DEFAULT_OAUTH2_INTERNAL_URL = 'http://excise-openapi-oauth2:4444';
const DEFAULT_OAUTH2_ADMIN_URL = 'http://excise-openapi-oauth2:4445';

export const OAuth2Service = {
  // PUBLIC URL: Used by browser for OAuth2 flows
  // Goes through Kong Gateway (same domain as frontend)
  PUBLIC_URL: process.env.NEXT_PUBLIC_OAUTH_URL || 'http://localhost:8000/auth',

  // INTERNAL URL: Server-side only (API routes)
  // Direct connection to OAuth2 service via Docker network
  // Note: Use 'auth-server' for Docker Compose, 'excise-openapi-oauth2' for Kubernetes
  INTERNAL_URL: process.env.AUTH_INTERNAL_URL || DEFAULT_OAUTH2_INTERNAL_URL,

  // ADMIN URL: Server-side only (API routes)
  // Admin API for OAuth2 management (accept/reject consents, etc.)
  // Note: Use 'auth-server' for Docker Compose, 'excise-openapi-oauth2' for Kubernetes
  ADMIN_URL: process.env.AUTH_INTERNAL_ADMIN_URL || DEFAULT_OAUTH2_ADMIN_URL,

  // OAuth2 Client Configuration
  CLIENT_ID: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || '4a4ca1de-9f2e-49cf-8092-8130c62e8e2f',
  CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET || 'frontend-secret', // SERVER-SIDE ONLY - NEVER expose to browser

  // OAuth2 Scopes
  SCOPES: ['openid', 'profile', 'email'],

  // OAuth2 Endpoints
  TOKEN_ENDPOINT: `${process.env.NEXT_PUBLIC_OAUTH_URL || 'http://localhost:8000/auth'}/oauth2/token`,
  USERINFO_ENDPOINT: `${process.env.NEXT_PUBLIC_OAUTH_URL || 'http://localhost:8000/auth'}/userinfo`,
};

// Legacy alias for backward compatibility
export const HydraConfig = OAuth2Service;

// =============================================================================
// PERMISSION SERVICE (ORY Keto)
// Function: Fine-grained access control, RBAC + ReBAC
// =============================================================================
// Default Permission service URLs for Kubernetes (k3d/k8s)
const DEFAULT_PERMISSION_READ_URL = 'http://excise-openapi-permissions:4466';
const DEFAULT_PERMISSION_WRITE_URL = 'http://excise-openapi-permissions:4467';

export const PermissionService = {
  // READ URL: Server-side only (check permissions)
  // Note: Use 'permission' for Docker Compose, 'excise-openapi-permissions' for Kubernetes
  READ_URL: process.env.PERMISSION_INTERNAL_READ_URL || DEFAULT_PERMISSION_READ_URL,

  // WRITE URL: Server-side only (create/update/delete permissions)
  // Note: Use 'permission' for Docker Compose, 'excise-openapi-permissions' for Kubernetes
  WRITE_URL: process.env.PERMISSION_INTERNAL_WRITE_URL || DEFAULT_PERMISSION_WRITE_URL,
};

// =============================================================================
// PROXY SERVICE (ORY Oathkeeper)
// Function: Identity & Access Proxy, API Gateway authentication
// =============================================================================
// Default Proxy service URL for Kubernetes (k3d/k8s)
const DEFAULT_PROXY_URL = 'http://excise-openapi-proxy:4455';

export const ProxyService = {
  // INTERNAL URL: Server-side only (API routes)
  // Note: Use 'proxy' for Docker Compose, 'excise-openapi-proxy' for Kubernetes
  URL: process.env.PROXY_INTERNAL_URL || DEFAULT_PROXY_URL,
};

// =============================================================================
// APPLICATION CONFIG
// Frontend URLs, API Gateway, Environment flags
// =============================================================================
export const AppConfig = {
  // Frontend URLs (browser-accessible)
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  LOGIN_URL: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/login`,
  REGISTRATION_URL: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/register`,
  CONSENT_URL: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/consent`,
  LOGOUT_URL: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/logout`,
  CALLBACK_URL: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/callback`,
  DASHBOARD_URL: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/dashboard`,

  // API Gateway (Kong, browser-accessible)
  API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000',

  // Environment flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

/**
 * Validate that all required env vars are set
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_IDENTITY_URL && process.env.NODE_ENV === 'production') {
    errors.push('NEXT_PUBLIC_IDENTITY_URL is not set');
  }

  if (!process.env.NEXT_PUBLIC_OAUTH_URL && process.env.NODE_ENV === 'production') {
    errors.push('NEXT_PUBLIC_OAUTH_URL is not set');
  }

  if (!process.env.OAUTH_CLIENT_SECRET && process.env.NODE_ENV === 'production') {
    errors.push('OAUTH_CLIENT_SECRET is not set (required for token exchange)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
