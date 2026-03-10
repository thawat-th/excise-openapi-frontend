import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 150 * 1024; // 150KB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Internal Docker URLs for server-side calls
const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

/**
 * POST /api/account/avatar
 * Upload user avatar (stored as base64 in Kratos metadata)
 * BFF Pattern: Use kratos_session_token from Redis session
 */
export async function POST(request: NextRequest) {
  try {
    // BFF Pattern: Get kratos_session_token from Redis session
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get user session from Kratos
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
      },
    });

    if (!whoamiResponse.ok) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();
    const identityId = session.identity?.id;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG or GIF allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 150KB allowed.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Get current identity from Kratos
    const identityResponse = await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!identityResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get identity' },
        { status: 500 }
      );
    }

    const identity = await identityResponse.json();

    // Update identity with avatar in metadata_public
    const updateResponse = await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schema_id: identity.schema_id,
        traits: identity.traits,
        metadata_public: {
          ...identity.metadata_public,
          avatar: base64,
        },
        state: identity.state,
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Kratos update error:', errorData);
      return NextResponse.json(
        { error: 'Failed to update avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar: base64,
    });
  } catch (error) {
    console.error('[POST avatar] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/avatar
 * Remove user avatar
 * BFF Pattern: Use kratos_session_token from Redis session
 */
export async function DELETE(request: NextRequest) {
  try {
    // BFF Pattern: Get kratos_session_token from Redis session
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get user session from Kratos
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
      },
    });

    if (!whoamiResponse.ok) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();
    const identityId = session.identity?.id;

    // Get current identity from Kratos
    const identityResponse = await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!identityResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get identity' },
        { status: 500 }
      );
    }

    const identity = await identityResponse.json();

    // Remove avatar from metadata_public
    const { avatar, ...restMetadata } = identity.metadata_public || {};

    // Update identity without avatar
    const updateResponse = await fetch(`${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities/${identityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schema_id: identity.schema_id,
        traits: identity.traits,
        metadata_public: restMetadata,
        state: identity.state,
      }),
    });

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to remove avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[DELETE avatar] Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}
