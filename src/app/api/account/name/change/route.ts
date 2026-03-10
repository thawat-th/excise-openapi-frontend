import { getKratosSessionToken } from '@/lib/session-helpers';
import { NextRequest, NextResponse } from 'next/server';

// BFF Pattern: Use internal Kratos for server-side API calls
const IDENTITY_INTERNAL_URL = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://api-audit-service:5002';

interface NameChangeRequest {
  firstName: string;
  lastName: string;
}

// Helper to log audit events
async function logAuditEvent(
  eventType: string,
  outcome: 'success' | 'failure',
  identityId: string,
  email: string,
  ipAddress: string,
  userAgent: string,
  message: string,
  metadata?: Record<string, any>,
  reason?: string
): Promise<void> {
  try {
    await fetch(`${AUDIT_SERVICE_URL}/v1/audit/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        event_kind: 'event',
        event_category: 'iam',
        event_outcome: outcome,
        status: outcome,
        actor_id: identityId,
        actor_email: email,
        actor_role: 'user',
        target_type: 'identity',
        target_id: identityId,
        target_label: `${metadata?.first_name} ${metadata?.last_name}`.trim(),
        ip_address: ipAddress,
        user_agent: userAgent,
        service_name: 'frontend',
        service_version: '1.0.0',
        message,
        error_message: outcome === 'failure' ? reason : '',
        reason: reason || '',
        metadata: JSON.stringify(metadata || {}),
      }),
    });
  } catch (error) {
    console.error('[name-change] Failed to log audit event:', error);
  }
}

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''
  );
}

/**
 * POST /api/account/name/change
 * Update display name (first name and last name)
 */
export async function POST(request: NextRequest) {
  try {
    const kratosSessionToken = await getKratosSessionToken(request);

    if (!kratosSessionToken) {
      return NextResponse.json(
        { error: 'No session. Please log in again.' },
        { status: 401 }
      );
    }

    const body: NameChangeRequest = await request.json();
    const { firstName, lastName } = body;

    if (!firstName && !lastName) {
      return NextResponse.json(
        { error: 'At least one name field is required' },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Get current session info
    const whoamiResponse = await fetch(`${IDENTITY_INTERNAL_URL}/sessions/whoami`, {
      headers: { 'X-Session-Token': kratosSessionToken },
    });

    if (!whoamiResponse.ok) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const session = await whoamiResponse.json();
    const identityId = session.identity?.id;
    const currentEmail = session.identity?.traits?.email || '';

    // Create settings flow
    const settingsFlowResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings/api`,
      {
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
      }
    );

    if (!settingsFlowResponse.ok) {
      const errorText = await settingsFlowResponse.text();
      console.error('[name-change] Failed to create settings flow:', errorText);

      if (settingsFlowResponse.status === 403) {
        return NextResponse.json(
          { error: 'Session requires re-authentication', code: 'session_refresh_required' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to initialize name change' },
        { status: 500 }
      );
    }

    const settingsFlow = await settingsFlowResponse.json();
    console.log('[name-change] Created settings flow:', settingsFlow.id);

    // Get current traits and update name fields
    const currentTraits = session.identity?.traits || {};
    const updatedTraits = {
      ...currentTraits,
      first_name: firstName || currentTraits.first_name,
      last_name: lastName || currentTraits.last_name,
    };

    // Submit profile update
    const updateResponse = await fetch(
      `${IDENTITY_INTERNAL_URL}/self-service/settings?flow=${settingsFlow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Session-Token': kratosSessionToken,
        },
        body: JSON.stringify({
          method: 'profile',
          traits: updatedTraits,
        }),
      }
    );

    const updateResult = await updateResponse.json();
    console.log('[name-change] Settings update response:', updateResponse.status);

    // Check for errors
    if (!updateResponse.ok) {
      const errorMessages = updateResult.ui?.messages
        ?.filter((m: any) => m.type === 'error')
        ?.map((m: any) => m.text)
        ?.join(', ');

      await logAuditEvent(
        'name_change',
        'failure',
        identityId,
        currentEmail,
        clientIP,
        userAgent,
        'Name change failed',
        { first_name: firstName, last_name: lastName },
        errorMessages || 'unknown_error'
      );

      return NextResponse.json(
        { error: errorMessages || 'Failed to update name' },
        { status: 400 }
      );
    }

    // Success
    console.log('[name-change] Name updated:', firstName, lastName);

    await logAuditEvent(
      'name_change',
      'success',
      identityId,
      currentEmail,
      clientIP,
      userAgent,
      `Name updated to ${firstName} ${lastName}`,
      { first_name: firstName, last_name: lastName }
    );

    return NextResponse.json({
      success: true,
      message: 'Display name updated successfully',
      firstName,
      lastName,
    });
  } catch (error) {
    console.error('[name-change] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update display name' },
      { status: 500 }
    );
  }
}
