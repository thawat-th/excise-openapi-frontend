/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from 'next/server';
import { GET } from '../sessions/route';

// Mock dependencies
jest.mock('@/lib/session-helpers', () => ({
  getKratosSessionToken: jest.fn(),
}));

const { getKratosSessionToken } = require('@/lib/session-helpers');

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/account/sessions', () => {
  const IDENTITY_INTERNAL_URL = 'http://identity:4433';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.IDENTITY_INTERNAL_URL = IDENTITY_INTERNAL_URL;
  });

  describe('GET /api/account/sessions', () => {
    it('ควรคืน 401 เมื่อไม่มี Kratos session token', async () => {
      getKratosSessionToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/account/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No Kratos session. Please log in again.');
    });

    it('ควรคืน sessions list พร้อม current session', async () => {
      const mockSessionToken = 'mock-session-token';
      const mockCurrentSession = {
        id: 'session-1',
        active: true,
        authenticator_assurance_level: 'aal1',
        authenticated_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-02T00:00:00Z',
        identity: {
          id: 'user-123',
          traits: {
            email: 'test@example.com',
          },
        },
        devices: [{
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          ip_address: '192.168.1.1',
          location: 'Bangkok, Thailand',
        }],
      };
      const mockOtherSessions = [
        {
          id: 'session-2',
          active: false,
          authenticated_at: '2023-12-01T00:00:00Z',
          expires_at: '2023-12-02T00:00:00Z',
          devices: [{
            user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
            ip_address: '192.168.1.2',
          }],
        },
      ];

      getKratosSessionToken.mockResolvedValue(mockSessionToken);

      // Mock whoami call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCurrentSession,
      });

      // Mock sessions list call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCurrentSession, ...mockOtherSessions],
      });

      const request = new NextRequest('http://localhost:3000/api/account/sessions', {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '127.0.0.1',
        },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessions).toHaveLength(2);

      // Current session should be first
      expect(data.sessions[0]).toMatchObject({
        id: 'session-1',
        current: true,
        lastActive: 'activeNow',
        deviceType: 'desktop',
      });

      // Other session should be second
      expect(data.sessions[1]).toMatchObject({
        id: 'session-2',
        current: false,
        deviceType: 'mobile',
      });

      // Verify fetch calls
      expect(global.fetch).toHaveBeenNthCalledWith(1,
        `${IDENTITY_INTERNAL_URL}/sessions/whoami`,
        expect.objectContaining({
          headers: {
            'X-Session-Token': mockSessionToken,
          },
        })
      );
    });

    it('ควรคืน 401 เมื่อ whoami validation ล้มเหลว', async () => {
      const mockSessionToken = 'mock-session-token';

      getKratosSessionToken.mockResolvedValue(mockSessionToken);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const request = new NextRequest('http://localhost:3000/api/account/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Session expired. Please log in again.');
    });

    it('ควรทำงานได้แม้ sessions list API ล้มเหลว (แสดงแค่ current session)', async () => {
      const mockSessionToken = 'mock-session-token';
      const mockCurrentSession = {
        id: 'session-1',
        active: true,
        authenticated_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-02T00:00:00Z',
        identity: {
          id: 'user-123',
        },
        devices: [{
          user_agent: 'Mozilla/5.0',
          ip_address: '192.168.1.1',
        }],
      };

      getKratosSessionToken.mockResolvedValue(mockSessionToken);

      // Whoami succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCurrentSession,
      });

      // Sessions list fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const request = new NextRequest('http://localhost:3000/api/account/sessions', {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      });
      const response = await GET(request);
      const data = await response.json();

      // Should still return current session only
      expect(response.status).toBe(200);
      expect(data.sessions).toHaveLength(1);
      expect(data.sessions[0]).toMatchObject({
        id: 'session-1',
        current: true,
      });
    });

    it('ควร mask IP address อย่างถูกต้อง', async () => {
      const mockSessionToken = 'mock-session-token';
      const mockCurrentSession = {
        id: 'session-1',
        active: true,
        authenticated_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-02T00:00:00Z',
        identity: { id: 'user-123' },
        devices: [{
          user_agent: 'Mozilla/5.0',
          ip_address: '192.168.1.100',
        }],
      };

      getKratosSessionToken.mockResolvedValue(mockSessionToken);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCurrentSession,
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockCurrentSession],
      });

      const request = new NextRequest('http://localhost:3000/api/account/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessions[0].ip).toBe('192.168.xxx.xxx');
    });

    it('ควรคืน 500 เมื่อเกิด error ไม่คาดคิด', async () => {
      getKratosSessionToken.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/account/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch sessions');
    });
  });
});
