'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface CookiePreferences {
  version: string;
  timestamp: number;
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

interface CookieConsentContextType {
  consentGiven: boolean;
  preferences: CookiePreferences | null;
  acceptAll: () => void;
  rejectOptional: () => void;
  updatePreferences: (prefs: CookiePreferences) => void;
  openSettings: () => void;
  closeSettings: () => void;
  showSettings: boolean;
  canUseFunctional: boolean;
  canUseAnalytics: boolean;
  mounted: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const CONSENT_VERSION = '1.0';
const CONSENT_GIVEN_KEY = 'cookie-consent-given';
const CONSENT_PREFS_KEY = 'cookie-consent-preferences';
const CONSENT_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consentGiven, setConsentGiven] = useState(true); // Start as true to hide banner initially
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const given = localStorage.getItem(CONSENT_GIVEN_KEY) === 'true';
    const storedPrefs = localStorage.getItem(CONSENT_PREFS_KEY);

    if (given && storedPrefs) {
      try {
        const prefs = JSON.parse(storedPrefs) as CookiePreferences;

        // Check if consent has expired (older than 1 year)
        const consentAge = Date.now() - prefs.timestamp;
        if (consentAge > CONSENT_MAX_AGE) {
          // Consent expired, clear and re-prompt
          localStorage.removeItem(CONSENT_GIVEN_KEY);
          localStorage.removeItem(CONSENT_PREFS_KEY);
          setConsentGiven(false);
          setPreferences(null);
        } else {
          setConsentGiven(true);
          setPreferences(prefs);
        }
      } catch (error) {
        console.error('Failed to parse cookie consent preferences:', error);
        // Invalid data, clear and re-prompt
        localStorage.removeItem(CONSENT_GIVEN_KEY);
        localStorage.removeItem(CONSENT_PREFS_KEY);
        setConsentGiven(false);
      }
    } else {
      // No consent given, show banner
      setConsentGiven(false);
    }

    setMounted(true);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(CONSENT_GIVEN_KEY, 'true');
    localStorage.setItem(CONSENT_PREFS_KEY, JSON.stringify(prefs));
    setConsentGiven(true);
    setPreferences(prefs);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      essential: true,
      functional: true,
      analytics: true,
    });
  };

  const rejectOptional = () => {
    savePreferences({
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      essential: true,
      functional: false,
      analytics: false,
    });
  };

  const updatePreferences = (prefs: CookiePreferences) => {
    savePreferences(prefs);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const canUseFunctional = preferences?.functional ?? false;
  const canUseAnalytics = preferences?.analytics ?? false;

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consentGiven,
        preferences,
        acceptAll,
        rejectOptional,
        updatePreferences,
        openSettings,
        closeSettings,
        showSettings,
        canUseFunctional,
        canUseAnalytics,
        mounted,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    // Return stub during SSR/build to avoid breaking prerendering
    return {
      consentGiven: false,
      preferences: null,
      acceptAll: () => {},
      rejectOptional: () => {},
      updatePreferences: () => {},
      openSettings: () => {},
      closeSettings: () => {},
      showSettings: false,
      canUseFunctional: false,
      canUseAnalytics: false,
      mounted: false,
    };
  }
  return context;
}
