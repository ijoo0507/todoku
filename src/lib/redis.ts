import { Redis } from '@upstash/redis';

// Shared Upstash client for rate limiting and the analysis cache.
// Returns null when env is missing (e.g. local dev) so callers can fail open.
let _redis: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  _redis = url && token ? new Redis({ url, token }) : null;
  return _redis;
}
