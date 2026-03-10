/**
 * Email Validation Utilities
 * RFC 5322 compliant email validation with domain checks
 */

/**
 * Validate email format using RFC 5322 regex pattern
 * Checks basic email structure: local@domain.extension
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 simplified pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate email domain
 * Checks that domain has at least one dot and valid TLD (2-6 chars)
 */
export function isValidEmailDomain(email: string): boolean {
  if (!email.includes('@')) {
    return false;
  }

  const [, domain] = email.split('@');

  // Domain must have at least one dot
  if (!domain.includes('.')) {
    return false;
  }

  // Domain must not start or end with dot
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }

  // Domain parts validation
  const parts = domain.split('.');

  // Must have at least 2 parts (e.g., example.com)
  if (parts.length < 2) {
    return false;
  }

  // Each part must be non-empty
  if (parts.some(part => part.length === 0)) {
    return false;
  }

  // TLD (last part) must be 2-6 characters and letters only
  const tld = parts[parts.length - 1];
  if (!/^[a-zA-Z]{2,6}$/.test(tld)) {
    return false;
  }

  // Each domain part must start and end with alphanumeric
  // and can contain hyphens in the middle
  for (const part of parts) {
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if email is from a disposable/temporary email service
 * Returns true if email is from a known disposable service
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com',
    'throwaway.email',
    'temp-mail.org',
    'guerrillamail.com',
    '10minutemail.com',
    'mailinator.com',
    'yopmail.com',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain || '');
}

/**
 * Full email validation combining all checks
 */
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email) {
    return {
      valid: false,
      error: 'Email is required',
    };
  }

  if (!isValidEmail(email)) {
    return {
      valid: false,
      error: 'Invalid email format',
    };
  }

  if (!isValidEmailDomain(email)) {
    return {
      valid: false,
      error: 'Invalid email domain',
    };
  }

  if (isDisposableEmail(email)) {
    return {
      valid: false,
      error: 'Disposable emails are not allowed',
    };
  }

  return { valid: true };
}
