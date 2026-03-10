import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const GOVERNANCE_API_URL = process.env.GOVERNANCE_API_URL || 'http://api-governance-service:5001';

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
    console.error('[register] Error validating token:', error);
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
    console.error('[register] Error consuming token:', error);
    return false;
  }
}

/**
 * POST /api/auth/register
 * Handle user registration with pre-verified email
 *
 * Expected payload:
 * {
 *   "email": "user@example.com",
 *   "verificationToken": "token-from-otp-verify",
 *   "password": "SecurePass123!",
 *   "traits": {
 *     "email": "user@example.com",
 *     "first_name": "John",
 *     "last_name": "Doe",
 *     "citizen_id": "1234567890123",
 *     "mobile": "0812345678",
 *     "birthdate": "1990-01-01",
 *     "address": "123 Main St",
 *     "occupation": "Engineer"
 *   }
 * }
 */
// Input sanitization helper (A03: Injection Prevention)
function sanitizeString(input: string | undefined, maxLength: number = 255): string {
  if (!input) return '';
  return input
    .toString()
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, ''); // Remove potential XSS chars
}

// Validate citizen ID format (13 digits, Thai national ID)
function isValidCitizenId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  // Checksum validation (Thai national ID algorithm)
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

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate password strength
function isStrongPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, error: 'Password must contain lowercase letter' };
  if (!/\d/.test(password)) return { valid: false, error: 'Password must contain a number' };
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationToken, password, traits } = body;

    // Validate required fields
    if (!email || !verificationToken || !password || !traits) {
      return NextResponse.json(
        { error: 'Email, verification token, password, and traits are required' },
        { status: 400 }
      );
    }

    // A03: Validate and sanitize all inputs
    const normalizedEmail = email.toLowerCase().trim();
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.error },
        { status: 400 }
      );
    }

    // Validate citizen ID
    const citizenId = traits.citizen_id?.replace(/\D/g, '');
    if (!citizenId || !isValidCitizenId(citizenId)) {
      return NextResponse.json(
        { error: 'Invalid citizen ID format' },
        { status: 400 }
      );
    }

    // Validate mobile
    const mobile = traits.mobile?.replace(/\D/g, '');
    if (!mobile || !isValidMobile(mobile)) {
      return NextResponse.json(
        { error: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    // Validate verification token (proves email was verified via OTP)
    const isTokenValid = await validateVerificationToken(normalizedEmail, verificationToken);
    if (!isTokenValid) {
      console.warn(`[Security] Invalid verification token attempt for ${normalizedEmail}`);
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please verify your email again.', code: 'invalid_token' },
        { status: 400 }
      );
    }

    // Validate username if provided (optional field)
    let normalizedUsername: string | undefined = undefined;
    if (traits.username && traits.username.trim()) {
      const usernameValue = traits.username.toLowerCase().trim();
      // Basic validation: 3-20 chars, alphanumeric + underscore/hyphen
      if (usernameValue.length < 3 || usernameValue.length > 20) {
        return NextResponse.json(
          { error: 'Username must be between 3-20 characters' },
          { status: 400 }
        );
      }
      if (!/^[a-z][a-z0-9_-]*[a-z0-9]$|^[a-z]$/.test(usernameValue)) {
        return NextResponse.json(
          { error: 'Invalid username format' },
          { status: 400 }
        );
      }
      normalizedUsername = usernameValue;
    }

    // Sanitize all string inputs for Kratos traits (OIDC standard claims only)
    const firstName = sanitizeString(traits.first_name, 100);
    const lastName = sanitizeString(traits.last_name, 100);
    const fullName = `${firstName} ${lastName}`.trim();

    const kratosTraits = {
      email: normalizedEmail,
      username: normalizedUsername,
      name: fullName,
      given_name: firstName,
      family_name: lastName,
    };

    // Business data for IndividualProfile (stored separately)
    const businessData = {
      citizen_id: citizenId,
      mobile: mobile,
      birthdate: traits.birthdate ? sanitizeString(traits.birthdate, 10) : undefined,
      address: traits.address ? sanitizeString(traits.address, 500) : undefined,
      occupation: traits.occupation ? sanitizeString(traits.occupation, 100) : undefined,
    };

    try {
      // Use Kratos Admin API to create identity directly (since email is pre-verified)
      const identityPayload = {
        schema_id: 'person',
        traits: kratosTraits,
        credentials: {
          password: {
            config: {
              password: password,
            },
          },
        },
        verifiable_addresses: [
          {
            value: normalizedEmail,
            verified: true, // Pre-verified via OTP
            via: 'email',
            status: 'completed',
          },
        ],
        state: 'active',
      };

      console.log('[register] Creating identity via Kratos Admin API');

      const response = await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(identityPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[register] Kratos error:', result);

        // Handle specific errors
        if (result.error?.message?.includes('already exists')) {
          return NextResponse.json(
            { error: 'An account with this email already exists.' },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { error: result.error?.message || 'Registration failed' },
          { status: response.status }
        );
      }

      console.log('[register] Identity created successfully:', result.id);

      // Create IndividualProfile in business database
      try {
        const profileResponse = await fetch(`${GOVERNANCE_API_URL}/v1/profiles/individual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity_id: result.id,
            email: normalizedEmail,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            citizen_id: citizenId,
            mobile: mobile,
            birthdate: businessData.birthdate,
            address_line1: businessData.address,
            occupation: businessData.occupation,
          }),
        });

        if (!profileResponse.ok) {
          const profileError = await profileResponse.text();
          console.error('[register] Failed to create IndividualProfile:', profileError);
          // Note: Identity already created in Kratos, but profile creation failed
          // This is acceptable - profile can be created later via admin intervention
        } else {
          console.log('[register] IndividualProfile created successfully');
        }
      } catch (profileError) {
        console.error('[register] Error creating IndividualProfile:', profileError);
        // Continue with registration - profile creation failure should not block user
      }

      // Consume verification token (one-time use) - fire and forget
      consumeVerificationToken(normalizedEmail, verificationToken).catch((err) => {
        console.error('[register] Failed to consume token:', err);
      });

      // Send welcome email (fire-and-forget)
      sendWelcomeEmail(email, firstName, lastName).catch((err) => {
        console.error('[register] Failed to send welcome email:', err);
      });

      // Audit log registration success (fire-and-forget)
      auditRegisterSuccess(result.id, email, fullName).catch((err) => {
        console.error('[register] Failed to log audit:', err);
      });

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        identity: {
          id: result.id,
          email: email,
        },
      });
    } catch (kratosError: any) {
      console.error('[register] Kratos API error:', kratosError);

      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[register] Error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Send welcome email via Go API
async function sendWelcomeEmail(email: string, firstName: string, lastName: string): Promise<void> {
  console.log(`[register] Sending welcome email via Go API: ${GOVERNANCE_API_URL}`);

  const response = await fetch(`${GOVERNANCE_API_URL}/v1/email/welcome`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, firstName, lastName }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send welcome email: ${error}`);
  }

  console.log(`[register] Welcome email queued for ${email}`);
}

// Audit log registration success via Go API
async function auditRegisterSuccess(identityId: string, email: string, fullName: string): Promise<void> {
  const response = await fetch(`${GOVERNANCE_API_URL}/v1/audit/individual/register-success`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identityId, email, fullName }),
  });

  if (!response.ok) {
    throw new Error(`Failed to log audit: ${response.status}`);
  }

  console.log(`[register] Audit logged for ${email}`);
}
