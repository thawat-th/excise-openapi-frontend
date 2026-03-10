/**
 * ORY Kratos SDK
 * Handles identity and self-service flows (login, registration, recovery, verification, settings)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  LoginFlow,
  RegistrationFlow,
  RecoveryFlow,
  VerificationFlow,
  SettingsFlow,
  Session,
  Identity,
  FlowSubmitPayload,
  UiNode,
} from './types';
import { KratosConfig } from './config';
import { handleKratosError, FlowExpiredError, SessionError } from './errors';

/**
 * ORY Kratos Client
 * All requests use public URLs (4433) except admin operations
 */
class KratosClient {
  private publicClient: AxiosInstance;
  private adminClient: AxiosInstance;

  constructor() {
    // Public client - used by browser
    this.publicClient = axios.create({
      baseURL: KratosConfig.PUBLIC_URL,
      withCredentials: true, // Include cookies
    });

    // Admin client - used by server (Next.js backend)
    this.adminClient = axios.create({
      baseURL: KratosConfig.ADMIN_URL,
      withCredentials: false,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get current session (logged-in user)
   * Validates Kratos session cookie
   * Can be called from browser or server
   */
  async getSession(sessionCookie?: string): Promise<Session> {
    try {
      const config: any = {};
      if (sessionCookie) {
        config.headers = { Cookie: sessionCookie };
      }
      const response = await this.publicClient.get<Session>('/sessions/whoami', config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new SessionError('No active session');
      }
      handleKratosError(axios.isAxiosError(error) ? error.response?.data : error, 'Failed to get session');
    }
  }

  /**
   * Logout (invalidate session)
   */
  async logout(): Promise<void> {
    try {
      await this.publicClient.get('/self-service/logout/flows');
    } catch (error) {
      // Log but don't throw - logout should always succeed
      console.error('Logout error:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN FLOW
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize login flow
   * GET /self-service/login/flows?id=flow_id
   * Call this when you need to get the current login form
   */
  async getLoginFlow(flowId: string): Promise<LoginFlow> {
    try {
      const response = await this.publicClient.get<LoginFlow>(
        `/self-service/login/flows?id=${encodeURIComponent(flowId)}`,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to load login form',
      );
    }
  }

  /**
   * Submit login credentials
   * POST /self-service/login/flows?flow=flow_id
   * Body: { password_identifier: email, password: password, method: password }
   */
  async submitLoginFlow(
    flowId: string,
    email: string,
    password: string,
    csrfToken?: string,
  ): Promise<Session> {
    try {
      const payload: Record<string, any> = {
        method: 'password',
        password_identifier: email,
        password: password,
      };

      if (csrfToken) {
        payload.csrf_token = csrfToken;
      }

      const response = await this.publicClient.post<Session>(
        `/self-service/login/flows?flow=${encodeURIComponent(flowId)}`,
        payload,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Login failed',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRATION FLOW
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize registration flow
   * GET /self-service/registration/flows?id=flow_id
   */
  async getRegistrationFlow(flowId: string): Promise<RegistrationFlow> {
    try {
      const response = await this.publicClient.get<RegistrationFlow>(
        `/self-service/registration/flows?id=${encodeURIComponent(flowId)}`,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to load registration form',
      );
    }
  }

  /**
   * Submit registration
   * POST /self-service/registration/flows?flow=flow_id
   * v25.4.0: Enhanced to support additional user traits (citizen_id, mobile)
   */
  async submitRegistrationFlow(
    flowId: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    csrfToken?: string,
    citizenId?: string,
    mobile?: string,
  ): Promise<Session> {
    try {
      const payload: Record<string, any> = {
        method: 'password',
        password: password,
        traits: {
          email: email,
        },
      };

      // Add optional name fields
      if (firstName) payload.traits.first_name = firstName;
      if (lastName) payload.traits.last_name = lastName;

      // v25.4.0: Add Thai-specific fields (citizen ID and mobile)
      if (citizenId) payload.traits.citizen_id = citizenId;
      if (mobile) payload.traits.mobile = mobile;

      // Add CSRF token if provided
      if (csrfToken) payload.csrf_token = csrfToken;

      const response = await this.publicClient.post<Session>(
        `/self-service/registration/flows?flow=${encodeURIComponent(flowId)}`,
        payload,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Registration failed',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RECOVERY FLOW (Password Reset)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize recovery flow (password reset)
   * GET /self-service/recovery/flows?id=flow_id
   */
  async getRecoveryFlow(flowId: string): Promise<RecoveryFlow> {
    try {
      const response = await this.publicClient.get<RecoveryFlow>(
        `/self-service/recovery/flows?id=${encodeURIComponent(flowId)}`,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to load recovery form',
      );
    }
  }

  /**
   * Submit recovery (request reset email)
   * POST /self-service/recovery/flows?flow=flow_id
   */
  async submitRecoveryFlow(flowId: string, email: string, csrfToken?: string): Promise<void> {
    try {
      const payload: Record<string, any> = {
        method: 'link',
        email: email,
      };

      if (csrfToken) payload.csrf_token = csrfToken;

      await this.publicClient.post(
        `/self-service/recovery/flows?flow=${encodeURIComponent(flowId)}`,
        payload,
      );
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Recovery request failed',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFICATION FLOW (Email Verification)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize verification flow
   * GET /self-service/verification/flows?id=flow_id
   */
  async getVerificationFlow(flowId: string): Promise<VerificationFlow> {
    try {
      const response = await this.publicClient.get<VerificationFlow>(
        `/self-service/verification/flows?id=${encodeURIComponent(flowId)}`,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to load verification form',
      );
    }
  }

  /**
   * Submit verification (verify email with code)
   * POST /self-service/verification/flows?flow=flow_id
   */
  async submitVerificationFlow(
    flowId: string,
    verificationCode: string,
    csrfToken?: string,
  ): Promise<void> {
    try {
      const payload: Record<string, any> = {
        method: 'link',
        link: verificationCode,
      };

      if (csrfToken) payload.csrf_token = csrfToken;

      await this.publicClient.post(
        `/self-service/verification/flows?flow=${encodeURIComponent(flowId)}`,
        payload,
      );
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Verification failed',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS FLOW (Profile Updates)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize settings flow
   * GET /self-service/settings/flows?id=flow_id
   * Requires active session (user must be logged in)
   */
  async getSettingsFlow(flowId: string): Promise<SettingsFlow> {
    try {
      const response = await this.publicClient.get<SettingsFlow>(
        `/self-service/settings/flows?id=${encodeURIComponent(flowId)}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new SessionError('You must be logged in to access settings');
      }
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to load settings',
      );
    }
  }

  /**
   * Submit settings update (profile info)
   * POST /self-service/settings/flows?flow=flow_id
   */
  async submitSettingsFlow(
    flowId: string,
    traits: Record<string, any>,
    csrfToken?: string,
  ): Promise<Session> {
    try {
      const payload: Record<string, any> = {
        method: 'profile',
        traits: traits,
      };

      if (csrfToken) payload.csrf_token = csrfToken;

      const response = await this.publicClient.post<Session>(
        `/self-service/settings/flows?flow=${encodeURIComponent(flowId)}`,
        payload,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to update settings',
      );
    }
  }

  /**
   * Change password in settings
   */
  async submitPasswordChange(
    flowId: string,
    newPassword: string,
    csrfToken?: string,
  ): Promise<Session> {
    try {
      const payload: Record<string, any> = {
        method: 'password',
        password: newPassword,
      };

      if (csrfToken) payload.csrf_token = csrfToken;

      const response = await this.publicClient.post<Session>(
        `/self-service/settings/flows?flow=${encodeURIComponent(flowId)}`,
        payload,
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Password change failed',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOUNT LINKING FLOW (OIDC/Social Login)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize account linking flow
   * GET /self-service/link/flows?id=flow_id
   * Used to link OIDC providers (Google, GitHub, etc.)
   * Requires active session (user must be logged in)
   */
  async getLinkFlow(flowId: string): Promise<any> {
    try {
      const response = await this.publicClient.get<any>(
        `/self-service/link/flows?id=${encodeURIComponent(flowId)}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new SessionError('You must be logged in to link accounts');
      }
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to load account linking form',
      );
    }
  }

  /**
   * Submit account linking flow
   * POST /self-service/link/flows?flow=flow_id
   * v25.4.0: Failed linking returns 400 (was 200 in earlier versions)
   */
  async submitLinkFlow(flowId: string, provider: string, csrfToken?: string): Promise<Session> {
    try {
      const payload: Record<string, any> = {
        method: provider, // e.g., 'google', 'github', 'oidc'
      };

      if (csrfToken) payload.csrf_token = csrfToken;

      const response = await this.publicClient.post<Session>(
        `/self-service/link/flows?flow=${encodeURIComponent(flowId)}`,
        payload,
      );
      return response.data;
    } catch (error) {
      // v25.4.0: Account linking errors now return 400
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        handleKratosError(
          error.response?.data,
          'Account linking failed. Account may already be linked.',
        );
      }
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Account linking failed',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // IDENTITY MANAGEMENT (Admin API - server-side only)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get identity by ID (admin only)
   * Used on server to fetch user data after successful authentication
   */
  async getIdentity(identityId: string): Promise<Identity> {
    try {
      const response = await this.adminClient.get<Identity>(`/identities/${encodeURIComponent(identityId)}`);
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to fetch identity',
      );
    }
  }

  /**
   * List all identities (admin only)
   */
  async listIdentities(limit: number = 10, offset: number = 0): Promise<Identity[]> {
    try {
      const response = await this.adminClient.get<Identity[]>('/identities', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to list identities',
      );
    }
  }

  /**
   * Update identity (admin only)
   */
  async updateIdentity(identityId: string, traits: Record<string, any>): Promise<Identity> {
    try {
      const response = await this.adminClient.put<Identity>(
        `/identities/${encodeURIComponent(identityId)}`,
        { traits },
      );
      return response.data;
    } catch (error) {
      handleKratosError(
        axios.isAxiosError(error) ? error.response?.data : error,
        'Failed to update identity',
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Extract CSRF token from UI container (for form submission)
   */
  extractCSRFToken(nodes: UiNode[]): string | undefined {
    const csrfNode = nodes.find((n) => n.attributes.name === 'csrf_token');
    return csrfNode?.attributes.value as string | undefined;
  }

  /**
   * Extract form fields from UI nodes
   */
  extractFormFields(nodes: UiNode[]): Record<string, UiNode> {
    return nodes.reduce(
      (acc, node) => {
        if (node.attributes.name && node.attributes.name !== 'csrf_token') {
          acc[node.attributes.name] = node;
        }
        return acc;
      },
      {} as Record<string, UiNode>,
    );
  }
}

// Export singleton instance
export const kratos = new KratosClient();
