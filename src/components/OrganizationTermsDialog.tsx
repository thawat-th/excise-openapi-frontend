'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

interface OrganizationTermsDialogProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export function OrganizationTermsDialog({ open, onAccept, onCancel }: OrganizationTermsDialogProps) {
  const { language } = useLanguage();
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      setAgreed(false);
      onAccept();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-excise-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-excise-900 dark:text-white" lang={language}>
            {t(language, 'auth.orgTermsDialog.title')}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Thai Section */}
          <div lang="th">
            <h3 className="text-lg font-semibold text-excise-900 dark:text-white mb-3">
              ข้อตกลงและเงื่อนไขการลงทะเบียนสำหรับหน่วยงาน/องค์กร
            </h3>
            <div className="space-y-3 text-sm text-excise-700 dark:text-slate-300 leading-relaxed">
              <p>{t('th', 'auth.orgTermsDialog.section1')}</p>
              <p>{t('th', 'auth.orgTermsDialog.section2')}</p>
              <p>{t('th', 'auth.orgTermsDialog.section3')}</p>
              <p>{t('th', 'auth.orgTermsDialog.section4')}</p>
              <p>{t('th', 'auth.orgTermsDialog.section5')}</p>
              <p>{t('th', 'auth.orgTermsDialog.section6')}</p>
              <p>{t('th', 'auth.orgTermsDialog.section7')}</p>

              <div className="border-t border-excise-200 dark:border-slate-700 pt-4 mt-4">
                <p className="font-semibold text-excise-900 dark:text-white mb-2">
                  {t('th', 'auth.orgTermsDialog.userAcknowledgment')}
                </p>
                <p>{t('th', 'auth.orgTermsDialog.agreeCheckbox')}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-excise-300 dark:border-slate-600 pt-6"></div>

          {/* English Section */}
          <div lang="en">
            <h3 className="text-lg font-semibold text-excise-900 dark:text-white mb-3">
              Terms and Conditions for Organization Registration
            </h3>
            <div className="space-y-3 text-sm text-excise-700 dark:text-slate-300 leading-relaxed">
              <p>{t('en', 'auth.orgTermsDialog.section1')}</p>
              <p>{t('en', 'auth.orgTermsDialog.section2')}</p>
              <p>{t('en', 'auth.orgTermsDialog.section3')}</p>
              <p>{t('en', 'auth.orgTermsDialog.section4')}</p>
              <p>{t('en', 'auth.orgTermsDialog.section5')}</p>
              <p>{t('en', 'auth.orgTermsDialog.section6')}</p>
              <p>{t('en', 'auth.orgTermsDialog.section7')}</p>

              <div className="border-t border-excise-200 dark:border-slate-700 pt-4 mt-4">
                <p className="font-semibold text-excise-900 dark:text-white mb-2">
                  {t('en', 'auth.orgTermsDialog.userAcknowledgment')}
                </p>
                <p>{t('en', 'auth.orgTermsDialog.agreeCheckbox')}</p>
              </div>
            </div>
          </div>

          {/* Checkbox at bottom of content */}
          <div className="border-t border-excise-200 dark:border-slate-700 pt-6 mt-6">
            <div className="flex items-start gap-3">
              <input
                id="org-terms-agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-excise-300 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
              />
              <div className="text-sm text-excise-700 dark:text-slate-300 cursor-pointer leading-relaxed space-y-2">
                <label htmlFor="org-terms-agree" className="block" lang="th">
                  {t('th', 'auth.orgTermsDialog.agreeCheckbox')}
                </label>
                <label htmlFor="org-terms-agree" className="block" lang="en">
                  {t('en', 'auth.orgTermsDialog.agreeCheckbox')}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Buttons */}
        <div className="border-t border-excise-200 dark:border-slate-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-excise-300 dark:border-slate-600 text-excise-700 dark:text-slate-300 rounded-lg hover:bg-excise-50 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            {language === 'th' ? t('th', 'auth.orgTermsDialog.cancelButton') : t('en', 'auth.orgTermsDialog.cancelButton')}
          </button>
          <button
            onClick={handleAccept}
            disabled={!agreed}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === 'th' ? t('th', 'auth.orgTermsDialog.acceptButton') : t('en', 'auth.orgTermsDialog.acceptButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
