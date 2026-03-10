/**
 * ORY Kratos Sessions Helper
 * Manages session listing and revocation for device management
 */

export interface SessionDevice {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrentSession: boolean;
  deviceInfo?: {
    browser?: string;
    os?: string;
  };
}

/**
 * Parse user agent to extract browser and OS info
 */
export function parseUserAgent(userAgent: string): { browser: string; os: string } {
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect OS
  if (/Windows/.test(userAgent)) os = 'Windows';
  else if (/Mac/.test(userAgent)) os = 'macOS';
  else if (/Linux/.test(userAgent)) os = 'Linux';
  else if (/Android/.test(userAgent)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(userAgent)) os = 'iOS';

  // Detect browser
  if (/Chrome/.test(userAgent)) browser = 'Chrome';
  else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) browser = 'Safari';
  else if (/Firefox/.test(userAgent)) browser = 'Firefox';
  else if (/Edge/.test(userAgent)) browser = 'Edge';
  else if (/Opera/.test(userAgent)) browser = 'Opera';

  return { browser, os };
}

/**
 * Format device info for display
 */
export function formatDeviceInfo(userAgent: string): string {
  const { browser, os } = parseUserAgent(userAgent);
  return `${browser} on ${os}`;
}

/**
 * Check if session is old (more than 30 days)
 */
export function isSessionOld(lastActiveAt: string): boolean {
  const lastActive = new Date(lastActiveAt);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return lastActive < thirtyDaysAgo;
}

/**
 * Check if session is very old (more than 90 days)
 */
export function isSessionVeryOld(lastActiveAt: string): boolean {
  const lastActive = new Date(lastActiveAt);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  return lastActive < ninetyDaysAgo;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 1) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
