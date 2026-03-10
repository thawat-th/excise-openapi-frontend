/**
 * Unit Tests for Username Validator (OWASP Compliant)
 *
 * Tests coverage:
 * - Valid usernames
 * - Invalid usernames (format, length, special characters)
 * - Reserved usernames
 * - SQL injection patterns
 * - Case sensitivity
 * - Normalization
 */

import { validateUsername, isValidUsername, normalizeUsername, getUsernameRules } from '../username';

describe('validateUsername', () => {
  describe('Valid Usernames', () => {
    test('should accept valid 3-character username', () => {
      const result = validateUsername('abc');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept valid 20-character username', () => {
      const result = validateUsername('abcdefghij1234567890');
      expect(result.valid).toBe(true);
    });

    test('should accept username with underscore', () => {
      const result = validateUsername('john_doe');
      expect(result.valid).toBe(true);
    });

    test('should accept username with hyphen', () => {
      const result = validateUsername('john-doe');
      expect(result.valid).toBe(true);
    });

    test('should accept username with numbers', () => {
      const result = validateUsername('user123');
      expect(result.valid).toBe(true);
    });

    test('should accept mixed alphanumeric with special chars', () => {
      const result = validateUsername('john_doe_123');
      expect(result.valid).toBe(true);
    });

    test('should accept username ending with number', () => {
      const result = validateUsername('user1');
      expect(result.valid).toBe(true);
    });
  });

  describe('Invalid Usernames - Format', () => {
    test('should reject username starting with number', () => {
      const result = validateUsername('123user');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ต้องขึ้นต้นด้วยตัวอักษร');
    });

    test('should reject username ending with underscore', () => {
      const result = validateUsername('user_');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ต้องลงท้ายด้วยตัวอักษรหรือตัวเลข');
    });

    test('should reject username ending with hyphen', () => {
      const result = validateUsername('user-');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ต้องลงท้ายด้วยตัวอักษรหรือตัวเลข');
    });

    test('should reject username with consecutive underscores', () => {
      const result = validateUsername('john__doe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ต้องไม่มีเครื่องหมาย _ หรือ - ติดกัน');
    });

    test('should reject username with consecutive hyphens', () => {
      const result = validateUsername('john--doe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ต้องไม่มีเครื่องหมาย _ หรือ - ติดกัน');
    });

    test('should reject username with spaces', () => {
      const result = validateUsername('john doe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ประกอบด้วยตัวอักษร ตัวเลข _ และ - เท่านั้น');
    });

    test('should reject username with dots', () => {
      const result = validateUsername('john.doe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ประกอบด้วยตัวอักษร ตัวเลข _ และ - เท่านั้น');
    });

    test('should reject username with special characters', () => {
      const result = validateUsername('john@doe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ประกอบด้วยตัวอักษร ตัวเลข _ และ - เท่านั้น');
    });
  });

  describe('Invalid Usernames - Length', () => {
    test('should reject empty username', () => {
      const result = validateUsername('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('กรุณากระบุชื่อผู้ใช้');
    });

    test('should reject username shorter than 3 characters', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('อย่างน้อย 3 ตัวอักษร');
    });

    test('should reject username longer than 20 characters', () => {
      const result = validateUsername('abcdefghij12345678901');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ไม่เกิน 20 ตัวอักษร');
    });
  });

  describe('Reserved Usernames', () => {
    test('should reject "admin"', () => {
      const result = validateUsername('admin');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ถูกสงวนไว้');
    });

    test('should reject "root"', () => {
      const result = validateUsername('root');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ถูกสงวนไว้');
    });

    test('should reject "system"', () => {
      const result = validateUsername('system');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ถูกสงวนไว้');
    });

    test('should reject reserved username case-insensitive', () => {
      const result = validateUsername('ADMIN');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ถูกสงวนไว้');
    });
  });

  describe('SQL Injection Prevention', () => {
    test('should reject username with SQL comment --', () => {
      const result = validateUsername('user--test');
      expect(result.valid).toBe(false);
    });

    test('should reject username with SQL keyword "select"', () => {
      const result = validateUsername('select');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('รูปแบบที่ไม่อนุญาต');
    });

    test('should reject username with SQL keyword "drop"', () => {
      const result = validateUsername('drop');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('รูปแบบที่ไม่อนุญาต');
    });

    test('should reject username with semicolon', () => {
      const result = validateUsername('user;test');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ประกอบด้วยตัวอักษร ตัวเลข _ และ - เท่านั้น');
    });
  });
});

describe('isValidUsername', () => {
  test('should return true for valid username', () => {
    expect(isValidUsername('john_doe')).toBe(true);
  });

  test('should return false for invalid username', () => {
    expect(isValidUsername('123user')).toBe(false);
  });

  test('should return false for reserved username', () => {
    expect(isValidUsername('admin')).toBe(false);
  });
});

describe('normalizeUsername', () => {
  test('should convert to lowercase', () => {
    expect(normalizeUsername('JohnDoe')).toBe('johndoe');
  });

  test('should trim whitespace', () => {
    expect(normalizeUsername('  john_doe  ')).toBe('john_doe');
  });

  test('should handle mixed case and whitespace', () => {
    expect(normalizeUsername('  JohnDoe123  ')).toBe('johndoe123');
  });
});

describe('getUsernameRules', () => {
  test('should return Thai rules', () => {
    const rules = getUsernameRules('th');
    expect(rules).toHaveLength(5);
    expect(rules[0]).toContain('3-20');
    expect(rules[1]).toContain('ขึ้นต้นด้วยตัวอักษร');
  });

  test('should return English rules', () => {
    const rules = getUsernameRules('en');
    expect(rules).toHaveLength(5);
    expect(rules[0]).toContain('3-20');
    expect(rules[1]).toContain('Start with a letter');
  });
});
