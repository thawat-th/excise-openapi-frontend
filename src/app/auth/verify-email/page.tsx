'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [flowId, setFlowId] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const flowParam = searchParams.get('flow');
    const codeParam = searchParams.get('code');

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    if (flowParam) {
      setFlowId(flowParam);
    }
    // If code is in URL, auto-fill it
    if (codeParam) {
      setCode(codeParam);
    }
    setLoading(false);
  }, [searchParams]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError(language === 'th' ? 'กรุณากรอกรหัส 6 หลัก' : 'Please enter 6-digit code');
      return;
    }

    setVerifying(true);
    setError('');
    setMessage('');

    try {
      // Submit verification code through our API (to avoid CORS issues)
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowId: flowId,
          code: code,
          email: email,
        }),
      });

      const result = await response.json();
      console.log('Verification result:', result);

      if (result.verified) {
        setVerified(true);
        setMessage(t(language, 'auth.verify.emailVerified'));
      } else if (result.error) {
        setError(result.error);
      } else if (result.state === 'sent_email') {
        setMessage(language === 'th' ? 'รหัสยืนยันถูกส่งไปยังอีเมลของคุณแล้ว' : 'Verification code has been sent to your email');
        if (result.flowId) {
          setFlowId(result.flowId);
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(language === 'th' ? 'เกิดข้อผิดพลาดในการยืนยัน' : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError(language === 'th' ? 'กรุณาระบุอีเมล' : 'Please enter your email');
      return;
    }

    setResending(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      // Update flow ID if returned
      if (data.flowId) {
        setFlowId(data.flowId);
      }

      setMessage(t(language, 'auth.verify.resendSuccess'));
    } catch (err) {
      console.error('Resend error:', err);
      setError(t(language, 'auth.verify.resendError'));
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  if (loading) {
    return <VerifyEmailFallback />;
  }

  // Show success screen if verified
  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
                {language === 'th' ? 'ยืนยันอีเมลสำเร็จ!' : 'Email Verified!'}
              </h1>
              <p className="text-excise-600 dark:text-slate-400 text-sm mt-2">
                {t(language, 'auth.verify.emailVerified')}
              </p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full btn-primary"
            >
              {t(language, 'auth.verify.backToLogin')}
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-white">{t(language, 'auth.verify.verifyEmailTitle')}</h1>
            <p className="text-excise-600 dark:text-slate-400 text-sm mt-1">{t(language, 'auth.verify.emailVerification')}</p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Email Input (if not provided) */}
          {!email && (
            <div className="mb-4">
              <label className="block text-excise-700 dark:text-slate-300 text-sm font-medium mb-2">
                {t(language, 'auth.register.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                placeholder="example@email.com"
              />
            </div>
          )}

          {/* Show email if provided */}
          {email && (
            <div className="mb-4">
              <p className="text-excise-600 dark:text-slate-400 text-sm mb-2">
                {language === 'th' ? 'รหัสยืนยันถูกส่งไปที่:' : 'Verification code sent to:'}
              </p>
              <p className="text-excise-700 dark:text-slate-300 font-medium text-sm bg-excise-50 dark:bg-slate-700 p-3 rounded border border-excise-200 dark:border-slate-600">
                {email}
              </p>
            </div>
          )}

          {/* Verification Code Form */}
          <form onSubmit={handleVerifyCode} className="mb-6">
            <div className="mb-4">
              <label className="block text-excise-700 dark:text-slate-300 text-sm font-medium mb-2">
                {language === 'th' ? 'รหัสยืนยัน 6 หลัก' : '6-digit Verification Code'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest font-mono dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              <p className="text-excise-500 dark:text-slate-500 text-xs mt-2">
                {language === 'th' ? 'กรอกรหัส 6 หลักที่ได้รับทางอีเมล' : 'Enter the 6-digit code from your email'}
              </p>
            </div>

            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="w-full btn-primary"
            >
              {verifying
                ? (language === 'th' ? 'กำลังยืนยัน...' : 'Verifying...')
                : (language === 'th' ? 'ยืนยันรหัส' : 'Verify Code')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-excise-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-slate-800 text-excise-500 dark:text-slate-500">{t(language, 'common.or')}</span>
            </div>
          </div>

          {/* Resend Button */}
          <div className="mb-6">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full px-4 py-2 border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? t(language, 'common.processing') : t(language, 'auth.verify.resendEmail')}
            </button>
          </div>

          {/* Back to Login */}
          <button
            onClick={handleBackToLogin}
            className="w-full px-4 py-2 text-excise-600 dark:text-slate-400 hover:text-excise-800 dark:hover:text-slate-200 font-medium"
          >
            {t(language, 'auth.verify.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-excise-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
