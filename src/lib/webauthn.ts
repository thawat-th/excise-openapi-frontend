/**
 * WebAuthn / Passkey Helper
 * Handles WebAuthn credential creation and assertion for Kratos integration
 */

export interface WebAuthnLoginOptions {
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials: Array<{
    type: string;
    id: string;
    transports?: string[];
  }>;
  userVerification: string;
}

export interface WebAuthnAssertion {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
  };
  type: string;
}

/**
 * Check if browser supports WebAuthn
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window.PublicKeyCredential || navigator.credentials)
  );
}

/**
 * Check if conditional UI (autofill) is supported
 */
export async function isConditionalMediationAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;

  try {
    // @ts-ignore - conditional mediation is newer API
    return await PublicKeyCredential?.isConditionalMediationAvailable?.();
  } catch {
    return false;
  }
}

/**
 * Convert base64url string to ArrayBuffer
 */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert ArrayBuffer to base64url string
 */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Get WebAuthn assertion (perform passkey login)
 */
export async function getWebAuthnAssertion(
  options: WebAuthnLoginOptions
): Promise<WebAuthnAssertion> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device');
  }

  try {
    const credentialRequestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: base64urlToBuffer(options.challenge),
        timeout: options.timeout,
        rpId: options.rpId,
        allowCredentials: options.allowCredentials.map((cred) => ({
          type: cred.type as 'public-key',
          id: base64urlToBuffer(cred.id),
          transports: cred.transports as AuthenticatorTransport[],
        })),
        userVerification: options.userVerification as UserVerificationRequirement,
      },
    };

    const assertion = await navigator.credentials.get(
      credentialRequestOptions
    );

    if (!assertion || assertion.type !== 'public-key') {
      throw new Error('Invalid assertion response');
    }

    const pubKeyAssertion = assertion as PublicKeyCredential;
    const response = pubKeyAssertion.response as AuthenticatorAssertionResponse;

    return {
      id: pubKeyAssertion.id,
      rawId: bufferToBase64url(pubKeyAssertion.rawId),
      response: {
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        authenticatorData: bufferToBase64url(response.authenticatorData),
        signature: bufferToBase64url(response.signature),
      },
      type: pubKeyAssertion.type,
    };
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Passkey login was cancelled');
      }
      if (error.name === 'InvalidStateError') {
        throw new Error('No matching passkey found on this device');
      }
      if (error.name === 'NotSupportedError') {
        throw new Error('WebAuthn is not supported on this device');
      }
    }
    throw error instanceof Error ? error : new Error('Passkey login failed');
  }
}

/**
 * Format WebAuthn assertion response for Kratos submission
 */
export function formatAssertionForKratos(assertion: WebAuthnAssertion): Record<string, any> {
  return {
    method: 'webauthn',
    webauthn_assertion_response: {
      id: assertion.id,
      rawId: assertion.rawId,
      response: {
        clientDataJSON: assertion.response.clientDataJSON,
        authenticatorData: assertion.response.authenticatorData,
        signature: assertion.response.signature,
      },
      type: assertion.type,
    },
  };
}
