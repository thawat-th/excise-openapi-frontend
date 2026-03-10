/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from 'next/server';
import { GET } from '../profile/route';

// Mock dependencies
jest.mock('@/lib/session-helpers', () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = require('@/lib/session-helpers');

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/account/profile', () => {
  const AUTH_INTERNAL_URL = 'http://auth-server:4444';
  const IDENTITY_INTERNAL_ADMIN_URL = 'http://identity:4434';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'production'; // Force production mode for tests
    process.env.AUTH_INTERNAL_URL = AUTH_INTERNAL_URL;
    process.env.IDENTITY_INTERNAL_ADMIN_URL = IDENTITY_INTERNAL_ADMIN_URL;
  });

  describe('GET /api/account/profile', () => {
    it('ควรคืน 401 เมื่อไม่มี access token (production mode)', async () => {
      getAccessToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/account/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Session expired. Please login again.');
    });

    it('ควรคืน profile data เมื่อมี access token', async () => {
      const mockAccessToken = 'mock-access-token';
      const mockUserInfo = {
        sub: 'user-123',
        email: 'test@example.com',
        email_verified: true,
        given_name: 'Test',
        family_name: 'User',
      };
      const mockIdentity = {
        id: 'user-123',
        traits: {
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          mobile: '0812345678',
        },
        verifiable_addresses: [{
          value: 'test@example.com',
          verified: true,
        }],
        metadata_public: {
          avatar: 'https://example.com/avatar.jpg',
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      getAccessToken.mockResolvedValue(mockAccessToken);

      // Mock userinfo call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      });

      // Mock identity call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIdentity,
      });

      const request = new NextRequest('http://localhost:3000/api/account/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        mobile: '0812345678',
        emailVerified: true,
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      });

      // Verify fetch was called with correct URLs
      expect(global.fetch).toHaveBeenNthCalledWith(1,
        `${AUTH_INTERNAL_URL}/userinfo`,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        })
      );
      expect(global.fetch).toHaveBeenNthCalledWith(2,
        `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/user-123`,
        expect.objectContaining({
          headers: {
            Accept: 'application/json',
          },
        })
      );
    });

    it('ควรคืน 401 เมื่อ OAuth2 userinfo ล้มเหลว', async () => {
      const mockAccessToken = 'mock-access-token';

      getAccessToken.mockResolvedValue(mockAccessToken);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const request = new NextRequest('http://localhost:3000/api/account/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Not authenticated');
    });

    it('ควรทำงานได้แม้ Identity API ล้มเหลว', async () => {
      const mockAccessToken = 'mock-access-token';
      const mockUserInfo = {
        sub: 'user-123',
        email: 'test@example.com',
        email_verified: true,
        given_name: 'Test',
        family_name: 'User',
      };

      getAccessToken.mockResolvedValue(mockAccessToken);

      // Userinfo succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      });

      // Identity API fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const request = new NextRequest('http://localhost:3000/api/account/profile');
      const response = await GET(request);
      const data = await response.json();

      // Should still return profile with userinfo data only
      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        mobile: '',
        emailVerified: true,
        avatar: '',
        createdAt: '',
        updatedAt: '',
      });
    });

    it('ควรคืน 500 เมื่อเกิด error ไม่คาดคิด', async () => {
      getAccessToken.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/account/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get profile');
    });
  });
});
