import { describe, it, expect } from 'vitest';
import { tokenizeText } from '../tokenizer';

// Uses the real kuromoji dictionary, since readings come from it
describe('tokenizeText', () => {
  it('gives conjugated words the reading of their dictionary form', async () => {
    const tokens = await tokenizeText('今日は雨が降っています。私は家で本を読みます。');
    const byForm = Object.fromEntries(tokens.map(t => [t.basicForm, t]));

    expect(byForm['降る']).toMatchObject({ surface: '降っ', reading: 'ふる' });
    expect(byForm['読む']).toMatchObject({ surface: '読み', reading: 'よむ' });
    expect(byForm['雨'].reading).toBe('あめ');
  });

  it('handles conjugated adjectives', async () => {
    const tokens = await tokenizeText('昨日は寒かった。');
    expect(tokens.find(t => t.basicForm === '寒い')?.reading).toBe('さむい');
  });
}, 30_000);
