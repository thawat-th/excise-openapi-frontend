/**
 * IP Address Utilities
 *
 * Zero-Trust Security:
 * - Get real client IP (behind proxies/load balancers)
 * - IP validation
 * - Geo-blocking capabilities
 */

import { NextRequest } from 'next/server';

/**
 * Get real client IP address
 *
 * Zero-Trust: ต้องเชื่อ headers จาก trusted proxies เท่านั้น
 * Government: ต้องเก็บ IP ใน audit logs
 *
 * Priority:
 * 1. X-Real-IP (from Nginx/CloudFlare)
 * 2. X-Forwarded-For (first IP in chain)
 * 3. req.ip (fallback)
 */
export function getClientIP(request: NextRequest): string {
  // X-Real-IP (most trusted)
  const realIP = request.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP)) {
    return realIP;
  }

  // X-Forwarded-For (chain of IPs)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    const clientIP = ips[0]; // First IP = original client
    if (isValidIP(clientIP)) {
      return clientIP;
    }
  }

  // Fallback
  return request.ip || 'unknown';
}

/**
 * Validate IPv4/IPv6 address
 */
export function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6 (simplified check)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  return ipv6Regex.test(ip);
}

/**
 * Check if IP is in private range
 * Banking: บาง features อาจต้องการให้ใช้ได้เฉพาะ internal network
 */
export function isPrivateIP(ip: string): boolean {
  const privateCIDRs = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^::1$/,                    // ::1 (IPv6 localhost)
    /^fc00:/,                   // fc00::/7 (IPv6 private)
  ];

  return privateCIDRs.some(regex => regex.test(ip));
}

/**
 * Create rate limit key from IP
 * Zero-Trust: แยก rate limit ตาม IP
 */
export function getRateLimitKey(prefix: string, ip: string): string {
  return `${prefix}:${ip}`;
}

/**
 * Hash IP for privacy (GDPR compliance)
 * Government: ควร hash IP ก่อนเก็บใน logs (24h retention)
 */
export function hashIP(ip: string, salt: string = 'excise-salt'): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
    .substring(0, 16); // Short hash for logs
}
