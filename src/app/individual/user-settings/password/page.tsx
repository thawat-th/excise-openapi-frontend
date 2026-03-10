'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { SkeletonPasswordSettings } from '@/components/ui/Skeleton';
import { apiPost } from '@/lib/fetch-helpers';

export default function PasswordSettingsPage() {
  const { language } = useLanguage();
  const prefix = 'dashboard.pages.individual.settings.password';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const passwordRequirements = [
    { key: 'minLength', met: newPassword.length >= 8 },
    { key: 'uppercase', met: /[A-Z]/.test(newPassword) },
    { key: 'lowercase', met: /[a-z]/.test(newPassword) },
    { key: 'number', met: /[0-9]/.test(newPassword) },
    { key: 'special', met: /[!@#$%^&*]/.test(newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = currentPassword && allRequirementsMet && passwordsMatch && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) return;

    setSubmitting(true);

    const result = await apiPost<{ sessionsRevoked: number }>(
      '/api/account/password/change',
      {
        currentPassword,
        newPassword,
        revokeOtherSessions,
      },
      'password'
    );

    setSubmitting(false);

    if (result.success && result.data) {
      // Success
      const successKey = result.data.sessionsRevoked > 0 ? 'changeSuccessWithRevoked' : 'changeSuccess';
      const successMsg = t(language, `${prefix}.${successKey}`);
      setSuccess(
        result.data.sessionsRevoked > 0
          ? successMsg.replace('{count}', result.data.sessionsRevoked.toString())
          : successMsg
      );

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      // Map error codes to i18n keys
      let errorKey = 'changeFailed';
      const errorMsg = result.error || '';

      if (errorMsg.includes('incorrect_password')) {
        errorKey = 'currentIncorrect';
      } else if (errorMsg.includes('session_expired') || errorMsg.includes('no_session')) {
        errorKey = 'sessionExpired';
      } else if (errorMsg.includes('same_password')) {
        errorKey = 'samePassword';
      } else if (errorMsg.includes('too_many_attempts')) {
        errorKey = 'tooManyAttempts';
      }

      setError(t(language, `${prefix}.errors.${errorKey}`));
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return <SkeletonPasswordSettings />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, `${prefix}.title`)}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t(language, `${prefix}.description`)}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs text-red-600 dark:text-red-400 underline mt-1"
            >
              {t(language, `${prefix}.dismiss`)}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {t(language, `${prefix}.currentPassword`)}
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={submitting}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {t(language, `${prefix}.newPassword`)}
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={submitting}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        {newPassword && (
          <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t(language, `${prefix}.requirements`)}</p>
            <ul className="space-y-1">
              {passwordRequirements.map((req) => (
                <li key={req.key} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300 dark:text-slate-500" />
                  )}
                  <span className={req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-slate-400'}>
                    {t(language, `${prefix}.${req.key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {t(language, `${prefix}.confirmPassword`)}
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 ${
                confirmPassword && !passwordsMatch
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-slate-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {t(language, `${prefix}.passwordMismatch`)}
            </p>
          )}
        </div>

        {/* Revoke Other Sessions */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <input
            type="checkbox"
            id="revokeOtherSessions"
            checked={revokeOtherSessions}
            onChange={(e) => setRevokeOtherSessions(e.target.checked)}
            disabled={submitting}
            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="revokeOtherSessions" className="text-sm">
            <span className="font-medium text-amber-800 dark:text-amber-300">
              {t(language, `${prefix}.signOutOtherDevices`)}
            </span>
            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
              {t(language, `${prefix}.signOutOtherDevicesWarning`)}
            </p>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t(language, `${prefix}.updateButton`)}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={submitting}
          className="px-4 py-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          {t(language, `${prefix}.cancelButton`)}
        </button>
      </div>
    </form>
  );
}
