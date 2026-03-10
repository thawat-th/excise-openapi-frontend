'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/i18n/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_COOKIE_NAME = 'gov_ui_language';
const LANGUAGE_STORAGE_KEY = 'gov_ui_language';

/**
 * Check if functional cookies are allowed
 */
function canUseFunctionalCookies(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const consentPrefs = localStorage.getItem('cookie-consent-preferences');
    if (!consentPrefs) {
      // No consent given yet - allow temporary usage but don't persist
      return false;
    }

    const prefs = JSON.parse(consentPrefs);
    return prefs.functional === true;
  } catch (error) {
    console.error('Failed to check cookie consent:', error);
    return false;
  }
}

/**
 * Update DOM and cookie when language changes
 * Cookie is source of truth - localStorage is just backup for cross-tab communication
 * Only call this from useEffect or event handlers (NOT during render!)
 * Respects cookie consent - only persists if functional cookies are allowed
 */
function applyLanguageToDOM(lang: Language) {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;

  // Always update HTML attributes and font class immediately for user experience
  html.lang = lang;

  // Update font class
  html.classList.remove('font-en', 'font-th');
  html.classList.add(lang === 'th' ? 'font-th' : 'font-en');

  // Only persist if functional cookies are allowed
  if (canUseFunctionalCookies()) {
    // Update cookie (source of truth for next page load)
    // Max-age: 1 year
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${lang}; path=/; max-age=31536000; SameSite=Lax`;

    // Sync to localStorage (for offline/cross-tab reference)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      // Fail silently if localStorage unavailable
    }
  }
  // If functional cookies are not allowed, language change is applied but not persisted
  // User will see the change immediately, but it won't survive page reload
}

/**
 * LanguageProvider: manages language state with cookie as server source of truth
 *
 * CRITICAL: initialLanguage is passed from server (layout.tsx)
 * This prevents hydration mismatch because:
 * - Server computes initialLanguage from cookie
 * - Passes it as prop to LanguageProvider
 * - Client hydrates with same initialLanguage (no DOM reading during render)
 * - All DOM/localStorage operations are in useEffect only
 *
 * Features:
 * - Cookie is single source of truth (server-controlled)
 * - Multi-tab sync via storage event listener
 * - No useEffect on mount - uses prop from server
 * - Only reads DOM/localStorage in useEffect (safe for hydration)
 */
export function LanguageProvider({
  children,
  initialLanguage,
  nonce,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
  nonce?: string;
}) {
  // Initialize with server-provided value (NOT from DOM)
  // This ensures SSR and hydration match exactly
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Multi-tab sync: listen for storage changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && e.newValue) {
        const newLang = (e.newValue as Language) === 'th' ? 'th' : 'en';
        setLanguageState(newLang);
        applyLanguageToDOM(newLang);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    applyLanguageToDOM(lang);

    // Notify other tabs via storage event
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      // Fail silently
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
