import { NextRequest, NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/lib/session-store';
import { revokeRefreshToken } from '@/lib/token-refresh';
import { verifyCookie } from '@/lib/crypto-utils';

/**
 * POST /api/auth/logout
 *
 * BFF Pattern: Logout ด้วยการลบ server-side session
 * และ revoke OAuth2 tokens
 *
 * Security:
 * - OWASP A02: Tokens ไม่อยู่ใน cookie
 * - OWASP A07: Session management - ลบ session เมื่อ logout
 * - Banking: Revoke refresh_token เพื่อป้องกันการใช้งานต่อ
 */
export async function POST(request: NextRequest) {
  try {
    // อ่าน session cookie
    const signedSessionId = request.cookies.get('gov_iam_session')?.value;

    if (!signedSessionId) {
      return NextResponse.json(
        { error: 'No session' },
        { status: 401 }
      );
    }

    // Verify cookie signature (Banking: ป้องกัน tampering)
    const sessionId = verifyCookie(signedSessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // ดึง session data (เพื่อเอา tokens ไป revoke)
    const session = await getSession(sessionId);

    if (session && session.refresh_token) {
      // Banking/Government: Revoke refresh token เพื่อป้องกันการใช้งานต่อ
      try {
        await revokeRefreshToken(session.refresh_token);
        console.log('[logout] Revoked refresh token');
      } catch (error) {
        console.error('[logout] Failed to revoke refresh token:', error);
        // ไม่ throw error - ให้ logout ต่อไป
      }
    }

    // ลบ session จาก server-side store
    await deleteSession(sessionId);

    // Clear session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('gov_iam_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    console.log('[logout] Logout successful');
    return response;
  } catch (error) {
    console.error('[logout] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
