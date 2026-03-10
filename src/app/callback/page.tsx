'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

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

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setMessage(`${error}: ${errorDescription || t(language, 'auth.callback.unknownError')}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage(t(language, 'auth.callback.noCode'));
      return;
    }

    // In a real application, you would:
    // 1. Send the code to your backend
    // 2. Backend exchanges code for access token
    // 3. Backend stores token in secure httpOnly cookie
    // 4. Redirect to dashboard or home

    setStatus('success');
    setMessage(t(language, 'auth.callback.success'));

    // Redirect to home after 2 seconds
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  }, [searchParams, language]);

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
