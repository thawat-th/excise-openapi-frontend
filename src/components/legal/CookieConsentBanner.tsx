'use client';

import { useCookieConsent } from './useCookieConsent';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { Cookie, Settings, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export function CookieConsentBanner() {
  const { consentGiven, acceptAll, rejectOptional, openSettings, mounted } = useCookieConsent();
  const { language } = useLanguage();

  // Don't show banner until mounted (prevent flash during SSR)
  if (!mounted) return null;

  // Don't show banner if consent already given
  if (consentGiven) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div
        role="dialog"
        aria-label={t(language, 'legal.banner.ariaLabel')}
        className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl px-4 sm:px-6 lg:px-8 py-4"
      >
        <div className="flex flex-col gap-3">
          {/* Title */}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">
              {t(language, 'legal.banner.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
              {t(language, 'legal.banner.message')}{' '}
              <Link
                href="/legal/cookies"
                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 transition-colors"
              >
                {t(language, 'legal.banner.readMore')}
              </Link>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            {/* Reject All */}
            <button
              onClick={rejectOptional}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all whitespace-nowrap"
              aria-label={t(language, 'legal.banner.rejectOptionalAria')}
            >
              {t(language, 'legal.banner.rejectOptional')}
            </button>

            {/* Customize */}
            <button
              onClick={openSettings}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
              aria-label={t(language, 'legal.banner.customizeAria')}
            >
              {t(language, 'legal.banner.customize')}
            </button>

            {/* Accept All */}
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 hover:scale-105 transition-all shadow-md whitespace-nowrap"
              aria-label={t(language, 'legal.banner.acceptAllAria')}
            >
              {t(language, 'legal.banner.acceptAll')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
