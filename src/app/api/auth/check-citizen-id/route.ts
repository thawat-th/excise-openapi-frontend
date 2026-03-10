import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_ADMIN_URL = process.env.IDENTITY_INTERNAL_ADMIN_URL || 'http://identity:4434';

/**
 * POST /api/auth/check-citizen-id
 * Check if citizen ID already exists in Kratos
 *
 * Request: { "citizenId": "1234567890123" }
 * Response: { "exists": true/false }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { citizenId } = body;

    // Validate citizen ID format
    if (!citizenId || !/^[0-9]{13}$/.test(citizenId)) {
      return NextResponse.json(
        { error: 'Invalid citizen ID format. Must be 13 digits.' },
        { status: 400 }
      );
    }

    // Search Kratos identities for matching citizen_id trait
    // Using Kratos Admin API to list identities and filter
    const searchUrl = `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities?credentials_identifier=${encodeURIComponent(citizenId)}`;

    // First try credentials_identifier search
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
          message: 'เลขประจำตัวประชาชนนี้ถูกใช้ลงทะเบียนแล้ว',
          messageEn: 'This citizen ID is already registered.',
        });
      }
    }

    // Also search by listing all identities and checking traits
    // This is a fallback since citizen_id might not be a credentials_identifier
    const listUrl = `${IDENTITY_INTERNAL_ADMIN_URL}/admin/identities?per_page=250`;
    response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const identities = await response.json();

      // Check if any identity has matching citizen_id trait
      const found = identities.some((identity: any) => {
        return identity.traits?.citizen_id === citizenId;
      });

      if (found) {
        return NextResponse.json({
          exists: true,
          message: 'เลขประจำตัวประชาชนนี้ถูกใช้ลงทะเบียนแล้ว',
          messageEn: 'This citizen ID is already registered.',
        });
      }
    }

    // Not found
    return NextResponse.json({
      exists: false,
    });

  } catch (error) {
    console.error('[check-citizen-id] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check citizen ID. Please try again.' },
      { status: 500 }
    );
  }
}
