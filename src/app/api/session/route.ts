import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session-store';
import { verifyCookie } from '@/lib/crypto-utils';

/**
 * GET /api/session
 *
 * BFF Pattern: ดึง session data จาก server-side session store
 * Browser ไม่เห็น tokens (access_token, id_token, refresh_token)
 *
 * Security:
 * - OWASP A02: Tokens ไม่อยู่ใน cookie (เก็บ server-side)
 * - OWASP A05: httpOnly, secure, sameSite cookies
 * - OWASP A07: Session validation
 * - Banking: Cookie signature verification
 */
export async function GET(request: NextRequest) {
  try {
    // อ่าน session cookie (httpOnly, secure, sameSite=strict)
    const signedSessionId = request.cookies.get('excise_session')?.value;

    if (!signedSessionId) {
      return NextResponse.json(
        { authenticated: false, error: 'No session' },
        { status: 401 }
      );
    }

    // Verify cookie signature (Banking: ป้องกัน tampering)
    const sessionId = verifyCookie(signedSessionId);

    if (!sessionId) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // ดึง session data จาก server-side store (async)
    const session = await getSession(sessionId);

    if (!session) {
      // Session หมดอายุหรือไม่มี - clear cookie
      const response = NextResponse.json(
        { authenticated: false, error: 'Session expired' },
        { status: 401 }
      );

      response.cookies.set('excise_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    // ตรวจสอบว่า token ยังใช้งานได้หรือไม่ (optional: introspect token)
    // สามารถเพิ่ม token introspection ได้ที่นี่

    // ส่งข้อมูลกลับ (ไม่รวม tokens)
    return NextResponse.json({
      authenticated: true,
      expires_at: session.expires_at,
    });
  } catch (error) {
    console.error('[session] Error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
