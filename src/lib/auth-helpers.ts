import { NextRequest } from 'next/server';
import { getKratosSessionToken } from './session-helpers';

const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const PERMISSION_INTERNAL_READ_URL = process.env.PERMISSION_INTERNAL_READ_URL || 'http://permission:4466';

/**
 * Get user session from Kratos using Public API with X-Session-Token header
 * BFF Pattern: Get session token from server-side Redis session
 */
export async function getUserSession(request: NextRequest) {
  // BFF Pattern: Get from Redis session store, not cookies
  const sessionToken = await getKratosSessionToken(request);

  if (!sessionToken) {
    return null;
  }

  try {
    // Use Kratos Public API with X-Session-Token header (same as middleware)
    const response = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': sessionToken,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[getUserSession] Error:', error);
    return null;
  }
}

/**
 * Check user permission with Keto
 */
export async function checkPermission(
  userId: string,
  namespace: string,
  object: string,
  relation: string
): Promise<boolean> {
  try {
    const response = await fetch(`${PERMISSION_INTERNAL_READ_URL}/relation-tuples/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespace,
        object,
        relation,
        subject_id: userId,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.allowed === true;
  } catch (error) {
    console.error('[checkPermission] Error:', error);
    return false;
  }
}
