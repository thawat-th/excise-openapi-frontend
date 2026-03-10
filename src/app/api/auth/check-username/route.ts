import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';

/**
 * POST /api/auth/check-username
 * Check if username already exists in Kratos
 *
 * Request: { "username": "johndoe" }
 * Response: { "exists": true/false }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    // Validate username format
    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid username format.' },
        { status: 400 }
      );
    }

    // Normalize username to lowercase for case-insensitive check
    const normalizedUsername = username.toLowerCase().trim();

    console.log('[check-username] Checking username:', normalizedUsername);

    // Search Kratos identities for matching username
    // First try credentials_identifier search (since username is an identifier)
    const searchUrl = `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities?credentials_identifier=${encodeURIComponent(normalizedUsername)}`;

    let response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const identities = await response.json();
      if (identities && identities.length > 0) {
        return NextResponse.json({
          exists: true,
          message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว',
          messageEn: 'This username is already taken.',
        });
      }
    }

    // Also search by listing identities and checking traits
    // This is a fallback to ensure we catch all cases
    const listUrl = `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities?per_page=250`;
    response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const identities = await response.json();

      // Check if any identity has matching username trait (case-insensitive)
      const found = identities.some((identity: any) => {
        const identityUsername = identity.traits?.username?.toLowerCase();
        return identityUsername === normalizedUsername;
      });

      if (found) {
        return NextResponse.json({
          exists: true,
          message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว',
          messageEn: 'This username is already taken.',
        });
      }
    }

    // Not found - username is available
    return NextResponse.json({
      exists: false,
      message: 'ชื่อผู้ใช้นี้สามารถใช้งานได้',
      messageEn: 'This username is available.',
    });

  } catch (error) {
    console.error('[check-username] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check username. Please try again.' },
      { status: 500 }
    );
  }
}
