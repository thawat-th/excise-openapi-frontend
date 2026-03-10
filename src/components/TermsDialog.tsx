'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

interface TermsDialogProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
  accountType?: 'individual' | 'organization';
}

export function TermsDialog({ open, onAccept, onCancel, accountType = 'individual' }: TermsDialogProps) {
  const { language } = useLanguage();
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      setAgreed(false);
      onAccept();
    }
  };

  if (!open) return null;

  const isOrganization = accountType === 'organization';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-excise-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-excise-900 dark:text-white mb-2">
            {t(language, isOrganization ? 'auth.termsDialog.titleOrg' : 'auth.termsDialog.title')}
          </h2>
          <p className="text-sm text-excise-600 dark:text-slate-400">
            {t(language, 'auth.termsDialog.subtitle')}
          </p>
        </div>

        {/* Scrollable Content - Full Terms Text */}
        <div className="overflow-y-auto flex-1 p-6 bg-white dark:bg-slate-800">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {/* Introduction */}
            <div className="mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {t(language, 'auth.termsDialog.intro')}
              </p>
            </div>

            {/* Sections 1-7 - Simple text paragraphs */}
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <section key={num} className="mb-5">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {t(language, `auth.termsDialog.section${num}`)}
                </p>
              </section>
            ))}

            {/* Section 8 - Organization specific */}
            {isOrganization && (
              <section className="mb-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  {t(language, 'auth.termsDialog.section8.title')}
                </h3>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p className="whitespace-pre-wrap">{t(language, 'auth.termsDialog.section8.content1')}</p>
                  <p className="whitespace-pre-wrap">{t(language, 'auth.termsDialog.section8.content2')}</p>
                  <p className="whitespace-pre-wrap">{t(language, 'auth.termsDialog.section8.content3')}</p>
                  <p className="whitespace-pre-wrap">{t(language, 'auth.termsDialog.section8.content4')}</p>
                </div>
              </section>
            )}

            {/* Effective Date */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t(language, 'auth.termsDialog.effectiveDate')}
              </p>
            </div>
          </div>

          {/* Checkbox at bottom of content */}
          <div className="border-t border-gray-300 dark:border-gray-600 pt-6 mt-8">
            <div className="flex items-start gap-3">
              <input
                id="terms-agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-400 dark:border-gray-500 text-gray-900 dark:bg-gray-700 cursor-pointer focus:ring-2 focus:ring-gray-500"
              />
              <label htmlFor="terms-agree" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed">
                {t(language, isOrganization ? 'auth.termsDialog.agreeTextOrg' : 'auth.termsDialog.agreeText')}
              </label>
            </div>
          </div>
        </div>

        {/* Footer with Buttons */}
        <div className="border-t border-excise-200 dark:border-slate-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-excise-300 dark:border-slate-600 text-excise-700 dark:text-slate-300 rounded-lg hover:bg-excise-50 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            {language === 'th' ? t('th', 'auth.termsDialog.cancelButton') : t('en', 'auth.termsDialog.cancelButton')}
          </button>
          <button
            onClick={handleAccept}
            disabled={!agreed}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === 'th' ? t('th', 'auth.termsDialog.acceptButton') : t('en', 'auth.termsDialog.acceptButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
