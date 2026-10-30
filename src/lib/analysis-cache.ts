import { createHash } from 'crypto';
import { getRedis } from './redis';
import { tokenizeText } from './tokenizer';
import { buildFrequency, FrequencyMap } from './comprehension';
import { JLPTLevel } from '@/types';

const TTL_SECONDS = 60 * 60 * 24;
// Upstash rejects very large values; skip caching huge inputs instead of failing
const MAX_CACHE_BYTES = 500_000;

export function normalizeText(text: string): string {
  return text.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function cacheKey(text: string, userLevel: JLPTLevel): string {
  const hash = createHash('sha256').update(normalizeText(text) + userLevel).digest('hex');
  return `analysis:v1:${hash}`;
}

/**
 * Returns the token frequency map for `text`, from Redis when possible.
 * Only the frequency map is cached (no per-user known words), so the caller
 * scores it against the user's known set after the read.
 */
export async function getFrequency(
  text: string,
  userLevel: JLPTLevel
): Promise<{ freq: FrequencyMap; cached: boolean }> {
  const redis = getRedis();
  const key = cacheKey(text, userLevel);

  if (redis) {
    try {
      const hit = await redis.get<FrequencyMap>(key);
      if (hit) return { freq: hit, cached: true };
    } catch (err) {
      console.error('analysis-cache: read failed', err);
    }
  }

  const freq = buildFrequency(await tokenizeText(text));

  if (redis) {
    const payload = JSON.stringify(freq);
    if (payload.length <= MAX_CACHE_BYTES) {
      // Fire-and-forget: a failed write shouldn't slow the response
      redis.set(key, payload, { ex: TTL_SECONDS }).catch(err =>
        console.error('analysis-cache: write failed', err)
      );
    }
  }

  return { freq, cached: false };
}
