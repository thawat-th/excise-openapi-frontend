/**
 * Session Management
 * Handles Kratos session validation, token storage, and refresh
 */

import { Session, Identity } from './types';
import { kratos } from './kratos';
import { hydra } from './hydra';
import { SessionError } from './errors';

/**
 * Token storage manager
 * Handles secure token storage (memory, localStorage, or cookies)
 */
export class TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  constructor(private useLocalStorage: boolean = false) {}

  /**
   * Store tokens
   */
  setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    this.accessToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;

    if (expiresIn) {
      this.expiresAt = Date.now() + expiresIn * 1000;
    }

    if (this.useLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      if (this.expiresAt) localStorage.setItem('token_expires_at', this.expiresAt.toString());
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;

    if (this.useLocalStorage && typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }

    return null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (this.refreshToken) return this.refreshToken;

    if (this.useLocalStorage && typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }

    return null;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (!this.expiresAt) return false;
    return Date.now() > this.expiresAt;
  }

  /**
   * Clear all tokens
   */
  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
    }
  }
}

/**
 * Session Manager
 * Validates and manages user sessions
 */
class SessionManager {
  private tokenStorage: TokenStorage;
  private currentSession: Session | null = null;
  private sessionCache: Map<string, { session: Session; timestamp: number }> = new Map();
  private readonly SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Use localStorage in browser, memory in server
    const useLocalStorage = typeof window !== 'undefined';
    this.tokenStorage = new TokenStorage(useLocalStorage);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get current session (validate Kratos session cookie)
   * Call this to verify user is logged in
   */
  async getSession(sessionCookie?: string): Promise<Session> {
    const cacheKey = sessionCookie || 'current';

    // Check cache
    const cached = this.sessionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.SESSION_CACHE_TTL) {
      return cached.session;
    }

    try {
      const session = await kratos.getSession(sessionCookie);
      this.currentSession = session;

      // Cache the session
      this.sessionCache.set(cacheKey, {
        session,
        timestamp: Date.now(),
      });

      return session;
    } catch (error) {
      this.currentSession = null;
      throw new SessionError('Failed to validate session');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getSession();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current identity
   */
  async getIdentity(): Promise<Identity | null> {
    try {
      const session = await this.getSession();
      return session.identity;
    } catch {
      return null;
    }
  }

  /**
   * Invalidate session cache
   */
  invalidateCache(): void {
    this.sessionCache.clear();
    this.currentSession = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Store OAuth2 tokens after successful authentication
   */
  storeTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    this.tokenStorage.setTokens(accessToken, refreshToken, expiresIn);
  }

  /**
   * Get current access token
   * Used for API requests (Authorization: Bearer token)
   */
  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }

  /**
   * Refresh access token if expired
   */
  async ensureTokenValid(): Promise<string | null> {
    const accessToken = this.tokenStorage.getAccessToken();

    if (!accessToken) {
      return null;
    }

    if (!this.tokenStorage.isTokenExpired()) {
      return accessToken;
    }

    // Try to refresh
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      throw new SessionError('Session expired. Please log in again.');
    }

    try {
      const response = await hydra.refreshToken(refreshToken);
      this.storeTokens(response.access_token, response.refresh_token, response.expires_in);
      return response.access_token;
    } catch (error) {
      this.clearSession();
      throw new SessionError('Failed to refresh session. Please log in again.');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Clear local session data
   */
  clearSession(): void {
    this.tokenStorage.clear();
    this.currentSession = null;
    this.invalidateCache();
  }

  /**
   * Logout - invalidate session on server and locally
   */
  async logout(): Promise<void> {
    try {
      // Invalidate Kratos session
      await kratos.logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with local cleanup even if server call fails
    } finally {
      this.clearSession();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get authorization header for API requests
   */
  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }

  /**
   * Get current session synchronously (from cache)
   * Returns null if not in cache
   */
  getCurrentSessionSync(): Session | null {
    return this.currentSession;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

/**
 * Server-side helper to validate Kratos session from cookies
 * Use this in Next.js API routes to validate requests
 */
export async function validateServerSession(cookies: Record<string, string>): Promise<Session | null> {
  try {
    // Build cookie string from cookies object
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const session = await kratos.getSession(cookieString);
    return session;
  } catch {
    return null;
  }
}
