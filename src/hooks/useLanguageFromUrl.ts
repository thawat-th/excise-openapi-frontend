'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Language } from '@/i18n/i18n';

/**
 * Extract language from URL pathname
 * Example: /th/dashboard → 'th', /en/profile → 'en'
 */
export function getLanguageFromPathname(pathname: string): Language {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment === 'th') return 'th';
  if (firstSegment === 'en') return 'en';

  // Default to localStorage or 'en'
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('gov_ui_language') as Language | null;
      if (saved === 'th') return 'th';
    } catch (e) {
      // localStorage not available
    }
  }

  return 'en';
}

/**
 * Hook to get language from URL and handle language switching
 * When user changes language, it updates URL
 */
export function useLanguageFromUrl() {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>('en');

  // Sync state with pathname on mount/change
  useEffect(() => {
    const lang = getLanguageFromPathname(pathname);
    setLanguageState(lang);

    // Update HTML lang attribute and localStorage
    document.documentElement.lang = lang;

    try {
      localStorage.setItem('gov_ui_language', lang);
    } catch (e) {
      // localStorage not available
    }
  }, [pathname]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);

    // Update HTML lang attribute
    document.documentElement.lang = newLang;

    // Save to localStorage as backup
    try {
      localStorage.setItem('gov_ui_language', newLang);
    } catch (e) {
      // localStorage not available
    }

    // Update URL: prepend /th or /en to path
    const currentSegment = pathname.split('/').filter(Boolean)[0];
    const isLanguageSegment = currentSegment === 'th' || currentSegment === 'en';

    let newPathname = pathname;
    if (isLanguageSegment) {
      // Replace existing language segment
      newPathname = pathname.replace(/^\/(th|en)/, `/${newLang}`);
    } else {
      // Prepend language segment
      newPathname = `/${newLang}${pathname}`;
    }

    router.push(newPathname);
  };

  return { language, setLanguage };
}
