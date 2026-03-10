'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getConsentChallenge, acceptConsentChallenge, rejectConsentChallenge } from '@/lib/authorization';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

export const dynamic = 'force-dynamic';

interface ConsentChallenge {
  challenge: string;
  client: {
    client_id: string;
    client_name: string;
  };
  requested_scope: string[];
  skip: boolean;
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<ConsentFallback />}>
      <ConsentForm />
    </Suspense>
  );
}

function ConsentForm() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consentData, setConsentData] = useState<ConsentChallenge | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);

  // Prevent double API calls in React StrictMode
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    const consentChallenge = searchParams.get('consent_challenge');
    if (!consentChallenge) {
      setError(t(language, 'auth.consent.noChallenge'));
      setLoading(false);
      return;
    }

    // Skip if we already fetched this challenge
    if (fetchedRef.current === consentChallenge) {
      return;
    }
    fetchedRef.current = consentChallenge;

    setChallenge(consentChallenge);
    fetchConsentChallenge(consentChallenge);
  }, [searchParams]); // Removed language from dependencies

  const fetchConsentChallenge = async (consentChallenge: string) => {
    try {
      const data = await getConsentChallenge(consentChallenge);

      // Server already auto-accepted for first-party apps
      if (data.auto_accepted && data.redirect_to) {
        console.log('[consent] Server auto-accepted, redirecting...');
        window.location.href = data.redirect_to;
        return;
      }

      setConsentData(data);
      setSelectedScopes(data.requested_scope || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch consent challenge:', err);
      setError(t(language, 'auth.consent.loadError'));
      setLoading(false);
    }
  };

  const handleAllow = async () => {
    if (!challenge) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await acceptConsentChallenge(challenge, selectedScopes);
      if (result.redirect_to) {
        window.location.href = result.redirect_to;
      }
    } catch (err) {
      console.error('Failed to accept consent:', err);
      setError(t(language, 'auth.consent.acceptError'));
      setSubmitting(false);
    }
  };

  const handleDeny = async () => {
    if (!challenge) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await rejectConsentChallenge(
        challenge,
        'access_denied',
        t(language, 'auth.consent.userDenied')
      );
      if (result.redirect_to) {
        window.location.href = result.redirect_to;
      }
    } catch (err) {
      console.error('Failed to reject consent:', err);
      setError(t(language, 'auth.consent.denyError'));
      setSubmitting(false);
    }
  };

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  if (loading) {
    return <ConsentFallback />;
  }

  if (!consentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-excise-900 dark:to-excise-800 flex items-center justify-center p-4">
        <div className="card dark:bg-excise-800 dark:border-excise-700 text-center">
          <p className="text-red-600 dark:text-red-400">{error || t(language, 'auth.consent.invalidRequest')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-excise-900 dark:to-excise-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-excise-800 dark:border-excise-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-excise-50">{t(language, 'auth.consent.requestAuth')}</h1>
          </div>

          <div className="bg-excise-50 dark:bg-excise-700 border border-excise-200 dark:border-excise-600 rounded-lg p-4 mb-6">
            <p className="text-excise-700 dark:text-excise-300 text-sm">
              <strong>{consentData.client.client_name || consentData.client.client_id}</strong>{' '}
              {t(language, 'auth.consent.requestingAccess')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-excise-900 dark:text-excise-50 mb-4">{t(language, 'auth.consent.permissionsRequested')}:</h3>
            <div className="space-y-3">
              {consentData.requested_scope.map((scope) => (
                <label
                  key={scope}
                  className="flex items-center p-3 border border-excise-200 dark:border-excise-600 rounded-lg hover:bg-excise-50 dark:hover:bg-excise-700 cursor-pointer transition-colors dark:bg-excise-700/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope)}
                    onChange={() => handleScopeToggle(scope)}
                    disabled={submitting}
                    className="w-4 h-4 text-primary-600 rounded border-excise-300 dark:border-excise-600 cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-excise-700 dark:text-excise-300 font-medium">
                    {formatScope(scope, language)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDeny}
              disabled={submitting}
              className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t(language, 'common.processing') : t(language, 'auth.consent.deny')}
            </button>
            <button
              onClick={handleAllow}
              disabled={submitting || selectedScopes.length === 0}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t(language, 'common.processing') : t(language, 'auth.consent.allow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatScope(scope: string, language: string): string {
  const scopeKey = `scopes.${scope}`;
  return t(language as any, scopeKey);
}

function ConsentFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-excise-900 dark:to-excise-800 flex items-center justify-center p-4">
      <div className="card dark:bg-excise-800 dark:border-excise-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-excise-400">Loading...</p>
      </div>
    </div>
  );
}
