'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { FileText, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  const { language } = useLanguage();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-700 px-8 py-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-850">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t(language, 'legal.terms.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(language, 'legal.terms.lastUpdated')}
        </p>
      </div>

      <div className="p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-excise-600 dark:text-excise-400" />
            {t(language, 'legal.terms.intro.title')}
          </h2>
          <div className="bg-excise-50 dark:bg-excise-900/20 border border-excise-200 dark:border-excise-800 rounded-lg p-4 space-y-3">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t(language, 'legal.terms.intro.desc')}
            </p>
            <p className="text-sm font-semibold text-excise-700 dark:text-excise-300">
              {t(language, 'legal.terms.intro.acceptance')}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t(language, 'legal.terms.acceptance.title')}
          </h2>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                {t(language, 'legal.terms.acceptance.binding')}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t(language, 'legal.terms.acceptance.bindingDesc')}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                {t(language, 'legal.terms.acceptance.capacity')}
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                {t(language, 'legal.terms.acceptance.capacityDesc')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
