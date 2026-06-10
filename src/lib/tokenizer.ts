import kuromoji from 'kuromoji';
import path from 'path';

export interface Token {
  surface: string;
  reading: string;
  basicForm: string;
  pos: string;
  posDetail: string;
}

// Singleton tokenizer (expensive to initialize)
let _tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

export async function getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (_tokenizer) return _tokenizer;

  const dicPath = path.join(process.cwd(), 'node_modules/kuromoji/dict');

  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, tokenizer) => {
      if (err) reject(err);
      else {
        _tokenizer = tokenizer;
        resolve(tokenizer);
      }
    });
  });
}

// Parts of speech to include as content words
const CONTENT_POS = new Set(['名詞', '動詞', '形容詞', '副詞', '形容動詞']);

// POS tags that are noise (particles, auxiliaries, punctuation)
const SKIP_POS = new Set(['助詞', '助動詞', '記号', '接続詞', '感動詞', 'フィラー']);

export async function tokenizeText(text: string): Promise<Token[]> {
  const tokenizer = await getTokenizer();
  const raw = tokenizer.tokenize(text);

  return raw
    .filter(t => {
      return CONTENT_POS.has(t.pos) && !SKIP_POS.has(t.pos);
    })
    .filter(t => {
      if (/^[ぁ-ゖ]$/.test(t.surface_form)) return false;
      if (/^\d+$/.test(t.surface_form)) return false;
      return true;
    })
    .map(t => ({
      surface: t.surface_form,
      reading: katakanaToHiragana(t.reading || t.surface_form),
      basicForm: t.basic_form || t.surface_form,
      pos: t.pos,
      posDetail: t.pos_detail_1 || '',
    }));
}

// Convert katakana reading to hiragana for display
function katakanaToHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}
