export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_KEY = 'gov_ui_theme';

/**
 * Get the stored theme preference
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }

  // Default to light
  return 'light';
}

/**
 * Get the system's preferred color scheme
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get the actual theme to apply (resolves 'system' to actual theme)
 */
export function getResolvedTheme(): ResolvedTheme {
  const theme = getTheme();
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply theme to the document
 */
function applyThemeToDOM(resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return;

  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

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
 * Set theme preference and apply it
 * Respects cookie consent - only persists if functional cookies are allowed
 */
export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

  // Always apply theme to DOM immediately for user experience
  applyThemeToDOM(resolvedTheme);

  // Only persist if functional cookies are allowed
  if (canUseFunctionalCookies()) {
    localStorage.setItem(THEME_KEY, theme);
    // Also set cookie for potential server-side usage
    document.cookie = `${THEME_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  }
  // If functional cookies are not allowed, theme change is applied but not persisted
  // User will see the change immediately, but it won't survive page reload
}

/**
 * Toggle between light and dark (skips system)
 */
export function toggleTheme(): Theme {
  const current = getResolvedTheme();
  const newTheme: Theme = current === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on app mount
 */
export function initTheme() {
  const theme = getTheme();
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  applyThemeToDOM(resolvedTheme);
}

/**
 * Listen for system theme changes (for 'system' mode)
 */
export function onSystemThemeChange(callback: (theme: ResolvedTheme) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    // Only react if user has 'system' preference
    if (getTheme() === 'system') {
      const newTheme: ResolvedTheme = e.matches ? 'dark' : 'light';
      applyThemeToDOM(newTheme);
      callback(newTheme);
    }
  };

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
