'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { useOnceAsync } from '@/hooks/useOnce';

export const dynamic = 'force-dynamic';

export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackContent />
    </Suspense>
  );
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');

  useOnceAsync(async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');

    // Check for errors from Hydra
    if (error) {
      setStatus('error');
      setMessage(`${error}: ${errorDescription || t(language, 'auth.callback.unknownError')}`);
      return;
    }

    // Check if we got the authorization code
    if (!code) {
      setStatus('error');
      setMessage(t(language, 'auth.callback.noCode'));
      return;
    }

    // Verify state matches what we sent (read from cookie)
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const savedState = getCookie('oauth_state');

    console.log('[OAuth Callback] State check:', {
      urlState: state ? `${state.substring(0, 8)}...` : 'null',
      cookieState: savedState ? `${savedState.substring(0, 8)}...` : 'null',
      allCookies: document.cookie ? 'has cookies' : 'no cookies',
    });

    if (!state || state !== savedState) {
      // Log security event (A09: Security Logging)
      console.error('[Security] OAuth state mismatch - possible CSRF attack', {
        hasState: !!state,
        hasSavedState: !!savedState,
        stateMatch: state === savedState,
        timestamp: new Date().toISOString(),
      });
      setStatus('error');
      setMessage(`Invalid state parameter - possible CSRF attack (state: ${state ? 'present' : 'missing'}, cookie: ${savedState ? 'present' : 'missing'})`);
      return;
    }

    // Exchange authorization code for tokens via backend API
    try {
      setMessage(t(language, 'auth.callback.exchangingToken'));

      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token exchange failed');
      }

      // Token is now stored in httpOnly cookie by the API
      setStatus('success');
      setMessage(t(language, 'auth.callback.success'));

      // Clear saved state cookie
      document.cookie = 'oauth_state=; path=/; max-age=0; SameSite=Strict';

      // Determine user portal from Keto roles and redirect
      const determineRedirect = async () => {
        try {
          // Call API to check user roles from Keto
          const rolesResp = await fetch('/api/auth/user-portal');

          if (rolesResp.ok) {
            const rolesData = await rolesResp.json();
            const portal = rolesData.portal || 'individual'; // platform-admin | organization | individual
            const redirectUrl = `/${portal}/dashboard`;

            console.log('[callback] User portal:', portal);
            console.log('[callback] Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
          } else {
            // Fallback to individual if role check fails
            console.warn('[callback] Could not determine portal from roles, using fallback');
            window.location.href = '/individual/dashboard';
          }
        } catch (err) {
          // Fallback to individual dashboard on error
          console.warn('[callback] Error determining portal:', err);
          window.location.href = '/individual/dashboard';
        }
      };

      // Redirect after brief delay to show success message
      setTimeout(determineRedirect, 1500);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Token exchange failed');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-excise-900 dark:to-excise-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-excise-800 dark:border-excise-700 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>

          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-excise-700 dark:text-excise-300 font-medium">{message || t(language, 'auth.callback.processing')}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-600 dark:text-green-400 font-medium">{message}</p>
              <p className="text-excise-600 dark:text-excise-400 text-sm mt-2">{t(language, 'auth.callback.redirecting')}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium">{message}</p>
              <a
                href="/"
                className="mt-6 inline-block btn-primary"
              >
                {t(language, 'auth.callback.returnHome')}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CallbackFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-excise-900 dark:to-excise-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-excise-800 dark:border-excise-700 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-excise-600 dark:text-excise-400">Loading...</p>
        </div>
      </div>
    </div>
  );
}
