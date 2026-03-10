import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/webauthn-login
 * Initialize WebAuthn login flow
 * Returns WebAuthn public key challenge options
 */
export async function GET(request: NextRequest) {
  try {
    const loginChallenge = request.nextUrl.searchParams.get('login_challenge');

    if (!loginChallenge) {
      return NextResponse.json(
        { error: 'Missing login_challenge parameter' },
        { status: 400 }
      );
    }

    // In a production setup, you would:
    // 1. Call Kratos self-service login flow with webauthn method
    // 2. Extract the WebAuthn public key options
    // 3. Return them to the frontend

    // For now, return a mock response structure
    // This would be replaced with actual Kratos integration
    const webauthnOptions = {
      challenge: Buffer.from('challenge-123').toString('base64url'),
      timeout: 60000,
      rpId: process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost',
      allowCredentials: [],
      userVerification: 'preferred',
    };

    return NextResponse.json({
      webauthn_options: webauthnOptions,
      flow_id: loginChallenge,
    });
  } catch (error) {
    console.error('WebAuthn login initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize WebAuthn login' },
      { status: 500 }
    );
  }
}
