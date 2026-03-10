import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

// Internal Docker URLs for server-side calls
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

/**
 * GET /api/account/profile
 * Get current user profile from Kratos session
 * BFF Pattern: Use kratos_session_token from Redis session
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[profile][DEBUG] ========== GET PROFILE START ==========');
    console.log('[profile][DEBUG] Request URL:', request.url);
    console.log('[profile][DEBUG] IDENTITY_INTERNAL_URL:', IDENTITY_INTERNAL_URL);

    // BFF Pattern: Get kratos_session_token from Redis session
    const kratosSessionToken = await getKratosSessionToken(request);
    console.log('[profile][DEBUG] kratosSessionToken:', kratosSessionToken ? `${kratosSessionToken.substring(0, 20)}...` : 'null');

    if (!kratosSessionToken) {
      console.warn('[profile][WARN] No kratos_session_token found - returning 401');
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get user session from Kratos
    console.log('[profile][DEBUG] Calling Kratos whoami:', `${IDENTITY_INTERNAL_URL}/sessions/whoami`);
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
      },
    });

    console.log('[profile][DEBUG] Kratos response status:', whoamiResponse.status);
    if (!whoamiResponse.ok) {
      console.warn('[profile][WARN] Kratos whoami failed - status:', whoamiResponse.status);
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();
    const identity = session.identity;

    if (!identity) {
      return NextResponse.json(
        { error: 'Could not get identity' },
        { status: 500 }
      );
    }

    // Return user profile data from Kratos session
    return NextResponse.json({
      id: identity.id,
      email: identity.traits?.email || '',
      firstName: identity.traits?.first_name || '',
      lastName: identity.traits?.last_name || '',
      mobile: identity.traits?.mobile || '',
      emailVerified: identity.verifiable_addresses?.some(
        (addr: { value: string; verified: boolean }) =>
          addr.value === identity.traits?.email && addr.verified
      ) || false,
      avatar: identity.metadata_public?.avatar || '',
      createdAt: identity.created_at || '',
      updatedAt: identity.updated_at || '',
    });
  } catch (error) {
    console.error('[GET profile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/profile
 * Update user profile information via Kratos settings flow
 * BFF Pattern: Use kratos_session_token from Redis session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, mobile } = body;

    // BFF Pattern: Get kratos_session_token from Redis session
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Initialize settings flow
    const flowResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings/api`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
      }
    );

    if (!flowResponse.ok) {
      if (flowResponse.status === 401) {
        return NextResponse.json(
          { error: 'Session expired. Please log in again.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to initialize settings flow' },
        { status: 500 }
      );
    }

    const flow = await flowResponse.json();

    // Build traits object
    const traits: Record<string, any> = {};
    if (email) traits.email = email;
    if (firstName) traits.first_name = firstName;
    if (lastName) traits.last_name = lastName;
    if (mobile) traits.mobile = mobile;

    // Submit settings flow with profile updates
    const submitResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings?flow=${flow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
        body: JSON.stringify({
          method: 'profile',
          traits: traits,
        }),
      }
    );

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json();
      console.error('Kratos settings error:', errorData);

      // Handle validation errors from Kratos
      if (errorData.ui?.messages) {
        const messages = errorData.ui.messages;
        if (Array.isArray(messages) && messages.length > 0) {
          return NextResponse.json(
            { error: messages[0].text || 'Profile update failed' },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 400 }
      );
    }

    const result = await submitResponse.json();

    // Return success (no cookie manipulation in BFF pattern)
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      identity: result.identity,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
