'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { generateOTP, storeOTPSession, verifyOTP, mockEmailOTP } from '@/lib/otp';

export const dynamic = 'force-dynamic';

export default function EmailOTPPage() {
  return (
    <Suspense fallback={<OTPFallback />}>
      <EmailOTPForm />
    </Suspense>
  );
}

function EmailOTPForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpGenerated, setOtpGenerated] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      // Generate and send OTP on mount
      handleSendOTP(decodeURIComponent(emailParam));
    }
    setLoading(false);
  }, [searchParams]);

  const handleSendOTP = (targetEmail: string) => {
    try {
      const code = generateOTP();
      storeOTPSession(targetEmail, code);
      mockEmailOTP(targetEmail, code);
      setOtpGenerated(true);
      setError('');
      setMessage(t(language, 'auth.emailOtp.otpExpires'));
    } catch (err) {
      setError('Failed to generate OTP');
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      handleSendOTP(email);
      setOtp('');
      setMessage(t(language, 'auth.emailOtp.otpExpires'));
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifying(true);

    try {
      if (!otp || otp.length !== 6) {
        setError('OTP must be 6 digits');
        setVerifying(false);
        return;
      }

      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = verifyOTP(otp);

      if (!result.valid) {
        setError(result.error || t(language, 'auth.emailOtp.otpInvalid'));
        setVerifying(false);
        return;
      }

      // Success - redirect to login or dashboard
      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err) {
      setError('Verification failed. Please try again.');
      setVerifying(false);
    }
  };

  const handleOTPInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
    setOtp(value);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  if (loading) {
    return <OTPFallback />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-white font-bold text-2xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-white">{t(language, 'auth.emailOtp.title')}</h1>
            <p className="text-excise-600 dark:text-slate-400 text-sm mt-1">{t(language, 'auth.emailOtp.subtitle')}</p>
          </div>

          {/* Message */}
          {message && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Email Display */}
          {email && (
            <div className="mb-6 p-3 bg-excise-50 dark:bg-slate-700 rounded border border-excise-200 dark:border-slate-600">
              <p className="text-xs text-excise-600 dark:text-slate-400 mb-1">{t(language, 'auth.emailOtp.otpSentTo')}</p>
              <p className="text-sm font-medium text-excise-900 dark:text-slate-200">{email}</p>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-excise-700 dark:text-slate-300 mb-2">
                {t(language, 'auth.emailOtp.enterOtp')}
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOTPInputChange}
                placeholder="000000"
                maxLength={6}
                className={`input-field text-center tracking-widest text-lg font-mono dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 ${
                  error ? 'border-red-500' : ''
                }`}
                disabled={verifying}
              />
              <p className="text-xs text-excise-500 dark:text-slate-500 mt-2 text-center">
                {t(language, 'auth.emailOtp.otpExpires')}
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? t(language, 'auth.emailOtp.verifying') : t(language, 'auth.emailOtp.verifyBtn')}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 pt-6 border-t border-excise-200 dark:border-slate-700">
            <p className="text-center text-excise-600 dark:text-slate-400 text-sm">
              {t(language, 'auth.emailOtp.didNotReceive')}{' '}
              <button
                onClick={handleResendOTP}
                disabled={resending}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? t(language, 'common.processing') : t(language, 'auth.emailOtp.resendOtp')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OTPFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
