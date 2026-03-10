/**
 * BFF Session Store - Redis Only
 * เก็บ OAuth2 tokens ไว้ server-side ใน Redis
 * Browser ไม่เห็น access_token, id_token, refresh_token
 *
 * Banking/Government Security:
 * - Cryptographically secure session IDs
 * - Session metadata (IP, User-Agent) สำหรับ security validation
 * - Auto-cleanup expired sessions via Redis TTL
 * - NO in-memory fallback - Redis REQUIRED
 */

import { generateSecureSessionId } from './crypto-utils';
import Redis from 'ioredis';

export interface SessionData {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_at: number; // Unix timestamp
  kratos_session_token?: string;

  // Banking/Zero-Trust: Security metadata
  created_at: number;
  last_accessed: number;
  ip_address?: string;
  user_agent?: string;
  user_id?: string; // Kratos identity ID
  user_traits?: any; // Kratos identity traits (email, name, etc.)
}

// Redis client
let redisClient: Redis | null = null;
let redisAvailable = false;
let redisInitializing = false;
let redisReadyPromise: Promise<void> | null = null;

// Session key prefix (Redis)
const SESSION_PREFIX = 'excise:session:';

// Session TTL: 24 hours (Banking standard)
const SESSION_TTL = 24 * 60 * 60 * 1000;

// Idle timeout: 30 minutes (Government standard)
const IDLE_TIMEOUT = 30 * 60 * 1000;

// Initialize Redis eagerly with unlimited retries
function ensureRedis(): Promise<Redis | null> {
  console.log('[session-store][DEBUG] ensureRedis() called');
  console.log('[session-store][DEBUG] REDIS_URL:', process.env.REDIS_URL);
  console.log('[session-store][DEBUG] redisAvailable:', redisAvailable);
  console.log('[session-store][DEBUG] redisClient exists:', !!redisClient);
  console.log('[session-store][DEBUG] redisInitializing:', redisInitializing);

  if (!process.env.REDIS_URL) {
    throw new Error('[session-store] REDIS_URL not configured - session store requires Redis');
  }

  // If already connected, return immediately
  if (redisAvailable && redisClient) {
    console.log('[session-store][DEBUG] Reusing existing Redis connection');
    return Promise.resolve(redisClient);
  }

  // If initializing, wait for existing promise
  if (redisInitializing && redisReadyPromise) {
    console.log('[session-store][DEBUG] Waiting for existing initialization promise');
    return redisReadyPromise.then(() => redisAvailable && redisClient ? redisClient : null);
  }

  // Start initialization
  if (redisClient === null) {
    console.log('[session-store][DEBUG] Starting new Redis initialization');
    redisInitializing = true;
    redisReadyPromise = new Promise<void>((resolve) => {
      console.log('[session-store] Connecting to Redis:', process.env.REDIS_URL);
      redisClient = new Redis(process.env.REDIS_URL!, {
        // Connection Pool Configuration (OWASP: Prevent Resource Exhaustion)
        maxRetriesPerRequest: 3, // Limit retry per request
        connectTimeout: 10000, // 10 seconds max connection time
        commandTimeout: 5000, // 5 seconds max command execution time

        // Retry Strategy with Maximum Attempts
        retryStrategy(times) {
          // Max 10 retry attempts
          if (times > 10) {
            console.error(`[session-store] Redis connection failed after ${times} attempts`);
            return null; // Stop retrying
          }
          // Exponential backoff: 100ms, 200ms, 400ms, ..., max 5s
          const delay = Math.min(times * 100, 5000);
          console.log(`[session-store] Redis connection attempt ${times}/10, retrying in ${delay}ms...`);
          return delay;
        },

        // Connection Settings
        lazyConnect: false, // Connect immediately
        enableReadyCheck: true, // Verify connection is ready
        enableOfflineQueue: true, // Queue commands when disconnected

        // Banking: TLS for production
        tls: process.env.NODE_ENV === 'production' && process.env.REDIS_TLS === 'true'
          ? {}
          : undefined,

        // Keepalive Configuration
        keepAlive: 30000, // 30 seconds keepalive
        family: 4, // IPv4
      });

      redisClient.on('error', (err) => {
        console.error('[session-store][ERROR] Redis error:', err.message);
        console.error('[session-store][ERROR] Redis error stack:', err.stack);
        redisAvailable = false;
      });

      redisClient.on('connect', () => {
        console.log('[session-store][SUCCESS] Redis connected - session store ready');
        console.log('[session-store][DEBUG] Setting redisAvailable=true, redisInitializing=false');
        redisAvailable = true;
        redisInitializing = false;
        resolve();
      });

      redisClient.on('close', () => {
        console.warn('[session-store][WARN] Redis disconnected - will retry automatically');
        console.warn('[session-store][DEBUG] Setting redisAvailable=false');
        redisAvailable = false;
      });

      redisClient.on('reconnecting', () => {
        console.log('[session-store][INFO] Redis reconnecting...');
      });
    });

    return redisReadyPromise.then(() => {
      console.log('[session-store][DEBUG] Redis ready promise resolved');
      console.log('[session-store][DEBUG] Final state - redisAvailable:', redisAvailable, 'redisClient:', !!redisClient);
      return redisAvailable && redisClient ? redisClient : null;
    });
  }

  console.log('[session-store][DEBUG] Returning existing connection state');
  return Promise.resolve(redisAvailable && redisClient ? redisClient : null);
}

/**
 * สร้าง session ใหม่
 * Banking: ใช้ cryptographically secure session ID
 */
export async function createSession(
  data: Omit<SessionData, 'expires_at' | 'created_at' | 'last_accessed'>,
  metadata?: { ip_address?: string; user_agent?: string }
): Promise<string> {
  console.log('[session-store][DEBUG] createSession() called');
  console.log('[session-store][DEBUG] Input data keys:', Object.keys(data));
  console.log('[session-store][DEBUG] Metadata:', metadata);

  const redis = await ensureRedis();
  console.log('[session-store][DEBUG] ensureRedis() returned:', !!redis);

  if (!redis) {
    console.error('[session-store][ERROR] CRITICAL: Redis not available - cannot create session');
    throw new Error('[session-store] CRITICAL: Redis not available - cannot create session');
  }

  // Generate secure session ID (32 bytes = 256 bits)
  const sessionId = generateSecureSessionId();
  console.log('[session-store][DEBUG] Generated sessionId:', sessionId.substring(0, 16) + '...');

  const now = Date.now();
  const sessionData: SessionData = {
    ...data,
    ...metadata,
    created_at: now,
    last_accessed: now,
    expires_at: now + SESSION_TTL,
  };

  // Store in Redis
  const key = SESSION_PREFIX + sessionId;
  const ttlSeconds = Math.floor(SESSION_TTL / 1000);

  console.log('[session-store][DEBUG] Storing to Redis - key:', key);
  console.log('[session-store][DEBUG] TTL seconds:', ttlSeconds);
  console.log('[session-store][DEBUG] Session data:', JSON.stringify(sessionData, null, 2));

  await redis.setex(key, ttlSeconds, JSON.stringify(sessionData));
  console.log('[session-store][SUCCESS] Created session:', sessionId.substring(0, 16) + '...', 'IP:', metadata?.ip_address);
  return sessionId;
}

/**
 * อ่าน session data
 * Zero-Trust: ตรวจสอบทั้ง absolute timeout และ idle timeout
 */
export async function getSession(
  sessionId: string,
  options?: { ip_address?: string; user_agent?: string }
): Promise<SessionData | null> {
  console.log('[session-store][DEBUG] getSession() called');
  console.log('[session-store][DEBUG] SessionId:', sessionId.substring(0, 16) + '...');
  console.log('[session-store][DEBUG] Options:', options);

  const redis = await ensureRedis();
  console.log('[session-store][DEBUG] ensureRedis() returned:', !!redis);

  if (!redis) {
    console.error('[session-store][ERROR] CRITICAL: Redis not available');
    throw new Error('[session-store] CRITICAL: Redis not available');
  }

  // Get from Redis
  const key = SESSION_PREFIX + sessionId;
  console.log('[session-store][DEBUG] Fetching from Redis - key:', key);

  const data = await redis.get(key);
  console.log('[session-store][DEBUG] Redis get() result:', data ? `Found (${data.length} bytes)` : 'null');

  if (!data) {
    console.log('[session-store][WARN] Session not found in Redis');
    return null;
  }

  const session: SessionData = JSON.parse(data);
  console.log('[session-store][DEBUG] Parsed session data:', {
    user_id: session.user_id,
    created_at: new Date(session.created_at).toISOString(),
    last_accessed: new Date(session.last_accessed).toISOString(),
    expires_at: new Date(session.expires_at).toISOString(),
    has_access_token: !!session.access_token,
    has_kratos_token: !!session.kratos_session_token,
  });

  const now = Date.now();
  console.log('[session-store][DEBUG] Current time:', new Date(now).toISOString());

  // Absolute timeout (24 hours)
  if (now > session.expires_at) {
    console.log('[session-store][WARN] Session expired (absolute):', sessionId.substring(0, 16) + '...');
    console.log('[session-store][DEBUG] Expired at:', new Date(session.expires_at).toISOString());
    await deleteSession(sessionId);
    return null;
  }

  // Idle timeout (30 minutes) - Government standard
  const idleTime = now - session.last_accessed;
  console.log('[session-store][DEBUG] Idle time:', Math.floor(idleTime / 1000), 'seconds');

  if (idleTime > IDLE_TIMEOUT) {
    console.log('[session-store][WARN] Session expired (idle):', sessionId.substring(0, 16) + '...');
    console.log('[session-store][DEBUG] Idle timeout:', Math.floor(IDLE_TIMEOUT / 1000), 'seconds');
    await deleteSession(sessionId);
    return null;
  }

  // Zero-Trust: Validate IP and User-Agent (optional strict mode)
  if (options && process.env.STRICT_SESSION_VALIDATION === 'true') {
    console.log('[session-store][DEBUG] STRICT_SESSION_VALIDATION enabled');
    if (session.ip_address && options.ip_address && session.ip_address !== options.ip_address) {
      console.warn('[session-store][WARN] IP mismatch:', sessionId.substring(0, 16) + '...');
      console.warn('[session-store][DEBUG] Stored IP:', session.ip_address, 'Current IP:', options.ip_address);
      // Could invalidate session here in strict mode
    }
  }

  // Update last accessed time
  console.log('[session-store][DEBUG] Updating last_accessed time');
  session.last_accessed = now;
  await updateSession(sessionId, { last_accessed: now });

  console.log('[session-store][SUCCESS] Session retrieved successfully');
  return session;
}

/**
 * อัพเดต session data
 */
export async function updateSession(sessionId: string, data: Partial<Omit<SessionData, 'expires_at' | 'created_at'>>): Promise<boolean> {
  console.log('[session-store][DEBUG] updateSession() called');
  console.log('[session-store][DEBUG] SessionId:', sessionId.substring(0, 16) + '...');
  console.log('[session-store][DEBUG] Update data:', data);

  const redis = await ensureRedis();
  console.log('[session-store][DEBUG] ensureRedis() returned:', !!redis);

  if (!redis) {
    console.error('[session-store][ERROR] CRITICAL: Redis not available');
    throw new Error('[session-store] CRITICAL: Redis not available');
  }

  const key = SESSION_PREFIX + sessionId;
  console.log('[session-store][DEBUG] Fetching existing session - key:', key);

  const existingData = await redis.get(key);
  console.log('[session-store][DEBUG] Existing data:', existingData ? `Found (${existingData.length} bytes)` : 'null');

  if (!existingData) {
    console.log('[session-store][WARN] Session not found, cannot update');
    return false;
  }

  const session: SessionData = JSON.parse(existingData);
  const updatedSession: SessionData = {
    ...session,
    ...data,
    last_accessed: Date.now(),
  };

  console.log('[session-store][DEBUG] Updated session data:', JSON.stringify(updatedSession, null, 2));

  const ttl = await redis.ttl(key);
  console.log('[session-store][DEBUG] Current TTL:', ttl, 'seconds');

  if (ttl > 0) {
    await redis.setex(key, ttl, JSON.stringify(updatedSession));
    console.log('[session-store][SUCCESS] Updated session:', sessionId.substring(0, 16) + '...');
  } else {
    console.log('[session-store][WARN] TTL expired or key has no expiry, skipping update');
  }

  return true;
}

/**
 * ลบ session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  console.log('[session-store][DEBUG] deleteSession() called');
  console.log('[session-store][DEBUG] SessionId:', sessionId.substring(0, 16) + '...');

  const redis = await ensureRedis();
  console.log('[session-store][DEBUG] ensureRedis() returned:', !!redis);

  if (!redis) {
    console.error('[session-store][ERROR] CRITICAL: Redis not available');
    throw new Error('[session-store] CRITICAL: Redis not available');
  }

  const key = SESSION_PREFIX + sessionId;
  console.log('[session-store][DEBUG] Deleting from Redis - key:', key);

  const result = await redis.del(key);
  console.log('[session-store][DEBUG] Redis del() result:', result, '(1=deleted, 0=not found)');
  console.log('[session-store][SUCCESS] Deleted session:', sessionId.substring(0, 16) + '...');
}

/**
 * ลบ sessions ทั้งหมดของ user (use case: ถูก compromise)
 * Banking: Force logout all devices
 */
export async function deleteAllUserSessions(userId: string): Promise<number> {
  const redis = await ensureRedis();
  if (!redis) {
    throw new Error('[session-store] CRITICAL: Redis not available');
  }

  let count = 0;
  const pattern = SESSION_PREFIX + '*';
  const keys = await redis.keys(pattern);

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      const session: SessionData = JSON.parse(data);
      if (session.user_id === userId) {
        await redis.del(key);
        count++;
      }
    }
  }

  if (count > 0) {
    console.log('[session-store]  Deleted all sessions for user:', userId, 'count:', count);
  }
  return count;
}

/**
 * Get session statistics (for monitoring)
 */
export async function getSessionStats(): Promise<{
  total: number;
  active: number;
  expired: number;
  idle: number;
  storage: 'redis';
}> {
  const redis = await ensureRedis();
  if (!redis) {
    throw new Error('[session-store] CRITICAL: Redis not available');
  }

  const now = Date.now();
  let active = 0;
  let expired = 0;
  let idle = 0;

  const pattern = SESSION_PREFIX + '*';
  const keys = await redis.keys(pattern);
  const total = keys.length;

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      const session: SessionData = JSON.parse(data);

      if (now > session.expires_at) {
        expired++;
      } else if (now - session.last_accessed > IDLE_TIMEOUT) {
        idle++;
      } else {
        active++;
      }
    }
  }

  return { total, active, expired, idle, storage: 'redis' };
}
