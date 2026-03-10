/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/auth/register-organization', () => {
  const IDENTITY_INTERNAL_ADMIN_URL = 'http://identity:4434';
  const GOVERNANCE_API_URL = 'http://api-governance-service:5001';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.IDENTITY_INTERNAL_ADMIN_URL = IDENTITY_INTERNAL_ADMIN_URL;
    process.env.GOVERNANCE_API_URL = GOVERNANCE_API_URL;
  });

  const validPayload = {
    orgEmail: 'contact@company.co.th',
    orgVerificationToken: 'valid-org-token',
    orgName: 'บริษัท ทดสอบ จำกัด',
    taxId: '0105556000335', // Valid Thai tax ID with checksum
    contactEmail: 'admin@company.co.th',
    contactVerificationToken: 'valid-contact-token',
    contactPassword: 'Test1234!',
    contactFirstName: 'สมชาย',
    contactLastName: 'ใจดี',
    contactCitizenId: '1100900124862', // Valid Thai citizen ID with checksum
    contactMobile: '0812345678',
    contactBirthdate: '1990-01-01',
  };

  describe('POST /api/auth/register-organization', () => {
    it('ควรสร้าง organization registration สำเร็จ (Happy Path)', async () => {
      // Mock OTP validation (2 calls: org email + contact email)
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        });

      // Mock Kratos: Create organization identity
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'org-identity-123',
          schema_id: 'organization',
          traits: { email: 'contact@company.co.th', name: 'บริษัท ทดสอบ จำกัด' },
        }),
      });

      // Mock Kratos: Create person identity
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'person-identity-456',
          schema_id: 'person',
          traits: { email: 'admin@company.co.th', name: 'สมชาย ใจดี' },
        }),
      });

      // Mock Backend: Create profiles
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'org-profile-789',
            identity_id: 'org-identity-123',
            email: 'contact@company.co.th',
            organization_name: 'บริษัท ทดสอบ จำกัด',
            tax_id: '0105556000331',
          },
        }),
      });

      // Mock consume tokens (fire-and-forget, 2 calls)
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { consumed: true } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { consumed: true } }),
        });

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Organization registration successful');
      expect(data.organization).toEqual({
        identityId: 'org-identity-123',
        email: 'contact@company.co.th',
        name: 'บริษัท ทดสอบ จำกัด',
      });
      expect(data.contact).toEqual({
        identityId: 'person-identity-456',
        email: 'admin@company.co.th',
        name: 'สมชาย ใจดี',
      });
    });

    it('ควรคืน 400 เมื่อขาด required fields (organization)', async () => {
      const invalidPayload = {
        // Missing orgEmail, orgVerificationToken, orgName, taxId
        contactEmail: 'admin@company.co.th',
        contactVerificationToken: 'valid-token',
        contactPassword: 'Test1234',
        contactFirstName: 'Test',
        contactLastName: 'User',
        contactCitizenId: '1100900012345',
        contactMobile: '0812345678',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Organization email, verification token, name, and tax ID are required');
    });

    it('ควรคืน 400 เมื่อขาด required fields (contact)', async () => {
      const invalidPayload = {
        orgEmail: 'contact@company.co.th',
        orgVerificationToken: 'valid-token',
        orgName: 'Test Company',
        taxId: '0105556000331',
        // Missing contactEmail, contactPassword, etc.
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(invalidPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Contact person email, verification token, password, name, citizen ID, and mobile are required');
    });

    it('ควรคืน 400 เมื่อ organization email เป็น personal domain (gmail)', async () => {
      const payload = {
        ...validPayload,
        orgEmail: 'test@gmail.com', // Personal domain
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Organization email must be a corporate domain (not gmail, hotmail, etc.)');
    });

    it('ควรคืน 400 เมื่อ tax ID ไม่ valid (checksum ผิด)', async () => {
      const payload = {
        ...validPayload,
        taxId: '1111111111111', // Invalid checksum
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid tax ID format');
    });

    it('ควรคืน 400 เมื่อ citizen ID ไม่ valid (checksum ผิด)', async () => {
      const payload = {
        ...validPayload,
        contactCitizenId: '1234567890123', // Invalid checksum
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid citizen ID format');
    });

    it('ควรคืน 400 เมื่อ mobile number ไม่ valid (ไม่ใช่เบอร์ไทย)', async () => {
      const payload = {
        ...validPayload,
        contactMobile: '0212345678', // Invalid prefix (must be 06/08/09)
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid mobile number format');
    });

    it('ควรคืน 400 เมื่อ password อ่อนแอ (ไม่มี uppercase)', async () => {
      const payload = {
        ...validPayload,
        contactPassword: 'test1234', // No uppercase
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password must contain uppercase letter');
    });

    it('ควรคืน 400 เมื่อ organization verification token ไม่ valid', async () => {
      // Mock OTP validation - organization token invalid
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false }),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid or expired organization verification token. Please verify your email again.');
      expect(data.code).toBe('invalid_token');
    });

    it('ควรคืน 400 เมื่อ contact verification token ไม่ valid', async () => {
      // Mock OTP validation - org token valid, contact token invalid
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ success: false }),
        });

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid or expired contact verification token. Please verify your email again.');
      expect(data.code).toBe('invalid_token');
    });

    it('ควรคืน 409 เมื่อ organization email มีอยู่แล้ว', async () => {
      // Mock OTP validation
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        });

      // Mock Kratos: Organization identity already exists
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: { message: 'identity with this email already exists' },
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('An organization with this email already exists.');
    });

    it('ควร rollback organization identity เมื่อ person identity creation ล้มเหลว', async () => {
      // Mock OTP validation
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        });

      // Mock Kratos: Create organization identity (success)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'org-identity-123',
          schema_id: 'organization',
        }),
      });

      // Mock Kratos: Create person identity (fail)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: { message: 'identity with this email already exists' },
        }),
      });

      // Mock Kratos: Delete organization identity (rollback)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('An account with this contact email already exists.');

      // Verify rollback was called
      expect(global.fetch).toHaveBeenCalledWith(
        `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/org-identity-123`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('ควร rollback ทั้ง 2 identities เมื่อ profile creation ล้มเหลว', async () => {
      // Mock OTP validation
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { valid: true } }),
        });

      // Mock Kratos: Create organization identity
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'org-identity-123',
          schema_id: 'organization',
        }),
      });

      // Mock Kratos: Create person identity
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'person-identity-456',
          schema_id: 'person',
        }),
      });

      // Mock Backend: Profile creation fails (duplicate tax ID)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'tax ID already exists',
        }),
      });

      // Mock Kratos: Delete person identity (rollback)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      // Mock Kratos: Delete organization identity (rollback)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('tax ID already exists');

      // Verify both rollbacks were called
      expect(global.fetch).toHaveBeenCalledWith(
        `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/person-identity-456`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(
        `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/org-identity-123`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('ควรคืน 500 เมื่อเกิด error ไม่คาดคิด', async () => {
      // Mock request.json() to throw error (parse error)
      const request = new NextRequest('http://localhost:3000/api/auth/register-organization', {
        method: 'POST',
        body: 'invalid-json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Registration failed. Please try again.');
    });
  });
});
