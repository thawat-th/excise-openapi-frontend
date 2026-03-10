import axios from 'axios';

// Server-side admin URLs (internal Docker network)
const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const AUTH_INTERNAL_ADMIN_URL = process.env.AUTH_INTERNAL_ADMIN_URL || 'http://auth-server:4445';

// Public URLs (via Kong API Gateway)
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
const AUTH_SERVER_PUBLIC_URL = process.env.NEXT_PUBLIC_AUTH_SERVER_PUBLIC_URL || `${API_GATEWAY_URL}/identity`;
const REGISTRY_API_URL = `${API_GATEWAY_URL}/api/registry`;

export interface LoginChallenge {
  challenge: string;
  client: {
    client_id: string;
    client_name: string;
  };
  requested_scope: string[];
  skip: boolean;
}

export interface ConsentChallenge {
  challenge: string;
  client: {
    client_id: string;
    client_name: string;
  };
  requested_scope: string[];
  requested_access_token_audience: string[];
  skip: boolean;
  auto_accepted?: boolean;
  redirect_to?: string;
}

export async function getLoginChallenge(challenge: string): Promise<LoginChallenge> {
  try {
    const response = await axios.get(
      `${AUTH_INTERNAL_ADMIN_URL}/oauth2/auth/requests/login?login_challenge=${challenge}`,
      { validateStatus: () => true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching login challenge:', error);
    throw error;
  }
}

export async function acceptLoginChallenge(
  challenge: string,
  subject: string
): Promise<{ redirect_to: string }> {
  try {
    const response = await axios.put(
      `${AUTH_INTERNAL_ADMIN_URL}/oauth2/auth/requests/login/accept?login_challenge=${challenge}`,
      { subject },
      { validateStatus: () => true }
    );
    return response.data;
  } catch (error) {
    console.error('Error accepting login challenge:', error);
    throw error;
  }
}

export async function getConsentChallenge(challenge: string): Promise<ConsentChallenge> {
  try {
    const response = await fetch(
      `/api/auth/consent-challenge?consent_challenge=${encodeURIComponent(challenge)}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch consent challenge');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching consent challenge:', error);
    throw error;
  }
}

export async function acceptConsentChallenge(
  challenge: string,
  grantScope: string[]
): Promise<{ redirect_to: string }> {
  try {
    const response = await fetch('/api/auth/accept-consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consentChallenge: challenge,
        grantScope,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to accept consent challenge');
    }
    return response.json();
  } catch (error) {
    console.error('Error accepting consent challenge:', error);
    throw error;
  }
}

export async function rejectConsentChallenge(
  challenge: string,
  error: string,
  errorDescription: string
): Promise<{ redirect_to: string }> {
  try {
    const response = await fetch('/api/auth/reject-consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consentChallenge: challenge,
        error,
        errorDescription,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reject consent challenge');
    }
    return response.json();
  } catch (error) {
    console.error('Error rejecting consent challenge:', error);
    throw error;
  }
}

export async function getLogoutChallenge(challenge: string) {
  try {
    const response = await fetch(
      `/api/auth/logout-challenge?logout_challenge=${encodeURIComponent(challenge)}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch logout challenge');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching logout challenge:', error);
    throw error;
  }
}

export async function acceptLogoutChallenge(challenge: string): Promise<{ redirect_to: string }> {
  try {
    const response = await fetch('/api/auth/accept-logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logoutChallenge: challenge,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to accept logout');
    }
    return response.json();
  } catch (error) {
    console.error('Error accepting logout challenge:', error);
    throw error;
  }
}

export function getAuthorizationUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'openid profile email',
    redirect_uri: redirectUri,
  });
  return `${AUTH_SERVER_PUBLIC_URL}/oauth2/auth?${params.toString()}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry Service API (accessed via Kong gateway)
// ═══════════════════════════════════════════════════════════════════════════

export async function getRegistryHealth(): Promise<{ status: string; service: string }> {
  try {
    const response = await axios.get(`${REGISTRY_API_URL}/health`, {
      validateStatus: () => true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching registry health:', error);
    throw error;
  }
}

export async function getRegistryInfo(): Promise<{ name: string; version: string }> {
  try {
    const response = await axios.get(`${REGISTRY_API_URL}/info`, {
      validateStatus: () => true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching registry info:', error);
    throw error;
  }
}

export async function getRegistryApis(): Promise<{ count: number; apis: any[] }> {
  try {
    const response = await axios.get(`${REGISTRY_API_URL}/list`, {
      validateStatus: () => true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching registry APIs:', error);
    throw error;
  }
}
