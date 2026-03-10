'use client';

/**
 * Get the current language from the data-language attribute
 * This works immediately without waiting for React to mount
 * Use this in component render logic to prevent flicker
 */
export function getLanguageFromDOM(): 'en' | 'th' {
  if (typeof document === 'undefined') return 'en';
  const lang = document.documentElement.getAttribute('data-language');
  return lang === 'th' ? 'th' : 'en';
}

/**
 * Check if Thai mode is active
 * Safe to use in conditional rendering during hydration
 */
export function isThaiMode(): boolean {
  return getLanguageFromDOM() === 'th';
}
