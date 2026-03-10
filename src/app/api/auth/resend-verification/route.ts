import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/resend-verification
 * Resend verification email for unverified email addresses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const kratosInternalUrl = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

    // Step 1: Create verification flow
    const flowResponse = await fetch(`${kratosInternalUrl}/self-service/verification/api`);
    if (!flowResponse.ok) {
      console.error('Failed to create verification flow:', await flowResponse.text());
      return NextResponse.json(
        { error: 'Failed to create verification flow' },
        { status: 500 }
      );
    }

    const flow = await flowResponse.json();
    console.log(`[KRATOS] Created verification flow: ${flow.id}`);

    // Step 2: Submit email to verification flow to trigger email sending
    const submitResponse = await fetch(
      `${kratosInternalUrl}/self-service/verification?flow=${flow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          method: 'code',
          email: email,
        }),
        redirect: 'manual', // Don't follow redirects
      }
    );

    // If redirect (303), email was sent successfully
    if (submitResponse.status === 303) {
      console.log(`[KRATOS] Verification email sent (redirect to verify page)`);
      return NextResponse.json({
        success: true,
        flowId: flow.id,
        message: 'Verification email sent. Please check your inbox.',
      });
    }

    const result = await submitResponse.json();
    console.log(`[KRATOS] Verification submit result:`, JSON.stringify(result, null, 2));

    // Check for errors
    if (result.ui?.messages?.some((msg: any) => msg.type === 'error')) {
      const errorMsg = result.ui.messages
        .filter((msg: any) => msg.type === 'error')
        .map((msg: any) => msg.text)
        .join(', ');
      return NextResponse.json({ error: errorMsg, flowId: flow.id }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      flowId: flow.id,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
