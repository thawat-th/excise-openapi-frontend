import { NextRequest, NextResponse } from 'next/server';
import { extractErrorMessage, extractErrorCode, extractTraceId, formatErrorForLogging } from '@/lib/api-error-handler';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

// Input sanitization helper (A03: Injection Prevention)
function sanitizeString(input: string | undefined, maxLength: number = 255): string {
  if (!input) return '';
  return input
    .toString()
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, ''); // Remove potential XSS chars
}

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate corporate email (no personal domains)
function isCorporateEmail(email: string): boolean {
  const personalDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'protonmail.com'];
  const domain = email.toLowerCase().split('@')[1];
  return !personalDomains.includes(domain);
}

// Validate Thai Tax ID (13 digits with checksum)
function isValidTaxId(taxId: string): boolean {
  if (!/^\d{13}$/.test(taxId)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(taxId[i]) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(taxId[12]);
}

// Validate Thai Citizen ID (13 digits with checksum)
function isValidCitizenId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(id[12]);
}

// Validate mobile format (Thai mobile number)
function isValidMobile(mobile: string): boolean {
  return /^0[689]\d{8}$/.test(mobile);
}

// Validate password strength
function isStrongPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, error: 'Password must contain lowercase letter' };
  if (!/\d/.test(password)) return { valid: false, error: 'Password must contain a number' };
  return { valid: true };
}

// Validate verification token via Go service
async function validateVerificationToken(email: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${GOVERNANCE_API_URL}/v1/otp/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, verificationToken: token }),
    });

    if (!response.ok) return false;

    const result = await response.json();
    return result.success && result.data?.valid === true;
  } catch (error) {
    console.error('[register-organization] Error validating token:', error);
    return false;
  }
}

// Consume verification token via Go service (one-time use)
async function consumeVerificationToken(email: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${GOVERNANCE_API_URL}/v1/otp/consume-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, verificationToken: token }),
    });

    if (!response.ok) return false;

    const result = await response.json();
    return result.success && result.data?.consumed === true;
  } catch (error) {
    console.error('[register-organization] Error consuming token:', error);
    return false;
  }
}

/**
 * POST /api/auth/register-organization
 * Phase 1.5 Organization Registration (2 identities flow)
 *
 * Expected payload:
 * {
 *   "orgEmail": "contact@company.com",
 *   "orgVerificationToken": "token-from-otp-verify",
 *   "orgName": "บริษัท ตัวอย่าง จำกัด",
 *   "taxId": "1234567890123",
 *
 *   "contactEmail": "person@company.com",
 *   "contactVerificationToken": "token-from-otp-verify",
 *   "contactPassword": "SecurePass123!",
 *   "contactFirstName": "John",
 *   "contactLastName": "Doe",
 *   "contactCitizenId": "1234567890123",
 *   "contactMobile": "0812345678",
 *   "contactBirthdate": "1990-01-01"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orgEmail,
      orgVerificationToken,
      orgName,
      taxId,
      contactEmail,
      contactVerificationToken,
      contactPassword,
      contactFirstName,
      contactLastName,
      contactCitizenId,
      contactMobile,
      contactBirthdate,
    } = body;

    // Validate required fields
    if (!orgEmail || !orgVerificationToken || !orgName || !taxId) {
      return NextResponse.json(
        { error: 'Organization email, verification token, name, and tax ID are required' },
        { status: 400 }
      );
    }

    if (!contactEmail || !contactVerificationToken || !contactPassword || !contactFirstName || !contactLastName || !contactCitizenId || !contactMobile) {
      return NextResponse.json(
        { error: 'Contact person email, verification token, password, name, citizen ID, and mobile are required' },
        { status: 400 }
      );
    }

    // A03: Validate and sanitize all inputs
    const normalizedOrgEmail = orgEmail.toLowerCase().trim();
    if (!isValidEmail(normalizedOrgEmail)) {
      return NextResponse.json(
        { error: 'Invalid organization email format' },
        { status: 400 }
      );
    }

    // Organization email MUST be corporate (not personal domain)
    if (!isCorporateEmail(normalizedOrgEmail)) {
      return NextResponse.json(
        { error: 'Organization email must be a corporate domain (not gmail, hotmail, etc.)' },
        { status: 400 }
      );
    }

    const normalizedContactEmail = contactEmail.toLowerCase().trim();
    if (!isValidEmail(normalizedContactEmail)) {
      return NextResponse.json(
        { error: 'Invalid contact email format' },
        { status: 400 }
      );
    }

    // Validate tax ID
    const cleanedTaxId = taxId.replace(/\D/g, '');
    if (!isValidTaxId(cleanedTaxId)) {
      return NextResponse.json(
        { error: 'Invalid tax ID format' },
        { status: 400 }
      );
    }

    // Validate contact citizen ID
    const cleanedCitizenId = contactCitizenId.replace(/\D/g, '');
    if (!isValidCitizenId(cleanedCitizenId)) {
      return NextResponse.json(
        { error: 'Invalid citizen ID format' },
        { status: 400 }
      );
    }

    // Validate contact mobile
    const cleanedMobile = contactMobile.replace(/\D/g, '');
    if (!isValidMobile(cleanedMobile)) {
      return NextResponse.json(
        { error: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    // Validate contact password strength
    const passwordCheck = isStrongPassword(contactPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.error },
        { status: 400 }
      );
    }

    // Validate organization email verification token
    const isOrgTokenValid = await validateVerificationToken(normalizedOrgEmail, orgVerificationToken);
    if (!isOrgTokenValid) {
      console.warn(`[Security] Invalid verification token attempt for organization ${normalizedOrgEmail}`);
      return NextResponse.json(
        { error: 'Invalid or expired organization verification token. Please verify your email again.', code: 'invalid_token' },
        { status: 400 }
      );
    }

    // Validate contact email verification token
    const isContactTokenValid = await validateVerificationToken(normalizedContactEmail, contactVerificationToken);
    if (!isContactTokenValid) {
      console.warn(`[Security] Invalid verification token attempt for contact ${normalizedContactEmail}`);
      return NextResponse.json(
        { error: 'Invalid or expired contact verification token. Please verify your email again.', code: 'invalid_token' },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    const firstName = sanitizeString(contactFirstName, 100);
    const lastName = sanitizeString(contactLastName, 100);
    const fullName = `${firstName} ${lastName}`.trim();
    const organizationName = sanitizeString(orgName, 200);

    try {
      // Step 1: Create Organization Identity in Kratos (schema: organization, NO credentials)
      const orgIdentityPayload = {
        schema_id: 'organization',
        traits: {
          email: normalizedOrgEmail,
          name: organizationName,
        },
        verifiable_addresses: [
          {
            value: normalizedOrgEmail,
            verified: true,
            via: 'email',
            status: 'completed',
          },
        ],
        state: 'active',
      };

      console.log('[register-organization] Creating organization identity via Kratos Admin API');

      const orgResponse = await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgIdentityPayload),
      });

      const orgResult = await orgResponse.json();

      if (!orgResponse.ok) {
        console.error('[register-organization] Kratos error (organization):', orgResult);

        if (orgResult.error?.message?.includes('already exists')) {
          return NextResponse.json(
            { error: 'An organization with this email already exists.' },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { error: orgResult.error?.message || 'Organization identity creation failed' },
          { status: orgResponse.status }
        );
      }

      const orgIdentityId = orgResult.id;
      console.log('[register-organization] Organization identity created:', orgIdentityId);

      // Step 2: Create Person Identity in Kratos (schema: person, WITH credentials)
      const personIdentityPayload = {
        schema_id: 'person',
        traits: {
          email: normalizedContactEmail,
          name: fullName,
          given_name: firstName,
          family_name: lastName,
        },
        credentials: {
          password: {
            config: {
              password: contactPassword,
            },
          },
        },
        verifiable_addresses: [
          {
            value: normalizedContactEmail,
            verified: true,
            via: 'email',
            status: 'completed',
          },
        ],
        state: 'active',
      };

      console.log('[register-organization] Creating person identity via Kratos Admin API');

      const personResponse = await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personIdentityPayload),
      });

      const personResult = await personResponse.json();

      if (!personResponse.ok) {
        console.error('[register-organization] Kratos error (person):', personResult);

        // Rollback: Delete organization identity if person creation fails
        try {
          await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${orgIdentityId}`, {
            method: 'DELETE',
          });
          console.log('[register-organization] Rolled back organization identity');
        } catch (rollbackError) {
          console.error('[register-organization] Failed to rollback organization identity:', rollbackError);
        }

        if (personResult.error?.message?.includes('already exists')) {
          return NextResponse.json(
            { error: 'An account with this contact email already exists.' },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { error: personResult.error?.message || 'Contact person identity creation failed' },
          { status: personResponse.status }
        );
      }

      const personIdentityId = personResult.id;
      console.log('[register-organization] Person identity created:', personIdentityId);

      // Step 3: Create profiles and link them via Backend API (transactional)
      try {
        const profilePayload = {
          org_identity_id: orgIdentityId,
          org_email: normalizedOrgEmail,
          org_name: organizationName,
          tax_id: cleanedTaxId,
          primary_contact_identity_id: personIdentityId,
          primary_contact_email: normalizedContactEmail,
          primary_contact_full_name: fullName,
          primary_contact_first_name: firstName,
          primary_contact_last_name: lastName,
          primary_contact_citizen_id: cleanedCitizenId,
          primary_contact_mobile: cleanedMobile,
          primary_contact_birthdate: contactBirthdate || undefined,
        };

        const profileResponse = await fetch(`${GOVERNANCE_API_URL}/v1/profiles/organization`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profilePayload),
        });

        const profileResult = await profileResponse.json();

        if (!profileResponse.ok) {
          const errorMessage = extractErrorMessage(profileResult);
          const errorCode = extractErrorCode(profileResult);
          const traceId = extractTraceId(profileResult);

          console.error(formatErrorForLogging(profileResult, 'register-organization'));

          // Rollback: Delete both identities if profile creation fails
          try {
            await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${personIdentityId}`, {
              method: 'DELETE',
            });
            await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${orgIdentityId}`, {
              method: 'DELETE',
            });
            console.log('[register-organization] Rolled back both identities');
          } catch (rollbackError) {
            console.error('[register-organization] Failed to rollback identities:', rollbackError);
          }

          return NextResponse.json(
            {
              error: errorMessage || 'Failed to create organization profiles',
              code: errorCode,
              trace_id: traceId
            },
            { status: profileResponse.status }
          );
        }

        console.log('[register-organization] Profiles created and linked successfully');

        // Consume verification tokens (one-time use) - fire and forget
        consumeVerificationToken(normalizedOrgEmail, orgVerificationToken).catch((err) => {
          console.error('[register-organization] Failed to consume org token:', err);
        });
        consumeVerificationToken(normalizedContactEmail, contactVerificationToken).catch((err) => {
          console.error('[register-organization] Failed to consume contact token:', err);
        });

        return NextResponse.json({
          success: true,
          message: 'Organization registration successful',
          organization: {
            identityId: orgIdentityId,
            email: normalizedOrgEmail,
            name: organizationName,
          },
          contact: {
            identityId: personIdentityId,
            email: normalizedContactEmail,
            name: fullName,
          },
        });
      } catch (profileError: any) {
        console.error('[register-organization] Profile API error:', profileError);

        // Rollback: Delete both identities
        try {
          await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${personIdentityId}`, {
            method: 'DELETE',
          });
          await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${orgIdentityId}`, {
            method: 'DELETE',
          });
          console.log('[register-organization] Rolled back both identities');
        } catch (rollbackError) {
          console.error('[register-organization] Failed to rollback identities:', rollbackError);
        }

        return NextResponse.json(
          { error: 'Failed to create organization profiles. Please try again.' },
          { status: 500 }
        );
      }
    } catch (kratosError: any) {
      console.error('[register-organization] Kratos API error:', kratosError);

      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[register-organization] Error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
