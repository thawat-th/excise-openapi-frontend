import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/account/password
 * Change user password via Kratos settings flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get session cookie from request
    const cookies = request.cookies;
    const sessionCookie = cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    // Initialize settings flow
    const flowResponse = await fetch(
      `${process.env.NEXT_PUBLIC_IDENTITY_URL || 'http://localhost:4433'}/self-service/settings/flows`,
      {
        method: 'GET',
        headers: {
          'Cookie': sessionCookie,
        },
      }
    );

    if (!flowResponse.ok) {
      if (flowResponse.status === 401) {
        return NextResponse.json(
          { error: 'You must be logged in to change your password' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to initialize settings flow' },
        { status: 500 }
      );
    }

    const flow = await flowResponse.json();

    // Submit settings flow with password change
    const submitResponse = await fetch(
      `${process.env.NEXT_PUBLIC_IDENTITY_URL || 'http://localhost:4433'}/self-service/settings/flows?flow=${flow.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sessionCookie,
        },
        body: JSON.stringify({
          method: 'password',
          password: newPassword,
        }),
      }
    );

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json();
      console.error('Kratos password change error:', errorData);

      // Handle validation errors from Kratos
      if (errorData.ui?.messages) {
        const messages = errorData.ui.messages;
        if (Array.isArray(messages) && messages.length > 0) {
          return NextResponse.json(
            { error: messages[0].text || 'Password change failed' },
            { status: 400 }
          );
        }
      }

      // Check for specific error about current password
      if (errorData.ui?.nodes) {
        const passwordNode = errorData.ui.nodes.find((n: any) => n.attributes?.name === 'password');
        if (passwordNode?.messages) {
          const errorMsg = passwordNode.messages[0]?.text || 'Password change failed';
          return NextResponse.json(
            { error: errorMsg },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to change password' },
        { status: 400 }
      );
    }

    const result = await submitResponse.json();

    // Set session cookies if provided
    const response = NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      session: result,
    });

    // Forward Kratos session cookies to client
    const setCookieHeader = submitResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
