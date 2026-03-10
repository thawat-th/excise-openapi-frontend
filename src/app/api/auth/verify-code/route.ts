import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/verify-code
 * Submit verification code to Kratos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flowId, code, email } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const kratosInternalUrl = process.env.IDENTITY_INTERNAL_URL || 'http://identity:4433';

    let currentFlowId = flowId;

    // If no flowId, create a new flow first
    if (!currentFlowId) {
      const flowResponse = await fetch(`${kratosInternalUrl}/self-service/verification/api`);
      if (!flowResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to create verification flow' },
          { status: 500 }
        );
      }
      const flow = await flowResponse.json();
      currentFlowId = flow.id;

      // If email provided, submit it first to associate with the flow
      if (email) {
        await fetch(
          `${kratosInternalUrl}/self-service/verification?flow=${currentFlowId}`,
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
      }
    }

    // Submit the verification code
    const response = await fetch(
      `${kratosInternalUrl}/self-service/verification?flow=${currentFlowId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          method: 'code',
          code: code,
        }),
        redirect: 'manual',
      }
    );

    // Handle redirect (verification successful)
    if (response.status === 303) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Email verified successfully',
      });
    }

    const result = await response.json();
    console.log('[KRATOS] Verification result:', JSON.stringify(result, null, 2));

    // Check if verification passed
    if (result.state === 'passed_challenge') {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Email verified successfully',
      });
    }

    // Check for errors
    if (result.ui?.messages) {
      const errorMsg = result.ui.messages
        .filter((msg: any) => msg.type === 'error')
        .map((msg: any) => msg.text)
        .join(', ');

      if (errorMsg) {
        return NextResponse.json(
          { error: errorMsg, verified: false },
          { status: 400 }
        );
      }

      // Check for success message
      const successMsg = result.ui.messages
        .filter((msg: any) => msg.type === 'success' || msg.type === 'info')
        .map((msg: any) => msg.text)
        .join(', ');

      if (successMsg.toLowerCase().includes('verified') || successMsg.toLowerCase().includes('success')) {
        return NextResponse.json({
          success: true,
          verified: true,
          message: successMsg,
        });
      }
    }

    // Return the flow state for frontend to handle
    return NextResponse.json({
      success: true,
      verified: false,
      state: result.state,
      flowId: currentFlowId,
      ui: result.ui,
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
