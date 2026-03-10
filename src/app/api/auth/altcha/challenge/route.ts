import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Force dynamic - prevent Next.js from caching this route at ALL levels
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// Secret key for HMAC (in production, use env variable)
const HMAC_KEY = process.env.ALTCHA_HMAC_KEY || 'altcha-secret-key-change-in-production';

// Challenge complexity (higher = more computation required)
const MAX_NUMBER = 100000;

export async function GET(request: NextRequest) {
  // Access request properties to force dynamic rendering
  const timestamp = Date.now();
  const requestId = `${new URL(request.url).pathname}-${timestamp}`;

  try {
    // Generate random salt (include requestId to ensure uniqueness)
    const salt = crypto.randomBytes(12).toString('hex');

    // Generate random secret number
    const secretNumber = Math.floor(Math.random() * MAX_NUMBER);

    // Add expiration (5 minutes from now)
    const expires = Math.floor(Date.now() / 1000) + 300;
    const saltWithExpires = `${salt}?expires=${expires}`;

    // Create challenge hash: SHA-256(salt + secretNumber)
    const challenge = crypto
      .createHash('sha256')
      .update(saltWithExpires + secretNumber)
      .digest('hex');

    // Create signature: HMAC-SHA256(challenge)
    const signature = crypto
      .createHmac('sha256', HMAC_KEY)
      .update(challenge)
      .digest('hex');

    return NextResponse.json(
      {
        algorithm: 'SHA-256',
        challenge,
        maxnumber: MAX_NUMBER,
        salt: saltWithExpires,
        signature,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Request-Id': requestId,
        },
      }
    );
  } catch (error) {
    console.error('[ALTCHA] Error generating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}
