import type { Metadata } from 'next';
import './globals.css';
import { inter, kanit } from './fonts';
import { LanguageProvider } from '@/components/LanguageProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieConsentProvider } from '@/components/legal/useCookieConsent';
import { CookieConsentBanner } from '@/components/legal/CookieConsentBanner';
import { CookieSettingsModal } from '@/components/legal/CookieSettingsModal';
import { cookies } from 'next/headers';
import { generateNonce } from '@/lib/nonce';

export const metadata: Metadata = {
  title: 'Excise OpenAPI – Excise Government Open API Platform',
  description: 'The official portal for accessing Excise Government APIs',
};

/**
 * Get initial language from HTTP cookie (source of truth)
 * Cookie is set by server when user changes language
 * Fallback to 'th' if not set
 */
function getInitialLanguage(): 'en' | 'th' {
  try {
    const cookieStore = cookies();
    const lang = cookieStore.get('gov_ui_language')?.value;
    return lang === 'en' ? 'en' : 'th';
  } catch {
    return 'th';
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server: determine language from cookie (single source of truth)
  const initialLanguage = getInitialLanguage();
  const fontClass = initialLanguage === 'th' ? 'font-th' : 'font-en';
  // Both Inter and Kanit use CSS variables from next/font
  const fontVariables = `${inter.variable} ${kanit.variable}`;

  // Generate CSP nonce for inline script
  const nonce = generateNonce();

  return (
    <html lang={initialLanguage} className={`${fontVariables} ${fontClass}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/*
          Critical CSS-in-JS for font class before React hydration
          Runs immediately, before hydration starts
          Uses nonce for CSP compliance
          Cookie is source of truth - syncs client-side font class
        */}
        {/* Prevent flash: hide until theme is applied */}
        <style
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `html:not(.theme-ready) { visibility: hidden; }`,
          }}
        />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const htmlElement = document.documentElement;
                let currentClass = htmlElement.className || '';

                // Theme: Apply dark class before paint to prevent flash
                const theme = localStorage.getItem('gov_ui_theme');
                if (theme === 'dark') {
                  if (!currentClass.includes('dark')) {
                    currentClass = currentClass + ' dark';
                  }
                } else {
                  currentClass = currentClass.replace(/\\bdark\\b/g, '').trim();
                }

                // Language: Sync font class from cookie
                const cookieLang = (document.cookie.match(/gov_ui_language=([^;]+)/) || [])[1] || 'th';
                const expectedFontClass = 'font-' + cookieLang;

                if (!currentClass.includes(expectedFontClass)) {
                  currentClass = currentClass.replace(/font-(en|th)/g, '').trim() + ' ' + expectedFontClass;
                  htmlElement.lang = cookieLang;
                }

                // Mark as ready and show
                htmlElement.className = (currentClass + ' theme-ready').replace(/\\s+/g, ' ').trim();
              } catch (e) {
                // Fallback: show anyway
                document.documentElement.classList.add('theme-ready');
              }

              // BFF Pattern: Fetch Polyfill - Auto-add credentials to /api calls
              if (typeof window !== 'undefined' && window.fetch) {
                const originalFetch = window.fetch;
                window.fetch = function (input, init) {
                  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
                  if (url.startsWith('/api')) {
                    const modifiedInit = { ...init, credentials: init?.credentials || 'include' };
                    return originalFetch(input, modifiedInit);
                  }
                  return originalFetch(input, init);
                };
              }
            })();`,
          }}
        />
      </head>
      <body className="bg-excise-50 text-excise-900 transition-colors">
        <ThemeProvider>
          <LanguageProvider initialLanguage={initialLanguage} nonce={nonce}>
            <CookieConsentProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <CookieConsentBanner />
              <CookieSettingsModal />
            </CookieConsentProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
