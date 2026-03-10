import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/verification-flow
 * Create a new verification flow and optionally submit email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const kratosInternalUrl = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

    // Create verification flow
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

    // If email provided, submit it to trigger email sending
    if (email) {
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
          redirect: 'manual',
        }
      );

      // Get the updated flow after submission
      if (submitResponse.status === 303 || submitResponse.ok) {
        console.log(`[KRATOS] Verification email sent for flow: ${flow.id}`);
      }
    }

    return NextResponse.json({
      flowId: flow.id,
      success: true,
    });
  } catch (error) {
    console.error('Verification flow error:', error);
    return NextResponse.json(
      { error: 'Failed to create verification flow' },
      { status: 500 }
    );
  }
}
