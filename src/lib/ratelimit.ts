import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './redis';

// Durable sliding-window limits shared across serverless instances.
const LIMITS = {
  analyzeAuthed: 10, // logged-in users: 10 req/min
  analyzeGuest: 3,   // guests: 3 req/min by IP (stricter)
  export: 10,        // export: 10 req/min by IP
  share: 10,         // share link creation: 10 req/min by IP
} as const;

export type LimitKind = keyof typeof LIMITS;

let _limiters: Record<LimitKind, Ratelimit> | null = null;

function getLimiters(): Record<LimitKind, Ratelimit> | null {
  if (_limiters) return _limiters;
  const redis = getRedis();
  if (!redis) return null;
  const make = (max: number) =>
    new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, '1 m'),
      prefix: 'rl',
      // If Redis is slow, allow the request instead of stalling it
      timeout: 1000,
    });
  _limiters = {
    analyzeAuthed: make(LIMITS.analyzeAuthed),
    analyzeGuest: make(LIMITS.analyzeGuest),
    export: make(LIMITS.export),
    share: make(LIMITS.share),
  };
  return _limiters;
}

// Per-instance fallback used when Upstash isn't configured or is unreachable.
// Not shared across serverless instances, but far better than no limit.
const WINDOW_MS = 60_000;
const MAX_MEMORY_KEYS = 10_000;
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function checkMemory(kind: LimitKind, key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (memoryStore.size > MAX_MEMORY_KEYS) {
    for (const [k, v] of memoryStore) if (now > v.resetAt) memoryStore.delete(k);
  }
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  entry.count++;
  const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return { ok: entry.count <= LIMITS[kind], retryAfter };
}

let warnedMissing = false;

export async function checkLimit(
  kind: LimitKind,
  key: string
): Promise<{ ok: boolean; retryAfter: number }> {
  const limiters = getLimiters();
  if (!limiters) {
    if (!warnedMissing) {
      console.error('ratelimit: UPSTASH_REDIS_REST_URL/TOKEN not set, using in-memory limits');
      warnedMissing = true;
    }
    return checkMemory(kind, key);
  }
  try {
    const { success, reset } = await limiters[kind].limit(key);
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return { ok: success, retryAfter };
  } catch (err) {
    // A Redis outage should not take the app down; degrade to per-instance limits
    console.error('ratelimit: redis error, using in-memory limits', err);
    return checkMemory(kind, key);
  }
}
