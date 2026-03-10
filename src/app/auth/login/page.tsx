'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Fingerprint } from 'lucide-react';
import { getLoginChallenge, acceptLoginChallenge } from '@/lib/authorization';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { isWebAuthnSupported, getWebAuthnAssertion, formatAssertionForKratos, WebAuthnLoginOptions } from '@/lib/webauthn';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState(''); // Changed: email or username
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  useEffect(() => {
    const loginChallenge = searchParams.get('login_challenge');
    if (!loginChallenge) {
      setError(t(language, 'auth.login.noChallenge'));
      setLoading(false);
      return;
    }

    setChallenge(loginChallenge);
    setPasskeySupported(isWebAuthnSupported());
    fetchLoginChallenge(loginChallenge);
  }, [searchParams, language]);

  const fetchLoginChallenge = async (loginChallenge: string) => {
    try {
      const response = await fetch(`/api/auth/login-challenge?login_challenge=${encodeURIComponent(loginChallenge)}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch login challenge');
      }
      await response.json();
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch login challenge:', err);
      setError(err instanceof Error ? err.message : 'Failed to load login challenge');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    setSubmitting(true);
    setError(null);

    try {
      // Verify credentials with Kratos and accept login with Hydra
      const response = await fetch('/api/auth/accept-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginChallenge: challenge,
          subject: identifier.toLowerCase().trim(), // Normalize identifier
          password: password,
          rememberMe: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // NOTE: Email verification check
        // If the backend returns a 403 or indicates email not verified,
        // redirect to verify-email page
        if (errorData.code === 'email_not_verified' || response.status === 403) {
          // Try to extract email from identifier if it's an email format
          const emailToVerify = identifier.includes('@') ? identifier : '';
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(emailToVerify)}`;
          return;
        }

        throw new Error(errorData.error || 'Failed to accept login challenge');
      }

      const result = await response.json();

      // Session token is now stored in httpOnly cookie by the server
      // No need to handle it client-side

      if (result.redirect_to) {
        window.location.href = result.redirect_to;
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(t(language, 'auth.login.failedSignIn'));
      setSubmitting(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!challenge || !passkeySupported) return;

    setPasskeyLoading(true);
    setError(null);

    try {
      // Initialize WebAuthn login flow via Kratos
      const flowResponse = await fetch(
        `/api/auth/webauthn-login?login_challenge=${encodeURIComponent(challenge)}`
      );

      if (!flowResponse.ok) {
        throw new Error('Failed to initialize passkey login');
      }

      const flowData = await flowResponse.json();
      const webauthnOptions = flowData.webauthn_options as WebAuthnLoginOptions;

      // Get WebAuthn assertion from user's device
      const assertion = await getWebAuthnAssertion(webauthnOptions);

      // Submit WebAuthn assertion to Kratos
      const submitResponse = await fetch(
        `/api/auth/webauthn-login-submit?login_challenge=${encodeURIComponent(challenge)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formatAssertionForKratos(assertion)),
          credentials: 'include',
        }
      );

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || t(language, 'auth.login.passkeyFailed'));
      }

      const result = await submitResponse.json();
      if (result.redirect_to) {
        window.location.href = result.redirect_to;
      }
    } catch (err) {
      console.error('Passkey login failed:', err);

      let errorMessage = t(language, 'auth.login.passkeyFailed');
      if (err instanceof Error) {
        const errMsg = err.message.toLowerCase();
        if (errMsg.includes('cancelled')) {
          errorMessage = t(language, 'auth.login.passkeyCancel');
        } else if (errMsg.includes('not found')) {
          errorMessage = t(language, 'auth.login.passkeyNotFound');
        } else if (errMsg.includes('not supported')) {
          errorMessage = t(language, 'auth.login.passkeyNotSupported');
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setPasskeyLoading(false);
    }
  };

  if (loading) {
    return <LoginFallback />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-excise-200 dark:border-slate-700 shadow-sm p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-white">Sign In</h1>
            <p className="text-excise-600 dark:text-slate-400 text-sm mt-1">to Excise OpenAPI</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.login.emailOrUsername')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-500 pointer-events-none" />
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-excise-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-excise-900 dark:text-white placeholder-excise-400 dark:placeholder-slate-400"
                  placeholder={t(language, 'auth.login.emailOrUsernamePlaceholder')}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pl-10 pr-10 border border-excise-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-excise-900 dark:text-white placeholder-excise-400 dark:placeholder-slate-400"
                  placeholder="••••••••"
                  required
                  disabled={submitting}
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-excise-500 dark:text-slate-400 hover:text-excise-700 dark:hover:text-white transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    disabled={submitting}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-excise-200 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-slate-800 text-excise-500 dark:text-slate-400">{t(language, 'auth.login.orDivider')}</span>
            </div>
          </div>

          {/* Thai Digital ID Login Button */}
          <button
            type="button"
            onClick={() => {
              // TODO: Implement Thai Digital ID OAuth flow
              window.location.href = `/api/auth/thaiid?login_challenge=${challenge}`;
            }}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            {t(language, 'auth.login.thaiDigitalId') || 'เข้าสู่ระบบด้วย Thai Digital ID'}
          </button>

          {passkeySupported && (
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Fingerprint className="w-5 h-5" />
              {passkeyLoading ? t(language, 'auth.login.passkeyLoggingIn') : t(language, 'auth.login.passkeyLogin')}
            </button>
          )}

          <div className="mt-4 text-center">
            <a
              href="/auth/forgot-password"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              {t(language, 'auth.login.forgotPassword') || 'Forgot Password?'}
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <p className="text-center text-excise-600 dark:text-slate-400 text-sm">
              {t(language, 'auth.login.noAccount')}{' '}
              <a href="/auth/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                {t(language, 'auth.login.registerLink')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-excise-200 dark:border-slate-700 shadow-sm p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
