import { describe, it, expect, vi } from 'vitest';

vi.mock('../db', () => ({ getPool: () => { throw new Error('no db in unit tests'); } }));
const { parseShareInput } = await import('../shares');

describe('parseShareInput', () => {
  it('computes the score server-side from known / total', () => {
    expect(parseShareInput({ totalUnique: 200, known: 145, title: 'Frieren ep 1' }))
      .toEqual({ totalUnique: 200, known: 145, title: 'Frieren ep 1', score: 73 });
  });

  it('rejects impossible or non-integer counts', () => {
    expect(parseShareInput({ totalUnique: 10, known: 11 })).toBeNull();
    expect(parseShareInput({ totalUnique: 0, known: 0 })).toBeNull();
    expect(parseShareInput({ totalUnique: 10.5, known: 1 })).toBeNull();
    expect(parseShareInput({ totalUnique: '10', known: 1 })).toBeNull();
    expect(parseShareInput(null)).toBeNull();
  });

  it('trims, collapses and caps the title, dropping empty ones', () => {
    expect(parseShareInput({ totalUnique: 1, known: 1, title: '  a \n b  ' })?.title).toBe('a b');
    expect(parseShareInput({ totalUnique: 1, known: 1, title: 'x'.repeat(300) })?.title).toHaveLength(100);
    expect(parseShareInput({ totalUnique: 1, known: 1, title: '   ' })?.title).toBeUndefined();
  });
});
