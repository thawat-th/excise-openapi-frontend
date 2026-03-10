'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { Shield, User, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-700 px-8 py-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-850">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t(language, 'legal.privacy.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(language, 'legal.privacy.lastUpdated')}
        </p>
      </div>

      <div className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-excise-600 dark:text-excise-400" />
            {t(language, 'legal.privacy.intro.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {t(language, 'legal.privacy.intro.desc')}
          </p>
          <div className="bg-excise-50 dark:bg-excise-900/20 border border-excise-200 dark:border-excise-800 rounded-lg p-4">
            <p className="text-sm text-excise-800 dark:text-excise-300 leading-relaxed">
              {t(language, 'legal.privacy.intro.commitment')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t(language, 'legal.privacy.controller.title')}
          </h2>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-6 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t(language, 'legal.privacy.controller.name')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t(language, 'legal.privacy.controller.nameValue')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t(language, 'legal.privacy.controller.address')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t(language, 'legal.privacy.controller.addressValue')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t(language, 'legal.privacy.controller.email')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t(language, 'legal.privacy.controller.emailValue')}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-excise-50 dark:bg-excise-900/20 border border-excise-200 dark:border-excise-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-excise-600 dark:text-excise-400" />
            {t(language, 'legal.privacy.pdpa.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
            {t(language, 'legal.privacy.pdpa.desc')}
          </p>
          <p className="text-slate-700 dark:text-slate-200 font-medium">
            {t(language, 'legal.privacy.pdpa.commitment')}
          </p>
        </section>
      </div>
    </div>
  );
}
