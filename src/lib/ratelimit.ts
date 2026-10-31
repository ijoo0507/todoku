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

let warnedMissing = false;

export async function checkLimit(
  kind: LimitKind,
  key: string
): Promise<{ ok: boolean; retryAfter: number }> {
  const limiters = getLimiters();
  if (!limiters) {
    if (!warnedMissing) {
      console.error('ratelimit: UPSTASH_REDIS_REST_URL/TOKEN not set, allowing all requests');
      warnedMissing = true;
    }
    return { ok: true, retryAfter: 0 };
  }
  try {
    const { success, reset } = await limiters[kind].limit(key);
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return { ok: success, retryAfter };
  } catch (err) {
    // Fail open: a Redis outage should not take the app down
    console.error('ratelimit: redis error, allowing request', err);
    return { ok: true, retryAfter: 0 };
  }
}
