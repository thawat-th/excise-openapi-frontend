import { NextRequest, NextResponse } from 'next/server';

/**
 * Hydra Token Hook
 *
 * This webhook is called by Hydra during token issuance to add custom claims.
 * Solves the problem of remembered sessions not updating session.id_token claims.
 *
 * See: https://www.ory.sh/docs/hydra/guides/claims-at-refresh
 * See: https://github.com/ory/hydra/discussions/3020
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[token-hook] 🔥 WEBHOOK CALLED BY HYDRA 🔥');
    console.log('[token-hook] 🔍 Full request body:', JSON.stringify(body, null, 2));
    console.log('[token-hook] Hydra token hook called:', {
      subject: body.subject,
      client_id: body.client_id,
      grant_types: body.grant_types,
      requested_at: body.requested_at,
    });

    // Get session data from Hydra's context
    // This is passed from accept-login's context field
    const context = body.session?.id_token || {};

    console.log('[token-hook] Session context:', {
      has_kratos_token: !!context.kratos_session_token,
      has_email: !!context.email,
      has_traits: !!context.traits,
    });

    // Return session data to be included in tokens
    // Hydra will merge this into the ID token under 'ext' claim
    const response = {
      session: {
        id_token: context,
        access_token: {
          // Can add custom claims to access token here if needed
        },
      },
    };

    console.log('[token-hook] Returning session data to Hydra');
    return NextResponse.json(response);
  } catch (error) {
    console.error('[token-hook] Error:', error);
    // Return empty session on error - don't block token issuance
    return NextResponse.json({
      session: {
        id_token: {},
        access_token: {},
      },
    });
  }
}
