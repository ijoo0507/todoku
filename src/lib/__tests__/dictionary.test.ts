import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/data/meanings.json', () => ({ default: { '猫': 'cat', '犬': 'dog' } }));

const { POST } = await import('@/app/api/dictionary/route');

const request = (body: unknown) =>
  new NextRequest('http://localhost/api/dictionary', {
    method: 'POST',
    body: JSON.stringify(body),
  });

// A fetch that never resolves and ignores abort, the worst case for Jotoba
const hangingFetch = () => new Promise<Response>(() => {});

const jotobaFetch = (gloss: string) =>
  vi.fn(async () =>
    new Response(JSON.stringify({ words: [{ reading: { kanji: '鳥' }, senses: [{ glosses: [gloss] }] }] }))
  );

describe('POST /api/dictionary', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns local meanings within ~2s when Jotoba hangs', async () => {
    vi.stubGlobal('fetch', vi.fn(hangingFetch));
    const start = Date.now();
    const res = await POST(request({ words: ['猫', '鳥', '犬'] }));
    const elapsed = Date.now() - start;
    expect(await res.json()).toEqual({ '猫': 'cat', '犬': 'dog' });
    expect(elapsed).toBeLessThan(2500);
  }, 5000);

  it('only asks Jotoba for words missing locally, deduped', async () => {
    const fetchMock = jotobaFetch('bird');
    vi.stubGlobal('fetch', fetchMock);
    const res = await POST(request({ words: ['猫', '鳥', '鳥'] }));
    expect(await res.json()).toEqual({ '猫': 'cat', '鳥': 'bird' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('drops non-strings and over-long words', async () => {
    const fetchMock = jotobaFetch('x');
    vi.stubGlobal('fetch', fetchMock);
    const res = await POST(request({ words: [42, null, 'あ'.repeat(21), '猫'] }));
    expect(await res.json()).toEqual({ '猫': 'cat' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns an empty object for a bad body', async () => {
    expect(await (await POST(request({ words: 'nope' }))).json()).toEqual({});
  });
});
