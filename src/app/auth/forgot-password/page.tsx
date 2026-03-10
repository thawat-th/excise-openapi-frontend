'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { isValidEmail, isValidEmailDomain } from '@/lib/validators/email';
import { Altcha } from '@/components/Altcha';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  // Form state
  const [email, setEmail] = useState('');
  const [flowId, setFlowId] = useState(''); // Store flowId from OTP send response
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [altchaPayload, setAltchaPayload] = useState<string>('');

  // UI state
  const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: OTP + Password
  const [emailValid, setEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time email validation
    if (value) {
      setEmailValid(isValidEmail(value) && isValidEmailDomain(value));
    } else {
      setEmailValid(false);
    }

    if (error) {
      setError('');
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !emailValid) {
      setError(t(language, 'auth.forgotPassword.emailInvalid'));
      return;
    }

    if (!altchaPayload) {
      setError(t(language, 'auth.forgotPassword.captchaRequired'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/recovery/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, altchaPayload }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t(language, 'auth.forgotPassword.failedSend'));
      }

      // Store flowId from response (needed for OTP verification)
      if (data.flowId) {
        setFlowId(data.flowId);
      }

      // Move to step 2
      setStep(2);
    } catch (err) {
      console.error('Send OTP failed:', err);
      const errorMessage = err instanceof Error ? err.message : t(language, 'auth.forgotPassword.failedSend');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (otp.length !== 6) {
      setError(t(language, 'auth.forgotPassword.otpInvalid'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t(language, 'auth.forgotPassword.passwordsMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t(language, 'auth.forgotPassword.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          flowId, // Include flowId for OTP verification
          otp,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t(language, 'auth.forgotPassword.failedReset'));
      }

      // Password reset successful, redirect to login page
      // Note: Auto-login may fail due to Kratos API limitations
      router.push('/auth/login');
    } catch (err) {
      console.error('Reset password failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-excise-600 dark:text-slate-400 hover:text-excise-900 dark:hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(language, 'auth.forgotPassword.backToLogin')}
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              {step === 1 ? <Mail className="text-white w-8 h-8" /> : <Lock className="text-white w-8 h-8" />}
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
              {step === 1 ? t(language, 'auth.forgotPassword.title') : t(language, 'auth.forgotPassword.resetPasswordTitle')}
            </h1>
            <p className="text-excise-600 dark:text-slate-400 text-sm mt-1">
              {step === 1 ? t(language, 'auth.forgotPassword.subtitle') : t(language, 'auth.forgotPassword.resetPasswordSubtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.forgotPassword.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-500 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`input-field pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${
                      email && emailValid ? 'border-green-500' : email && !emailValid ? 'border-red-500' : ''
                    }`}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                  {email && emailValid && (
                    <span className="absolute right-3 top-3 text-green-600 dark:text-green-500 text-lg">✓</span>
                  )}
                </div>
              </div>

              {/* CAPTCHA Protection */}
              <Altcha
                onVerify={(payload) => setAltchaPayload(payload)}
                onError={() => setError(t(language, 'auth.forgotPassword.captchaFailed'))}
              />

              <button
                type="submit"
                disabled={loading || !emailValid || !altchaPayload}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t(language, 'common.processing') : t(language, 'auth.forgotPassword.sendOtpCode')}
              </button>
            </form>
          )}

          {/* Step 2: OTP + Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-excise-50 dark:bg-slate-700 p-4 rounded border border-excise-200 dark:border-slate-600 mb-4">
                <p className="text-excise-700 dark:text-slate-300 text-sm">
                  {t(language, 'auth.forgotPassword.otpSentTo')} <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.forgotPassword.otpCode')}
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 text-center text-2xl tracking-widest"
                  placeholder={t(language, 'auth.forgotPassword.otpPlaceholder')}
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.forgotPassword.newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-500 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    placeholder={t(language, 'auth.forgotPassword.newPasswordPlaceholder')}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-excise-500 dark:text-slate-400 hover:text-excise-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                  {t(language, 'auth.forgotPassword.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-excise-500 dark:text-slate-500 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    placeholder={t(language, 'auth.forgotPassword.confirmPasswordPlaceholder')}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-excise-500 dark:text-slate-400 hover:text-excise-700 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || !password || !confirmPassword}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t(language, 'common.processing') : t(language, 'auth.forgotPassword.resetPassword')}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full text-sm text-excise-600 dark:text-slate-400 hover:text-excise-900 dark:hover:text-slate-200"
              >
                {t(language, 'auth.forgotPassword.backToEmail')}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <p className="text-center text-excise-600 dark:text-slate-400 text-xs">
              {t(language, 'auth.forgotPassword.rememberPassword')}{' '}
              <a
                href="/auth/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t(language, 'auth.forgotPassword.loginLink')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
