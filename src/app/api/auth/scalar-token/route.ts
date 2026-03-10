import { getKratosSessionToken } from '@/lib/session-helpers'
import { NextRequest, NextResponse } from 'next/server'

const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433'

/**
 * GET /api/auth/scalar-token
 * Get session token for Scalar API Reference
 * Used to auto-inject Bearer token in API Documentation
 */
export async function GET(request: NextRequest) {
  try {
    // Get kratos_session_token from Redis session
    const kratosSessionToken = await getKratosSessionToken(request)

    if (!kratosSessionToken) {
      return NextResponse.json(
        { token: null, error: 'No session' },
        { status: 401 }
      )
    }

    // Verify session is still active
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: {
        'X-Session-Token': kratosSessionToken,
      },
    })

    if (!whoamiResponse.ok) {
      return NextResponse.json(
        { token: null, error: 'Session expired' },
        { status: 401 }
      )
    }

    const session = await whoamiResponse.json()

    // Return session token for Scalar
    // Scalar will use this as Bearer token in Authorization header
    return NextResponse.json({
      token: kratosSessionToken,
      identity_id: session.identity?.id,
      email: session.identity?.traits?.email,
      expires_at: session.expires_at,
    })
  } catch (error) {
    console.error('[scalar-token] Error:', error)
    return NextResponse.json(
      { token: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
