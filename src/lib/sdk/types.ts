/**
 * ORY Kratos & Hydra Type Definitions
 * Aligned with official ORY SDKs
 */

// ═══════════════════════════════════════════════════════════════════════════
// KRATOS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Identity {
  id: string;
  schema_id: string;
  schema_url: string;
  state: string;
  state_changed_at: string;
  traits: {
    email: string;
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  };
  verifiable_addresses?: VerifiableAddress[];
  recovery_addresses?: RecoveryAddress[];
  metadata_public?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  identity: Identity;
  expires_at: string;
  authenticated_at: string;
  authenticator_assurance_level: string;
  authentication_methods: AuthenticationMethod[];
  issued_at: string;
}

export interface AuthenticationMethod {
  method: string;
  aal: string;
  completed_at: string;
}

export interface VerifiableAddress {
  id: string;
  value: string;
  verified: boolean;
  via: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RecoveryAddress {
  id: string;
  value: string;
  via: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// KRATOS FLOWS
// ═══════════════════════════════════════════════════════════════════════════

export interface LoginFlow {
  id: string;
  type: 'browser' | 'api';
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UiContainer;
  created_at: string;
  updated_at: string;
  refresh: boolean;
  requested_aal: string;
}

export interface RegistrationFlow {
  id: string;
  type: 'browser' | 'api';
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UiContainer;
  created_at: string;
  updated_at: string;
}

export interface RecoveryFlow {
  id: string;
  type: 'browser' | 'api';
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UiContainer;
  state: 'choose_method' | 'sent_email';
  active: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationFlow {
  id: string;
  type: 'browser' | 'api';
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UiContainer;
  state: 'choose_method' | 'sent_email';
  active: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsFlow {
  id: string;
  type: 'browser' | 'api';
  expires_at: string;
  issued_at: string;
  request_url: string;
  ui: UiContainer;
  identity: Identity;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface UiContainer {
  action: string;
  method: string;
  nodes: UiNode[];
  messages?: UiText[];
}

export interface UiNode {
  type: 'input' | 'img' | 'text' | 'script';
  group: string;
  attributes: UiNodeAttributes;
  messages?: UiText[];
  meta?: UiNodeMeta;
}

export interface UiNodeAttributes {
  name: string;
  type: string;
  value?: string | number | boolean;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  placeholder?: string;
  pattern?: string;
  title?: string;
  minlength?: number;
  maxlength?: number;
  node_type?: string;
  src?: string;
  id?: string;
  script?: string;
  async?: boolean;
  crossorigin?: string;
}

export interface UiNodeMeta {
  label?: UiText;
}

export interface UiText {
  id: number;
  text: string;
  type: 'info' | 'error' | 'success' | 'warn';
  context?: Record<string, any>;
}

export interface FlowSubmitPayload {
  [key: string]: string | number | boolean | undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// KRATOS API RESPONSES
// ═══════════════════════════════════════════════════════════════════════════

export interface KratosErrorResponse {
  error: {
    id: string;
    code: number;
    status: string;
    reason: string;
    message: string;
    debug?: string;
    details?: Record<string, any>;
  };
  flow_id?: string;
  expires_at?: string;
}

export interface GenericError {
  error: {
    id: string;
    code?: number;
    status?: string;
    reason?: string;
    message: string;
    debug?: string;
    details?: Record<string, any>;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HYDRA TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface OAuth2Client {
  client_id: string;
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
  redirect_uris?: string[];
  response_types?: string[];
  grant_types?: string[];
  scope?: string;
  contacts?: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope: string;
}

export interface TokenInfo {
  active: boolean;
  scope?: string;
  client_id?: string;
  username?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  iss?: string;
  aud?: string[];
}

export interface Userinfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  updated_at?: number;
  [key: string]: any;
}

// ═══════════════════════════════════════════════════════════════════════════
// HYDRA LOGIN/CONSENT CHALLENGES (from browser flow)
// ═══════════════════════════════════════════════════════════════════════════

export interface LoginChallenge {
  challenge: string;
  client: OAuth2Client;
  oidc_context?: {
    id_token_hint_claims?: Record<string, any>;
  };
  request_url: string;
  requested_access_token_audience?: string[];
  requested_scope?: string[];
  session_id?: string;
  skip: boolean;
  subject?: string;
}

export interface ConsentChallenge {
  challenge: string;
  client: OAuth2Client;
  context?: Record<string, any>;
  login_challenge?: string;
  login_session_id?: string;
  oidc_context?: {
    id_token_hint_claims?: Record<string, any>;
    acr_values?: string[];
    display?: string;
    id_token_hint?: string;
    login_hint?: string;
    ui_locales?: string[];
  };
  request_url: string;
  requested_access_token_audience?: string[];
  requested_scope: string[];
  skip: boolean;
  subject: string;
}

export interface LogoutChallenge {
  challenge: string;
  request_url: string;
  rp_initiated: boolean;
  sid: string;
  subject: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSE WRAPPERS
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    id: string;
    message: string;
    statusCode: number;
  };
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: KratosErrorResponse | GenericError };

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AuthError {
  code: string;
  statusCode: number;
  message: string;
  details?: Record<string, any>;
  fieldErrors?: Record<string, string>;
}
