import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const TOTP_ISSUER = 'Excise OpenAPI';

/**
 * POST /api/account/mfa/setup
 * Initialize TOTP setup - returns QR code and secret from Kratos
 */
export async function POST(request: NextRequest) {
  try {
    // Get Kratos session token from cookie
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      console.error('[mfa/setup] No Kratos session token found');
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get user email from Kratos session
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
    const userEmail = session.identity?.traits?.email || 'user';

    console.log('[mfa/setup] Using Kratos session for:', userEmail);

    // Create settings flow for TOTP using Kratos API with X-Session-Token
    const flowResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings/api`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
      }
    );

    if (!flowResponse.ok) {
      const errorText = await flowResponse.text();
      console.error('[mfa/setup] API flow failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to initialize settings flow. Please log in again.' },
        { status: 500 }
      );
    }

    const flow = await flowResponse.json();
    return extractTotpData(flow, kratosSessionToken, userEmail);
  } catch (error) {
    console.error('[POST mfa/setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to setup MFA' },
      { status: 500 }
    );
  }
}

function extractTotpData(flow: any, sessionToken: string, userEmail: string) {
  console.log('[mfa/setup] Flow UI nodes:', JSON.stringify(flow.ui?.nodes?.map((n: any) => ({
    group: n.group,
    type: n.type,
    id: n.attributes?.id,
    name: n.attributes?.name,
  })), null, 2));

  // Find TOTP node in the flow
  const totpNodes = flow.ui?.nodes?.filter((node: any) =>
    node.group === 'totp' || node.attributes?.id === 'totp_qr'
  ) || [];

  // Find secret key
  const secretNode = flow.ui?.nodes?.find((node: any) =>
    node.attributes?.id === 'totp_secret_key' ||
    node.attributes?.name === 'totp_secret_key' ||
    node.attributes?.text?.id === 1050006
  );

  const secret = secretNode?.attributes?.text?.text ||
                 secretNode?.attributes?.value ||
                 null;

  // Generate otpauth URL with user's email instead of UUID
  let otpauthUrl = null;
  if (secret) {
    const encodedIssuer = encodeURIComponent(TOTP_ISSUER);
    const encodedEmail = encodeURIComponent(userEmail);
    otpauthUrl = `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  console.log('[mfa/setup] Extracted secret:', secret ? 'yes' : 'no');
  console.log('[mfa/setup] Generated otpauthUrl for:', userEmail);

  return NextResponse.json({
    flowId: flow.id,
    otpauthUrl,
    secret,
    totpNodes,
    sessionToken, // Include for enable step
    hasTotpSetup: !!secret,
  });
}
