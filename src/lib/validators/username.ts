/**
 * Username Validation - OWASP Compliant
 *
 * Requirements:
 * - Length: 3-20 characters
 * - Allowed: a-z, A-Z, 0-9, underscore (_), hyphen (-)
 * - Must start with a letter (prevent leading numbers/special chars)
 * - Must end with alphanumeric (no trailing underscore/hyphen)
 * - Case-insensitive (stored as lowercase)
 * - No consecutive special characters
 *
 * Security considerations:
 * - No dots (.) to prevent homograph/lookalike attacks
 * - No spaces or other special chars
 * - Validates against common reserved words
 */

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'system', 'support', 'help',
  'api', 'www', 'ftp', 'mail', 'smtp', 'imap', 'pop', 'webmaster',
  'postmaster', 'hostmaster', 'abuse', 'noreply', 'no-reply',
  'moderator', 'mod', 'null', 'undefined', 'test', 'demo',
  'excise', 'government', 'official', 'staff', 'employee',
];

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
  errorEn?: string;
}

/**
 * Validates username according to OWASP standards
 */
export function validateUsername(username: string): UsernameValidationResult {
  // Empty check
  if (!username || username.trim() === '') {
    return {
      valid: false,
      error: 'กรุณากระบุชื่อผู้ใช้',
      errorEn: 'Username is required',
    };
  }

  const normalized = username.toLowerCase().trim();

  // Length validation
  if (normalized.length < 3) {
    return {
      valid: false,
      error: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร',
      errorEn: 'Username must be at least 3 characters',
    };
  }

  if (normalized.length > 20) {
    return {
      valid: false,
      error: 'ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 20 ตัวอักษร',
      errorEn: 'Username must not exceed 20 characters',
    };
  }

  // Pattern validation: start with letter, alphanumeric + _ - allowed
  // Must end with alphanumeric (no trailing special chars)
  const pattern = /^[a-z][a-z0-9_-]*[a-z0-9]$|^[a-z]$/;
  if (!pattern.test(normalized)) {
    if (!/^[a-z]/.test(normalized)) {
      return {
        valid: false,
        error: 'ชื่อผู้ใช้ต้องขึ้นต้นด้วยตัวอักษร',
        errorEn: 'Username must start with a letter',
      };
    }
    if (!/[a-z0-9]$/.test(normalized)) {
      return {
        valid: false,
        error: 'ชื่อผู้ใช้ต้องลงท้ายด้วยตัวอักษรหรือตัวเลข',
        errorEn: 'Username must end with a letter or number',
      };
    }
    return {
      valid: false,
      error: 'ชื่อผู้ใช้ประกอบด้วยตัวอักษร ตัวเลข _ และ - เท่านั้น',
      errorEn: 'Username can only contain letters, numbers, underscore, and hyphen',
    };
  }

  // No consecutive special characters
  if (/[_-]{2,}/.test(normalized)) {
    return {
      valid: false,
      error: 'ชื่อผู้ใช้ต้องไม่มีเครื่องหมาย _ หรือ - ติดกัน',
      errorEn: 'Username cannot have consecutive underscores or hyphens',
    };
  }

  // Reserved username check
  if (RESERVED_USERNAMES.includes(normalized)) {
    return {
      valid: false,
      error: 'ชื่อผู้ใช้นี้ถูกสงวนไว้ กรุณาเลือกชื่ออื่น',
      errorEn: 'This username is reserved. Please choose another.',
    };
  }

  // Additional security: check for common SQL injection patterns
  const sqlPatterns = [
    /(\-\-|;|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter)/i,
  ];
  for (const sqlPattern of sqlPatterns) {
    if (sqlPattern.test(normalized)) {
      return {
        valid: false,
        error: 'ชื่อผู้ใช้มีรูปแบบที่ไม่อนุญาต',
        errorEn: 'Username contains invalid pattern',
      };
    }
  }

  return { valid: true };
}

/**
 * Quick validation check (returns boolean only)
 */
export function isValidUsername(username: string): boolean {
  return validateUsername(username).valid;
}

/**
 * Normalizes username to lowercase for storage/comparison
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

/**
 * Get validation rules for display in UI
 */
export function getUsernameRules(language: 'th' | 'en' = 'th') {
  if (language === 'th') {
    return [
      'ความยาว 3-20 ตัวอักษร',
      'ขึ้นต้นด้วยตัวอักษร',
      'ประกอบด้วยตัวอักษร ตัวเลข _ และ - เท่านั้น',
      'ลงท้ายด้วยตัวอักษรหรือตัวเลข',
      'ไม่มีเครื่องหมายพิเศษติดกัน',
    ];
  }
  return [
    '3-20 characters long',
    'Start with a letter',
    'Only letters, numbers, underscore, and hyphen',
    'End with letter or number',
    'No consecutive special characters',
  ];
}
