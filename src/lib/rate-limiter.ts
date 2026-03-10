/**
 * Rate Limiter
 *
 * Banking/Government Security:
 * - ป้องกัน brute force attacks
 * - ป้องกัน DoS attacks
 * - Comply with OWASP recommendations
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (Production: ใช้ Redis)
const rateLimits = new Map<string, RateLimitEntry>();

/**
 * Rate Limiter Configuration
 */
export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Default rate limit configs
 */
export const RATE_LIMITS = {
  // Login attempts: 5 ครั้งต่อ 15 นาที (Banking standard)
  LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 },

  // API calls: 100 ครั้งต่อ 1 นาที
  API: { windowMs: 60 * 1000, maxRequests: 100 },

  // OTP requests: 3 ครั้งต่อ 5 นาที (Government standard)
  OTP: { windowMs: 5 * 60 * 1000, maxRequests: 3 },

  // Password reset: 3 ครั้งต่อ 1 ชั่วโมง
  PASSWORD_RESET: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
} as const;

/**
 * Check rate limit
 *
 * @param key - Unique identifier (e.g., IP address, user ID, email)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimits.get(key);

  // ถ้าไม่มี entry หรือหมดเวลาแล้ว → reset
  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    rateLimits.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  // ถ้าเกิน limit
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  // เพิ่ม count
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit สำหรับ key นั้นๆ
 * Use case: หลังจาก login สำเร็จ
 */
export function resetRateLimit(key: string): void {
  rateLimits.delete(key);
}

/**
 * Clean up expired entries
 * ควร run ทุก 5 นาที
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  let count = 0;

  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetAt) {
      rateLimits.delete(key);
      count++;
    }
  }

  if (count > 0) {
    console.log('[rate-limiter] Cleaned up expired entries:', count);
  }
}

// Auto cleanup ทุก 5 นาที
setInterval(cleanupRateLimits, 5 * 60 * 1000);

/**
 * Get rate limit headers (RFC 6585)
 * Banking/Government: ต้องบอก client ว่าเหลือ quota เท่าไร
 */
export function getRateLimitHeaders(result: {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': '100', // ควรมาจาก config
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetAt / 1000).toString(),
    ...(result.allowed ? {} : { 'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString() }),
  };
}
