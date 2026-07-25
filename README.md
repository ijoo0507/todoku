# Todoku （届く）

A full-stack Japanese comprehension tool for anime and J-pop learners. Paste song lyrics or upload subtitle files, get an instant comprehension score against your known vocabulary, and export the words you don't know as Anki flashcards.

**Live:** [todoku.space](https://todoku.space)

---

## What it does

Learning Japanese from native media is hard because you don't know which words you're missing. Todoku fixes that:

- **Comprehension scoring** — Upload `.srt` / `.ass` / `.vtt` subtitles or paste lyrics. Todoku tokenizes the text with a morphological analyzer and scores your comprehension against JLPT levels N5–N1 and your personal known-word set.
- **Placement test** — A quick 20-word test (N5–N2) estimates your level, with tap-to-reveal readings and manual level skips.
- **Personal vocab layer** — Mark words as known; your comprehension score updates to reflect what you actually know.
- **English meanings** — Unknown words are enriched with definitions on demand via the Jotoba dictionary API.
- **Anki export** — Generate flashcard decks from the words you don't know, exported as tab-separated files with readings, part of speech, and JLPT level.
- **JLPT vocab browser** — Study the full N5–N1 word sets in a dedicated study mode.
- **Accounts** — Sign in with Google (NextAuth) to sync your known-word set across devices.

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS |
| NLP | [kuromoji](https://github.com/takuyaa/kuromoji.js) — Japanese morphological analyzer |
| Dictionary | [Jotoba](https://jotoba.de) API — English meanings |
| Database | Neon Postgres (`@auth/pg-adapter`) |
| Auth | NextAuth (Google OAuth) |
| Hosting | Vercel (auto-deploy from `main`) |

## Architecture highlights

- **Morphological tokenization** — kuromoji runs as a singleton on the Node.js serverless runtime, filtering tokens down to content parts of speech before scoring against JLPT word sets.
- **Comprehension engine** — Scores text by diffing tokenized content words against JLPT levels and the user's known-word set.
- **Security** — Per-IP rate limiting on analysis routes, strict Content-Security-Policy and framing headers, plus file-size and character-count limits on all input.
- **Anki export** — Diffs tokenized text against the user's known words and emits a clean TSV deck (surface form, reading, POS, JLPT level).

## Screenshots

<img width="786" height="542" alt="image" src="https://github.com/user-attachments/assets/aa740e67-d663-4e5e-a4ac-4756198fbc83" />
<img width="830" height="565" alt="image" src="https://github.com/user-attachments/assets/511ee1f0-0045-4f12-8293-271fcb2d83a8" />


## Running locally

```bash
git clone https://github.com/ijoo0507/todoku.git
cd todoku
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For auth and vocab sync, add a `.env.local` with:

```
DATABASE_URL=            # Neon Postgres connection string
AUTH_SECRET=             # openssl rand -base64 32
AUTH_GOOGLE_ID=          # Google OAuth client ID
AUTH_GOOGLE_SECRET=      # Google OAuth client secret
```

## Roadmap

- Expanded dictionary coverage and example sentences
- Community launch (r/LearnJapanese, r/anime)
