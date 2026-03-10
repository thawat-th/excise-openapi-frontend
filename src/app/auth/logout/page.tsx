'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getLogoutChallenge, acceptLogoutChallenge } from '@/lib/authorization';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

export const dynamic = 'force-dynamic';

export default function LogoutPage() {
  return (
    <Suspense fallback={<LogoutFallback />}>
      <LogoutForm />
    </Suspense>
  );
}

function LogoutForm() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const logoutChallenge = searchParams.get('logout_challenge');
    if (!logoutChallenge) {
      setError(t(language, 'auth.logout.noChallenge'));
      setLoading(false);
      return;
    }

    setChallenge(logoutChallenge);
    fetchLogoutChallenge(logoutChallenge);
  }, [searchParams, language]);

  const fetchLogoutChallenge = async (logoutChallenge: string) => {
    try {
      await getLogoutChallenge(logoutChallenge);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch logout challenge:', err);
      setError(t(language, 'auth.logout.loadError'));
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!challenge) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await acceptLogoutChallenge(challenge);
      if (result.redirect_to) {
        window.location.href = result.redirect_to;
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout failed:', err);
      setError(t(language, 'auth.logout.logoutError'));
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/';
  };

  if (loading) {
    return <LogoutFallback />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-excise-900 dark:to-excise-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-excise-800 dark:border-excise-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-excise-50">{t(language, 'auth.logout.title')}</h1>
            <p className="text-excise-600 dark:text-excise-400 text-sm mt-1">{t(language, 'auth.logout.subtitle')}</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="bg-excise-50 dark:bg-excise-700 border border-excise-200 dark:border-excise-600 rounded-lg p-4 mb-6">
            <p className="text-excise-700 dark:text-excise-300 text-sm">
              {t(language, 'auth.logout.confirmation')}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={submitting}
              className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t(language, 'common.cancel')}
            </button>
            <button
              onClick={handleLogout}
              disabled={submitting}
              className="flex-1 btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t(language, 'auth.logout.signingOut') : t(language, 'auth.logout.signOut')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoutFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-excise-900 dark:to-excise-800 flex items-center justify-center p-4">
      <div className="card dark:bg-excise-800 dark:border-excise-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-excise-400">Loading...</p>
      </div>
    </div>
  );
}
