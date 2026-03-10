'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

export const dynamic = 'force-dynamic';

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<TwoFactorFallback />}>
      <TwoFactorForm />
    </Suspense>
  );
}

function TwoFactorForm() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loginChallenge = searchParams.get('login_challenge');
  const flowId = searchParams.get('flow_id');
  const email = searchParams.get('email');

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newCode.every(d => d !== '')) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (totpCode?: string) => {
    const codeToSubmit = totpCode || code.join('');

    if (codeToSubmit.length !== 6) {
      setError(t(language, 'settings.mfa.invalidCode'));
      return;
    }

    if (!loginChallenge || !flowId) {
      setError('Missing required parameters. Please go back and login again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Submit TOTP to accept-login endpoint
      // Session token is sent via httpOnly cookie automatically
      const response = await fetch('/api/auth/accept-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies with request
        body: JSON.stringify({
          loginChallenge,
          flowId,
          totpCode: codeToSubmit,
          subject: email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || t(language, 'settings.mfa.invalidCode'));
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // Cookie is cleared by the server after successful 2FA

      // Redirect to the URL provided by Hydra
      if (result.redirect_to) {
        window.location.href = result.redirect_to;
      }
    } catch (err) {
      console.error('2FA verification failed:', err);
      setError(t(language, 'settings.mfa.verifyError'));
      setLoading(false);
    }
  };

  const handleUseRecoveryCode = () => {
    // TODO: Implement recovery code verification
    window.location.href = `/auth/2fa/recovery?login_challenge=${loginChallenge}&flow_id=${flowId}&email=${encodeURIComponent(email || '')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-excise-200 dark:border-slate-700 shadow-sm p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
              {t(language, 'settings.mfa.twoFactorAuth')}
            </h1>
            <p className="text-excise-600 dark:text-slate-400 text-sm mt-2">
              {t(language, 'settings.mfa.enterCodeFromApp')}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Code input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold border border-excise-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700 text-excise-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || code.some(d => d === '')}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  {t(language, 'common.verifying')}
                </span>
              ) : (
                t(language, 'settings.mfa.verifyCode')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-excise-200 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-slate-800 text-excise-500 dark:text-slate-400">
                {t(language, 'settings.mfa.orUseRecovery')}
              </span>
            </div>
          </div>

          {/* Recovery code link */}
          <button
            type="button"
            onClick={handleUseRecoveryCode}
            disabled={loading}
            className="w-full px-4 py-2.5 border border-excise-300 dark:border-slate-600 text-excise-700 dark:text-slate-300 rounded-lg font-medium hover:bg-excise-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(language, 'settings.mfa.useRecoveryCode')}
          </button>

          {/* Back to login */}
          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <a
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-sm text-excise-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t(language, 'auth.login.backToLogin')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TwoFactorFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-excise-200 dark:border-slate-700 shadow-sm p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
