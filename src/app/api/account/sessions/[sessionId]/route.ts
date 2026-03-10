import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

// BFF Pattern: Use internal Kratos for server-side API calls
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

/**
 * DELETE /api/account/sessions/[sessionId]
 * Revoke/invalidate a specific session using Kratos self-service API
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No Kratos session. Please log in again.' },
        { status: 401 }
      );
    }

    // Get current session ID to check if we're trying to revoke our own session
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

    const currentSession = await whoamiResponse.json();
    const currentSessionId = currentSession.id;

    // Cannot revoke current session via this endpoint (use logout instead)
    if (sessionId === currentSessionId) {
      return NextResponse.json(
        { error: 'Cannot revoke current session. Use logout instead.' },
        { status: 400 }
      );
    }

    // Revoke the session using Kratos self-service API
    // DELETE /sessions/{id} - Disable My Session
    const revokeResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/sessions/${sessionId}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
      }
    );

    if (!revokeResponse.ok) {
      const errorText = await revokeResponse.text();
      console.error('[sessions] Failed to revoke session:', errorText);

      if (revokeResponse.status === 404) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to revoke session' },
        { status: 500 }
      );
    }

    console.log(`[sessions] Session ${sessionId} revoked successfully`);

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    console.error('[DELETE session] Error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
