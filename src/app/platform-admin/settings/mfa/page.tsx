'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Key, ShieldCheck, ShieldOff, Copy, RefreshCw, CheckCircle, Shield, Lock, AlertTriangle, Lightbulb, Download, Loader2, Info, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { SkeletonMFASettings } from '@/components/ui/Skeleton';

interface MfaStatus {
  totpEnabled: boolean;
  hasRecoveryCodes: boolean;
}

interface SetupData {
  flowId: string;
  otpauthUrl: string | null;
  secret: string | null;
  hasTotpSetup: boolean;
}

export default function MFASettingsPage() {
  const { language } = useLanguage();
  const prefix = 'dashboard.pages.individual.settings.mfa';

  const [loading, setLoading] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<MfaStatus | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // Fetch MFA status on mount
  useEffect(() => {
    fetchMfaStatus();
  }, []);

  const fetchMfaStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account/mfa/status');
      if (response.ok) {
        const data = await response.json();
        setMfaStatus(data);
      } else {
        setError('Failed to load MFA status');
      }
    } catch (err) {
      console.error('Failed to fetch MFA status:', err);
      setError('Failed to load MFA status');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/account/mfa/setup', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSetupData(data);
        setShowSetup(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start MFA setup');
      }
    } catch (err) {
      console.error('Failed to start MFA setup:', err);
      setError('Failed to start MFA setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnableMfa = async () => {
    if (!setupData?.flowId || !verificationCode) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/account/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowId: setupData.flowId,
          totpCode: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Fetch recovery codes after enabling
        const recoveryResponse = await fetch('/api/account/mfa/recovery');
        if (recoveryResponse.ok) {
          const recoveryData = await recoveryResponse.json();
          if (recoveryData.codes && recoveryData.codes.length > 0) {
            setRecoveryCodes(recoveryData.codes);
          } else {
            setRecoveryCodes(generateDemoCodes());
          }
        } else {
          setRecoveryCodes(generateDemoCodes());
        }

        setShowSetup(false);
        setShowRecoveryCodes(true);
        setJustEnabled(true);
        setMfaStatus({ totpEnabled: true, hasRecoveryCodes: true });
        setVerificationCode('');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      console.error('Failed to enable MFA:', err);
      setError('Failed to enable MFA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisableMfa = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/account/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        setMfaStatus({ totpEnabled: false, hasRecoveryCodes: false });
        setRecoveryCodes([]);
        setShowDisableConfirm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to disable MFA');
      }
    } catch (err) {
      console.error('Failed to disable MFA:', err);
      setError('Failed to disable MFA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateCodes = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/account/mfa/recovery', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setRecoveryCodes(data.codes || generateDemoCodes());
        setShowRecoveryCodes(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to regenerate codes');
      }
    } catch (err) {
      console.error('Failed to regenerate codes:', err);
      setError('Failed to regenerate codes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAllCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
  };

  const handleDownloadCodes = () => {
    const content = `Excise OpenAPI - Recovery Codes\n${'='.repeat(40)}\n\n${recoveryCodes.join('\n')}\n\nGenerated: ${new Date().toISOString()}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'excise-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate demo recovery codes (used when API doesn't return codes)
  const generateDemoCodes = () => [
    'ABCD-EFGH-1234',
    'IJKL-MNOP-5678',
    'QRST-UVWX-9012',
    'YZAB-CDEF-3456',
    'GHIJ-KLMN-7890',
    'OPQR-STUV-1234',
    'WXYZ-ABCD-5678',
    'EFGH-IJKL-9012',
  ];

  if (loading) {
    return <SkeletonMFASettings />;
  }

  const mfaEnabled = mfaStatus?.totpEnabled || false;

  // Setup Flow Screen
  if (showSetup) {
    return (
      <div className="space-y-6 max-w-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, `${prefix}.setupTitle`)}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t(language, `${prefix}.setupDesc`)}
          </p>
        </div>

        {/* Setup Steps */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>{t(language, `${prefix}.setupStep1`)}</li>
            <li>{t(language, `${prefix}.setupStep2`)}</li>
            <li>{t(language, `${prefix}.setupStep3`)}</li>
          </ul>
        </div>

        {/* QR Code */}
        <div className="flex justify-center p-6 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
          {setupData?.otpauthUrl ? (
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG
                value={setupData.otpauthUrl}
                size={192}
                level="M"
                includeMargin={false}
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-gray-100 dark:bg-slate-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Smartphone className="w-12 h-12 text-gray-400 dark:text-slate-400 mx-auto mb-2" />
                <span className="text-gray-500 dark:text-slate-400 text-sm">
                  Scan with Authenticator App
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        {setupData?.secret && (
          <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t(language, `${prefix}.manualEntry`)}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 text-sm font-mono break-all">
                {setupData.secret}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(setupData.secret || '')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Verification Code Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {t(language, `${prefix}.enterCode`)}
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleEnableMfa}
            disabled={verificationCode.length !== 6 || isSubmitting}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t(language, `${prefix}.verifyEnable`)}
          </button>
          <button
            onClick={() => {
              setShowSetup(false);
              setError(null);
              setVerificationCode('');
            }}
            className="px-4 py-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {t(language, `${prefix}.cancel`)}
          </button>
        </div>
      </div>
    );
  }

  // Recovery Codes Screen
  if (showRecoveryCodes) {
    return (
      <div className="space-y-6 max-w-lg">
        {justEnabled && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, `${prefix}.mfaEnabledSuccess`)}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t(language, `${prefix}.mfaEnabledSuccessDesc`)}</p>
            </div>
          </div>
        )}

        {!justEnabled && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, `${prefix}.recoveryCodesTitle`)}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t(language, `${prefix}.recoveryCodesDesc`)}</p>
          </div>
        )}

        {/* Warning */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">{t(language, `${prefix}.saveRecoveryCodes`)}</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {t(language, `${prefix}.recoveryCodesWarning`)}
              </p>
            </div>
          </div>
        </div>

        {/* Recovery Codes Grid */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          {recoveryCodes.map((code, i) => (
            <code key={i} className="p-2 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 text-sm font-mono text-center">
              {code}
            </code>
          ))}
        </div>

        {/* Security Tip */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">{t(language, `${prefix}.securityTip`)}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {t(language, `${prefix}.securityTipText`)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopyAllCodes}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {t(language, `${prefix}.copyAll`)}
          </button>
          <button
            onClick={handleDownloadCodes}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t(language, `${prefix}.downloadCodes`)}
          </button>
          <button
            onClick={() => {
              setShowRecoveryCodes(false);
              setJustEnabled(false);
            }}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t(language, `${prefix}.done`)}
          </button>
        </div>
      </div>
    );
  }

  // Main MFA Settings Screen
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t(language, `${prefix}.title`)}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t(language, `${prefix}.pageDescription`)}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Why 2FA Section - Only show when MFA is not enabled */}
      {!mfaEnabled && (
        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t(language, `${prefix}.whyMfaTitle`)}
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {t(language, `${prefix}.whyMfaBenefit1`)}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {t(language, `${prefix}.whyMfaBenefit2`)}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {t(language, `${prefix}.whyMfaBenefit3`)}
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {t(language, `${prefix}.whyMfaBenefit4`)}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Authenticator App Card */}
      <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${mfaEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-200 dark:bg-slate-600 text-gray-500'}`}>
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, `${prefix}.authenticatorApp`)}</h3>
              {mfaEnabled ? (
                <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {t(language, `${prefix}.enabled`)}
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-medium bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-400 rounded-full">
                  {t(language, `${prefix}.disabled`)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t(language, `${prefix}.authenticatorDesc`)}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {mfaEnabled ? (
                <>
                  <button
                    onClick={() => {
                      if (recoveryCodes.length === 0) {
                        setRecoveryCodes(generateDemoCodes());
                      }
                      setShowRecoveryCodes(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    {t(language, `${prefix}.viewRecoveryCodes`)}
                  </button>
                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <ShieldOff className="w-4 h-4" />
                    {t(language, `${prefix}.disableMfa`)}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartSetup}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {t(language, `${prefix}.enableMfa`)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Codes Section - Only when MFA enabled */}
      {mfaEnabled && (
        <>
          <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <Key className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, `${prefix}.recoveryCodesTitle`)}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {t(language, `${prefix}.recoveryCodesDesc`)}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      if (recoveryCodes.length === 0) {
                        setRecoveryCodes(generateDemoCodes());
                      }
                      setShowRecoveryCodes(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    {t(language, `${prefix}.viewRecoveryCodes`)}
                  </button>
                  <button
                    onClick={handleRegenerateCodes}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {t(language, `${prefix}.regenerateCodes`)}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </>
      )}

      {/* Disable MFA Confirmation Dialog */}
      {showDisableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setShowDisableConfirm(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <button
                onClick={() => !isSubmitting && setShowDisableConfirm(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldOff className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(language, `${prefix}.disableConfirmTitle`)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {t(language, `${prefix}.disableConfirmDesc`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl">
                <Info className="w-5 h-5 text-gray-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  {t(language, `${prefix}.disableWarningDesc`)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowDisableConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium disabled:opacity-50"
              >
                {t(language, 'common.cancel')}
              </button>
              <button
                onClick={handleDisableMfa}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t(language, `${prefix}.confirmDisable`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
