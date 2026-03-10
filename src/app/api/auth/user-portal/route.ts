import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokens } from '@/lib/session-helpers';

// Keto Read API (internal Docker network)
const PERMISSION_INTERNAL_READ_URL = process.env.PERMISSION_INTERNAL_READ_URL || 'http://permission:4466';

/**
 * GET /api/auth/user-portal
 *
 * Determine user's portal based on Keto roles
 * Priority: platform-admin > organization > individual
 */
export async function GET(request: NextRequest) {
  try {
    // Get user_id from BFF session
    const tokens = await getSessionTokens(request);

    if (!tokens || !tokens.user_id) {
      return NextResponse.json(
        { error: 'Not authenticated or user_id not found' },
        { status: 401 }
      );
    }

    const userId = tokens.user_id;

    console.log('[user-portal] Checking roles for user:', userId);

    // Check roles in priority order: platform-admin > organization > individual
    const isPlatformAdmin = await checkUserRole(userId, 'platform_admin');
    if (isPlatformAdmin) {
      console.log('[user-portal] User is platform-admin');
      return NextResponse.json({ portal: 'platform-admin', role: 'platform_admin' });
    }

    const isOrganization = await checkUserRole(userId, 'organization');
    if (isOrganization) {
      console.log('[user-portal] User is organization');
      return NextResponse.json({ portal: 'organization', role: 'organization' });
    }

    // Default to individual
    console.log('[user-portal] User is individual (default)');
    return NextResponse.json({ portal: 'individual', role: 'individual' });

  } catch (error) {
    console.error('[user-portal] Error:', error);
    return NextResponse.json(
      { error: 'Failed to determine user portal' },
      { status: 500 }
    );
  }
}

/**
 * Check if user has specific role in Keto
 */
async function checkUserRole(userId: string, role: string): Promise<boolean> {
  try {
    const response = await fetch(`${PERMISSION_INTERNAL_READ_URL}/relation-tuples/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespace: 'Role',
        object: role,
        relation: 'member',
        subject_id: userId,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.allowed === true;
    }

    return false;
  } catch (error) {
    console.error('[user-portal] Keto check error for role', role, ':', error);
    return false;
  }
}
