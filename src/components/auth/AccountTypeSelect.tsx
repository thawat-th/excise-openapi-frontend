'use client';

import { User, Building2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

export type AccountType = 'individual' | 'organization';

interface AccountTypeSelectProps {
  onSelect: (type: AccountType) => void;
  onBack: () => void;
}

export function AccountTypeSelect({ onSelect, onBack }: AccountTypeSelectProps) {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-excise-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-excise-900 dark:text-white">
              {t(language, 'auth.register.title')}
            </h1>
            <p className="text-excise-600 dark:text-slate-400 text-sm mt-1">
              {t(language, 'auth.accountType.subtitle')}
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Individual Card */}
            <button
              onClick={() => onSelect('individual')}
              className="group p-6 border-2 border-excise-200 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-200 text-left bg-white dark:bg-slate-700"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/70 transition-colors">
                  <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-excise-900 dark:text-white mb-2">
                  {t(language, 'auth.accountType.individual')}
                </h3>
                <p className="text-sm text-excise-600 dark:text-slate-400">
                  {t(language, 'auth.accountType.individualDesc')}
                </p>
                <div className="mt-4 px-4 py-2 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium group-hover:bg-primary-100 dark:group-hover:bg-primary-900/70 transition-colors">
                  {t(language, 'auth.accountType.select')}
                </div>
              </div>
            </button>

            {/* Organization Card */}
            <button
              onClick={() => onSelect('organization')}
              className="group p-6 border-2 border-excise-200 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-200 text-left bg-white dark:bg-slate-700"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/70 transition-colors">
                  <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-excise-900 dark:text-white mb-2">
                  {t(language, 'auth.accountType.organization')}
                </h3>
                <p className="text-sm text-excise-600 dark:text-slate-400">
                  {t(language, 'auth.accountType.organizationDesc')}
                </p>
                <div className="mt-4 px-4 py-2 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium group-hover:bg-primary-100 dark:group-hover:bg-primary-900/70 transition-colors">
                  {t(language, 'auth.accountType.select')}
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-excise-200 dark:border-slate-700">
            <p className="text-excise-600 dark:text-slate-400 text-sm">
              {t(language, 'auth.register.haveAccount')}{' '}
              <a href="/auth/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                {t(language, 'auth.register.loginLink')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
