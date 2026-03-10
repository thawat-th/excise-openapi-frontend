/**
 * Password Policy Validator
 * Enforces strong password requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character (!@#$%^&*)
 */

import { t, type Language } from '@/i18n/i18n';

export interface PasswordCheckResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecialChar: boolean;
}

export function validatePassword(password: string): PasswordCheckResult {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const checks = validatePassword(password);
  return (
    checks.hasMinLength &&
    checks.hasUppercase &&
    checks.hasLowercase &&
    checks.hasDigit &&
    checks.hasSpecialChar
  );
}

export function getPasswordErrors(password: string, language: Language = 'th'): string[] {
  const checks = validatePassword(password);
  const errors: string[] = [];

  if (!checks.hasMinLength) {
    errors.push(t(language, 'validation.password.minLength'));
  }
  if (!checks.hasUppercase) {
    errors.push(t(language, 'validation.password.uppercase'));
  }
  if (!checks.hasLowercase) {
    errors.push(t(language, 'validation.password.lowercase'));
  }
  if (!checks.hasDigit) {
    errors.push(t(language, 'validation.password.digit'));
  }
  if (!checks.hasSpecialChar) {
    errors.push(t(language, 'validation.password.specialChar'));
  }

  return errors;
}
