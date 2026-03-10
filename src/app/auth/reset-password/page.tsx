'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { isPasswordValid, getPasswordErrors } from '@/lib/validators/password';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const [flowId, setFlowId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation state
  const passwordValid = isPasswordValid(password);
  const passwordErrors = getPasswordErrors(password, language);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Check if coming from recovery email link
  useEffect(() => {
    const flow = searchParams.get('flow');
    const recoveryToken = searchParams.get('token');

    if (!flow) {
      setError(t(language, 'auth.resetPassword.noFlowError'));
      setLoading(false);
      return;
    }

    setFlowId(flow);
    setToken(recoveryToken); // Store recovery token from URL
    fetchRecoveryFlow(flow);
  }, [searchParams, language]);

  const fetchRecoveryFlow = async (flow: string) => {
    try {
      const flowUrl = new URL(
        `/self-service/recovery/flows?id=${flow}`,
        process.env.NEXT_PUBLIC_IDENTITY_URL || 'http://localhost:4433'
      );

      const response = await fetch(flowUrl.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch recovery flow');
      }

      await response.json();
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch recovery flow:', err);
      setError(t(language, 'auth.resetPassword.invalidFlow'));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError(t(language, 'auth.resetPassword.fieldsRequired'));
      return;
    }

    if (!passwordValid) {
      setError(t(language, 'auth.resetPassword.passwordInvalid'));
      return;
    }

    if (!passwordsMatch) {
      setError(t(language, 'auth.resetPassword.passwordsMismatch'));
      return;
    }

    setResetting(true);

    try {
      // Submit password reset to Kratos
      const response = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowId,
          token, // Include recovery token from URL
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t(language, 'auth.resetPassword.failedReset'));
      }

      const result = await response.json();
      console.log('Password reset successful:', result);

      setSubmitted(true);
      setMessage(t(language, 'auth.resetPassword.resetSuccess'));
    } catch (err) {
      console.error('Password reset failed:', err);
      const errorMessage = err instanceof Error ? err.message : t(language, 'auth.resetPassword.failedReset');
      setError(errorMessage);
    } finally {
      setResetting(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  if (loading) {
    return <ResetPasswordFallback />;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
                <span className="text-white font-bold text-2xl">✓</span>
              </div>
              <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
                {t(language, 'auth.resetPassword.resetSuccess')}
              </h1>
              <p className="text-excise-600 dark:text-slate-400 text-sm mt-1">
                {t(language, 'auth.resetPassword.canNowLogin')}
              </p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full btn-primary"
            >
              {t(language, 'auth.resetPassword.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-excise-600 dark:text-slate-400 hover:text-excise-900 dark:hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(language, 'auth.resetPassword.backToLogin')}
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
              {t(language, 'auth.resetPassword.title')}
            </h1>
            <p className="text-excise-600 dark:text-slate-400 text-sm mt-1">
              {t(language, 'auth.resetPassword.subtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.resetPassword.newPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-field pl-10 pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${
                    password && passwordValid ? 'border-green-500' : password && !passwordValid ? 'border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  required
                  disabled={resetting}
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-excise-500 dark:text-slate-400 hover:text-excise-700 dark:hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    disabled={resetting}
                  >
                    {showPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                )}
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-1 text-xs">
                  <p className={passwordErrors.includes('length') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {passwordErrors.includes('length') ? '○' : '✓'} {t(language, 'auth.register.passwordLength')}
                  </p>
                  <p className={passwordErrors.includes('uppercase') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {passwordErrors.includes('uppercase') ? '○' : '✓'} {t(language, 'auth.register.passwordUppercase')}
                  </p>
                  <p className={passwordErrors.includes('lowercase') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {passwordErrors.includes('lowercase') ? '○' : '✓'} {t(language, 'auth.register.passwordLowercase')}
                  </p>
                  <p className={passwordErrors.includes('number') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {passwordErrors.includes('number') ? '○' : '✓'} {t(language, 'auth.register.passwordNumber')}
                  </p>
                  <p className={passwordErrors.includes('special') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {passwordErrors.includes('special') ? '○' : '✓'} {t(language, 'auth.register.passwordSpecial')}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.resetPassword.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-500 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input-field pl-10 pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${
                    confirmPassword && passwordsMatch ? 'border-green-500' : confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  required
                  disabled={resetting}
                />
                {confirmPassword && passwordsMatch && (
                  <span className="absolute right-3 top-3 text-green-600 dark:text-green-500 text-lg">✓</span>
                )}
                {confirmPassword && !passwordsMatch && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-excise-500 dark:text-slate-400 hover:text-excise-700 dark:hover:text-slate-200 transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    disabled={resetting}
                  >
                    {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={resetting || !passwordValid || !passwordsMatch}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetting ? t(language, 'common.processing') : t(language, 'auth.resetPassword.resetPassword')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <p className="text-center text-excise-600 dark:text-slate-400 text-xs">
              {t(language, 'auth.resetPassword.rememberPassword')}{' '}
              <a
                href="/auth/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t(language, 'auth.resetPassword.loginLink')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
