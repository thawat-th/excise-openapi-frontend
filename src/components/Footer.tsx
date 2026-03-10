'use client';

import { useLanguage } from '@/components/LanguageProvider';
// import { useCookieConsent } from '@/components/legal/useCookieConsent';
import { t, Language } from '@/i18n/i18n';
import Link from 'next/link';

export function Footer() {
  const { language } = useLanguage();
  // const { openSettings } = useCookieConsent();

  return (
    <footer className="bg-excise-900 dark:bg-excise-950 text-excise-100 dark:text-excise-200 border-t border-excise-700 dark:border-excise-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img
              src="/logo-excise-white.svg"
              alt="Excise Department Logo"
              className="h-14 w-auto mb-3 opacity-90"
            />
            <p className="text-excise-400 dark:text-excise-500 text-sm">
              {t(language, 'footer.official')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t(language, 'footer.documentation')}</h3>
            <ul className="text-excise-400 dark:text-excise-500 text-sm space-y-1">
              <li>
                <a href="#" className="hover:text-white dark:hover:text-excise-200 transition-colors">
                  {t(language, 'footer.apiDocs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white dark:hover:text-excise-200 transition-colors">
                  {t(language, 'footer.gettingStarted')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t(language, 'footer.support')}</h3>
            <ul className="text-excise-400 dark:text-excise-500 text-sm space-y-1">
              <li>
                <a href="#" className="hover:text-white dark:hover:text-excise-200 transition-colors">
                  {t(language, 'footer.contactUs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white dark:hover:text-excise-200 transition-colors">
                  {t(language, 'footer.statusPage')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t(language, 'footer.legal')}</h3>
            <ul className="text-excise-400 dark:text-excise-500 text-sm space-y-1">
              <li>
                <Link href="/legal/privacy" className="hover:text-white dark:hover:text-excise-200 transition-colors">
                  {t(language, 'footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-white dark:hover:text-excise-200 transition-colors">
                  {t(language, 'footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-white dark:hover:text-excise-200 transition-colors">
                  {t(language, 'footer.cookiePolicy')}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {/* TODO: implement cookie consent */}}
                  className="hover:text-white dark:hover:text-excise-200 transition-colors text-left"
                >
                  {t(language, 'footer.cookieSettings')}
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-excise-700 dark:border-excise-800 mt-8 pt-8 text-center text-excise-400 dark:text-excise-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Excise Government. {t(language, 'footer.copyright')}
          </p>
          <p className="mt-2 text-xs text-excise-500 dark:text-excise-600">
            v{process.env.NEXT_PUBLIC_BUILD_VERSION || '0.0.0'} ({process.env.NEXT_PUBLIC_BUILD_DATE || 'dev'})
          </p>
        </div>
      </div>
    </footer>
  );
}
