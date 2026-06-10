# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build (also runs type checking)
npm run lint     # ESLint
```

No test suite yet.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v3** (important: NOT v4 — v4 requires lightningcss which breaks on Vercel)
- **kuromoji** — Japanese morphological analyzer (Node.js only, no Edge runtime)
- All API routes must have `export const runtime = 'nodejs'` at the top

## Architecture

### Data Flow

1. `src/lib/jlpt-data.ts` — static JLPT word sets (N5–N1) as `Set<string>`, placement test words, `getKnownWords(level)` (cumulative by level), `inferLevel(answers)`
2. `src/lib/tokenizer.ts` — kuromoji singleton (`getTokenizer()`), `tokenizeText()` filters to content POS (名詞,動詞,形容詞,副詞,形容動詞), returns `basicForm` (dictionary form) for lookup
3. `src/lib/comprehension.ts` — `analyzeText(text, userLevel, extraKnown?)` merges JLPT level words + personal known words, scores `knownUnique / totalUnique × 100`
4. `src/lib/srt-parser.ts` — strips SRT/ASS/VTT to plain text
5. `src/lib/anki.ts` — generates TSV for Anki import (front: kanji, back: reading + POS + JLPT)

### API Routes

| Route | Purpose |
|---|---|
| `POST /api/analyze` | Tokenizes text, returns `AnalysisResult`. Accepts FormData with `mode`, `file`/`text`, `userLevel`, `extraKnownWords` (JSON array) |
| `POST /api/export` | Accepts `{words: VocabWord[]}`, returns TSV file |
| `GET/POST /api/placement` | GET returns 20 test words; POST `{answers}` returns `{level}` |
| `GET /api/vocab` | Returns all JLPT words with readings, deduplicated by lowest level using a `seen` Map |

### Client State

- `useVocab` hook (`src/hooks/useVocab.ts`) — persists known words to `localStorage` key `todoku-known-words`
- Level persisted to `localStorage` key `todoku-level`
- Main page (`src/app/page.tsx`) cycles through screens: `placement → input → results`

### Key Invariants

- kuromoji uses **`t.pos`** and **`t.pos_detail_1`** (not `t.part_of_speech`) — IpadicFeatures naming
- All JLPT lookups use `basicForm` (dictionary form from kuromoji), not surface form
- `/api/vocab` deduplicates words by iterating N5→N1 and keeping lowest level in a `seen` Map — same logic needed wherever JLPT sets are iterated
- `getKnownWords(level)` is **cumulative** (N3 includes N5+N4+N3 words)
- Tailwind config: `postcss.config.mjs` uses `tailwindcss` + `autoprefixer` (not `@tailwindcss/postcss`); `globals.css` uses `@tailwind base/components/utilities` directives; `tailwind.config.ts` scans `./src/**/*.{ts,tsx}`
- `.npmrc` has `omit=optional` to prevent platform-specific binaries from breaking Vercel builds

### Deployed

- Vercel (auto-deploys from GitHub main)
- Domain: todoku.space (Namecheap DNS → Vercel)
