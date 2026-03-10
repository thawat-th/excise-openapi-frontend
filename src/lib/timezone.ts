export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

const TIMEZONE_KEY = 'excise-timezone';

// Common timezones for Thailand/SEA region + some global options
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'Asia/Bangkok', label: 'Bangkok, Thailand', offset: 'UTC+7' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan', offset: 'UTC+9' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: 'UTC+8' },
  { value: 'Asia/Shanghai', label: 'Shanghai, China', offset: 'UTC+8' },
  { value: 'Asia/Seoul', label: 'Seoul, South Korea', offset: 'UTC+9' },
  { value: 'Asia/Jakarta', label: 'Jakarta, Indonesia', offset: 'UTC+7' },
  { value: 'Asia/Manila', label: 'Manila, Philippines', offset: 'UTC+8' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur, Malaysia', offset: 'UTC+8' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh, Vietnam', offset: 'UTC+7' },
  { value: 'Asia/Kolkata', label: 'Mumbai, India', offset: 'UTC+5:30' },
  { value: 'Asia/Dubai', label: 'Dubai, UAE', offset: 'UTC+4' },
  { value: 'Europe/London', label: 'London, UK', offset: 'UTC+0/+1' },
  { value: 'Europe/Paris', label: 'Paris, France', offset: 'UTC+1/+2' },
  { value: 'Europe/Berlin', label: 'Berlin, Germany', offset: 'UTC+1/+2' },
  { value: 'America/New_York', label: 'New York, USA', offset: 'UTC-5/-4' },
  { value: 'America/Los_Angeles', label: 'Los Angeles, USA', offset: 'UTC-8/-7' },
  { value: 'America/Chicago', label: 'Chicago, USA', offset: 'UTC-6/-5' },
  { value: 'Australia/Sydney', label: 'Sydney, Australia', offset: 'UTC+10/+11' },
  { value: 'Pacific/Auckland', label: 'Auckland, New Zealand', offset: 'UTC+12/+13' },
];

/**
 * Get the stored timezone preference or detect from browser
 */
export function getTimezone(): string {
  if (typeof window === 'undefined') return 'Asia/Bangkok';

  const stored = localStorage.getItem(TIMEZONE_KEY);
  if (stored) {
    return stored;
  }

  // Try to detect from browser
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Check if detected timezone is in our list
    if (TIMEZONE_OPTIONS.some(tz => tz.value === detected)) {
      return detected;
    }
  } catch {
    // Fallback
  }

  // Default to Bangkok for Thai government system
  return 'Asia/Bangkok';
}

/**
 * Check if functional cookies are allowed
 */
function canUseFunctionalCookies(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const consentPrefs = localStorage.getItem('cookie-consent-preferences');
    if (!consentPrefs) {
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
 * Set timezone preference
 * Respects cookie consent - only persists if functional cookies are allowed
 */
export function setTimezone(timezone: string) {
  if (typeof window === 'undefined') return;

  // Only persist if functional cookies are allowed
  if (canUseFunctionalCookies()) {
    localStorage.setItem(TIMEZONE_KEY, timezone);
    // Also set cookie for potential server-side usage
    document.cookie = `${TIMEZONE_KEY}=${timezone}; path=/; max-age=31536000; SameSite=Lax`;
  }
  // If functional cookies are not allowed, timezone change won't be persisted
}

/**
 * Format a date in the user's timezone
 */
export function formatInTimezone(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const timezone = getTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleString('th-TH', {
    timeZone: timezone,
    ...options,
  });
}
