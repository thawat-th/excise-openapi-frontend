/**
 * ORY Hydra SDK
 * Handles OAuth2/OIDC flows (authorization, token exchange, token validation)
 */

import axios, { AxiosInstance } from 'axios';
import {
  LoginChallenge,
  ConsentChallenge,
  LogoutChallenge,
  TokenResponse,
  TokenInfo,
  Userinfo,
  OAuth2Client,
} from './types';
import { HydraConfig, AppConfig } from './config';
import { handleKratosError } from './errors';

/**
 * ORY Hydra Client
 * Handles OAuth2/OIDC flows
 */
class HydraClient {
  private publicClient: AxiosInstance;
  private adminClient: AxiosInstance;

  constructor() {
    // Public client - used by browser for authorization/token endpoints
    this.publicClient = axios.create({
      baseURL: HydraConfig.PUBLIC_URL,
      withCredentials: false,
    });

    // Admin client - used by server for login/consent/logout challenges
    this.adminClient = axios.create({
      baseURL: HydraConfig.ADMIN_URL,
      withCredentials: false,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHORIZATION FLOW (OAuth2/OIDC)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Build authorization URL
   * Browser redirects to Hydra with this URL to start OAuth2 flow
   * Hydra validates and redirects to login_uri (our login page)
   */
  getAuthorizationUrl(
    clientId: string = HydraConfig.CLIENT_ID,
    redirectUri: string = AppConfig.CALLBACK_URL,
    scopes: string[] = HydraConfig.SCOPES,
    state?: string,
  ): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
    });

    if (state) {
      params.append('state', state);
    }

    return `${HydraConfig.PUBLIC_URL}/oauth2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   * Called server-side after user is redirected back with code
   * POST /oauth2/token
   */
  async exchangeCodeForToken(
    code: string,
    redirectUri: string = AppConfig.CALLBACK_URL,
    codeVerifier?: string,
  ): Promise<TokenResponse> {
    try {
      const payload = {
        grant_type: 'authorization_code',
        code: code,
        client_id: HydraConfig.CLIENT_ID,
        client_secret: HydraConfig.CLIENT_SECRET,
        redirect_uri: redirectUri,
      };

      // Add PKCE if code_verifier is provided
      if (codeVerifier) {
        (payload as any).code_verifier = codeVerifier;
      }

      const response = await this.publicClient.post<TokenResponse>('/oauth2/token', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to exchange authorization code',
      );
    }
  }

  /**
   * Refresh access token using refresh token
   * Called when access token expires
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: HydraConfig.CLIENT_ID,
        client_secret: HydraConfig.CLIENT_SECRET,
      });

      const response = await this.publicClient.post<TokenResponse>('/oauth2/token', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to refresh token',
      );
    }
  }

  /**
   * Get user info from access token
   * GET /userinfo
   */
  async getUserinfo(accessToken: string): Promise<Userinfo> {
    try {
      const response = await this.publicClient.get<Userinfo>('/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to fetch userinfo',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN CHALLENGE (used in login page)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get login challenge details
   * Called on login page when redirected from Hydra with login_challenge
   * Server-side only - uses admin URL
   */
  async getLoginChallenge(loginChallenge: string): Promise<LoginChallenge> {
    try {
      const response = await this.adminClient.get<LoginChallenge>(
        `/oauth2/auth/requests/login?login_challenge=${encodeURIComponent(loginChallenge)}`,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to fetch login challenge',
      );
    }
  }

  /**
   * Accept login challenge
   * Called after user successfully authenticates with Kratos
   * Server-side only - uses admin URL
   * Returns redirect URL to continue OAuth2 flow
   */
  async acceptLoginChallenge(
    loginChallenge: string,
    subject: string,
    rememberMe: boolean = false,
  ): Promise<{ redirect_to: string }> {
    try {
      const response = await this.adminClient.put<{ redirect_to: string }>(
        `/oauth2/auth/requests/login/accept?login_challenge=${encodeURIComponent(loginChallenge)}`,
        {
          subject: subject,
          remember: rememberMe,
          remember_for: rememberMe ? 3600 : 0, // 1 hour if remember
        },
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to accept login challenge',
      );
    }
  }

  /**
   * Reject login challenge
   * Called if login fails or user cancels
   */
  async rejectLoginChallenge(
    loginChallenge: string,
    error: string = 'access_denied',
    errorDescription: string = 'Login denied',
  ): Promise<{ redirect_to: string }> {
    try {
      const response = await this.adminClient.put<{ redirect_to: string }>(
        `/oauth2/auth/requests/login/reject?login_challenge=${encodeURIComponent(loginChallenge)}`,
        {
          error: error,
          error_description: errorDescription,
        },
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to reject login challenge',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSENT CHALLENGE (used in consent page)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get consent challenge details
   * Called on consent page when redirected from Hydra with consent_challenge
   * Server-side only - uses admin URL
   */
  async getConsentChallenge(consentChallenge: string): Promise<ConsentChallenge> {
    try {
      const response = await this.adminClient.get<ConsentChallenge>(
        `/oauth2/auth/requests/consent?consent_challenge=${encodeURIComponent(consentChallenge)}`,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to fetch consent challenge',
      );
    }
  }

  /**
   * Accept consent challenge
   * Called after user grants permission to requested scopes
   * Server-side only - uses admin URL
   */
  async acceptConsentChallenge(
    consentChallenge: string,
    grantScope: string[],
    rememberMe: boolean = false,
  ): Promise<{ redirect_to: string }> {
    try {
      const response = await this.adminClient.put<{ redirect_to: string }>(
        `/oauth2/auth/requests/consent/accept?consent_challenge=${encodeURIComponent(consentChallenge)}`,
        {
          grant_scope: grantScope,
          grant_access_token_audience: ['urn:excise-api-hub'],
          remember: rememberMe,
          remember_for: rememberMe ? 3600 : 0,
        },
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to accept consent challenge',
      );
    }
  }

  /**
   * Reject consent challenge
   * Called if user denies permission
   */
  async rejectConsentChallenge(
    consentChallenge: string,
    error: string = 'access_denied',
    errorDescription: string = 'Consent denied by user',
  ): Promise<{ redirect_to: string }> {
    try {
      const response = await this.adminClient.put<{ redirect_to: string }>(
        `/oauth2/auth/requests/consent/reject?consent_challenge=${encodeURIComponent(consentChallenge)}`,
        {
          error: error,
          error_description: errorDescription,
        },
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to reject consent challenge',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGOUT CHALLENGE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get logout challenge
   */
  async getLogoutChallenge(logoutChallenge: string): Promise<LogoutChallenge> {
    try {
      const response = await this.adminClient.get<LogoutChallenge>(
        `/oauth2/auth/requests/logout?logout_challenge=${encodeURIComponent(logoutChallenge)}`,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to fetch logout challenge',
      );
    }
  }

  /**
   * Accept logout challenge
   */
  async acceptLogoutChallenge(logoutChallenge: string): Promise<{ redirect_to: string }> {
    try {
      const response = await this.adminClient.put<{ redirect_to: string }>(
        `/oauth2/auth/requests/logout/accept?logout_challenge=${encodeURIComponent(logoutChallenge)}`,
        {},
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to accept logout challenge',
      );
    }
  }

  /**
   * Reject logout challenge
   */
  async rejectLogoutChallenge(logoutChallenge: string): Promise<{ redirect_to: string }> {
    try {
      const response = await this.adminClient.put<{ redirect_to: string }>(
        `/oauth2/auth/requests/logout/reject?logout_challenge=${encodeURIComponent(logoutChallenge)}`,
        {},
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to reject logout challenge',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN VALIDATION & INTROSPECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Introspect token (validate it)
   * Used by backend APIs to validate access tokens
   * POST /oauth2/introspect
   */
  async introspectToken(
    token: string,
    scope?: string[],
  ): Promise<TokenInfo> {
    try {
      const payload = new URLSearchParams({
        token: token,
        client_id: HydraConfig.CLIENT_ID,
        client_secret: HydraConfig.CLIENT_SECRET,
      });

      if (scope) {
        payload.append('scope', scope.join(' '));
      }

      const response = await this.publicClient.post<TokenInfo>('/oauth2/introspect', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Token introspection failed',
      );
    }
  }

  /**
   * Check if token is active (valid)
   */
  async isTokenActive(token: string): Promise<boolean> {
    try {
      const info = await this.introspectToken(token);
      return info.active === true;
    } catch {
      return false;
    }
  }

  /**
   * Revoke all tokens from a specific consent session
   * NEW in v25.4.0: Token chain revocation by consent challenge ID
   * Useful for "revoke all sessions" feature
   * DELETE /oauth2/auth/sessions/consent/{consent_challenge_id}
   * Admin only - server-side use
   */
  async revokeTokensByConsentId(consentChallengeId: string): Promise<void> {
    try {
      await this.adminClient.delete(
        `/oauth2/auth/sessions/consent/${encodeURIComponent(consentChallengeId)}`,
      );
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to revoke tokens',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OAUTH2 CLIENT MANAGEMENT (Admin)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get OAuth2 client details (admin only)
   */
  async getClient(clientId: string): Promise<OAuth2Client> {
    try {
      const response = await this.adminClient.get<OAuth2Client>(
        `/clients/${encodeURIComponent(clientId)}`,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to fetch client',
      );
    }
  }

  /**
   * Create OAuth2 client (admin only)
   */
  async createClient(client: OAuth2Client): Promise<OAuth2Client> {
    try {
      const response = await this.adminClient.post<OAuth2Client>('/clients', client);
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to create client',
      );
    }
  }

  /**
   * Update OAuth2 client (admin only)
   */
  async updateClient(clientId: string, client: Partial<OAuth2Client>): Promise<OAuth2Client> {
    try {
      const response = await this.adminClient.put<OAuth2Client>(
        `/clients/${encodeURIComponent(clientId)}`,
        client,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to update client',
      );
    }
  }

  /**
   * Delete OAuth2 client (admin only)
   */
  async deleteClient(clientId: string): Promise<void> {
    try {
      await this.adminClient.delete(`/clients/${encodeURIComponent(clientId)}`);
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to delete client',
      );
    }
  }
}

// Export singleton instance
export const hydra = new HydraClient();
