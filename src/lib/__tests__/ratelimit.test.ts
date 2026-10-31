import { describe, it, expect, vi, afterEach } from 'vitest';

// No Upstash in unit tests: exercises the in-memory fallback
vi.mock('../redis', () => ({ getRedis: () => null }));
vi.spyOn(console, 'error').mockImplementation(() => {});
const { checkLimit } = await import('../ratelimit');

describe('checkLimit without Upstash (in-memory fallback)', () => {
  afterEach(() => vi.useRealTimers());

  it('allows guests 3 analyses per minute, then blocks with a Retry-After', async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await checkLimit('analyzeGuest', 'analyze:ip:1.1.1.1'));
    expect(results.map(r => r.ok)).toEqual([true, true, true, false]);
    expect(results[3].retryAfter).toBeGreaterThan(0);
    expect(results[3].retryAfter).toBeLessThanOrEqual(60);
  });

  it('tracks keys independently', async () => {
    for (let i = 0; i < 3; i++) await checkLimit('analyzeGuest', 'analyze:ip:2.2.2.2');
    expect((await checkLimit('analyzeGuest', 'analyze:ip:3.3.3.3')).ok).toBe(true);
  });

  it('uses the higher limit for signed-in users', async () => {
    const results = [];
    for (let i = 0; i < 11; i++) results.push((await checkLimit('analyzeAuthed', 'analyze:user:u1')).ok);
    expect(results.filter(Boolean)).toHaveLength(10);
    expect(results[10]).toBe(false);
  });

  it('resets after the one-minute window', async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 4; i++) await checkLimit('analyzeGuest', 'analyze:ip:4.4.4.4');
    expect((await checkLimit('analyzeGuest', 'analyze:ip:4.4.4.4')).ok).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect((await checkLimit('analyzeGuest', 'analyze:ip:4.4.4.4')).ok).toBe(true);
  });
});
