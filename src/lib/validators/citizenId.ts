/**
 * Thai Citizen ID Validator
 * Validates 13-digit Thai national ID with checksum algorithm
 */

export function validateThaiCitizenId(value: string): {
  valid: boolean;
  error?: string;
} {
  // Remove spaces and dashes
  const cleaned = value.replace(/[\s-]/g, '');

  // Check length
  if (cleaned.length !== 13) {
    return {
      valid: false,
      error: 'Citizen ID must be exactly 13 digits',
    };
  }

  // Check all digits
  if (!/^\d{13}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Citizen ID must contain only numbers',
    };
  }

  // Validate checksum using Thai national ID algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i], 10) * (13 - i);
  }

  const checksum = (11 - (sum % 11)) % 10;
  const lastDigit = parseInt(cleaned[12], 10);

  if (checksum !== lastDigit) {
    return {
      valid: false,
      error: 'Invalid Citizen ID checksum',
    };
  }

  return { valid: true };
}

/**
 * Format Thai Citizen ID for display (XXX-XXXX-XXXXX-XX-X)
 */
export function formatThaiCitizenId(value: string): string {
  const cleaned = value.replace(/[\s-]/g, '');
  if (cleaned.length !== 13) return value;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 12)}-${cleaned.slice(12, 14)}-${cleaned.slice(14)}`;
}
