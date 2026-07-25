# Todoku launch kit

Site: https://todoku.space — free, no login required, no ads, no paywall.

One-liner: **Paste anime subtitles or J-pop lyrics and Todoku tells you what % of the vocab you already know — then exports the words you don't to Anki.**

---

## 0. Don't get your account banned (read this first)

Language + anime subs are strict about self-promotion. A few rules keep you safe:

- **Read each subreddit's rules before posting.** Most have a rule about self-promo in the sidebar.
- **Follow the 90/10 rule.** ~90% of your Reddit activity should be normal participation (answering questions, commenting), ~10% your own stuff. Comment for a few days before you post a launch.
- **Use the weekly/designated threads** where a sub requires it (r/LearnJapanese and r/languagelearning both funnel tools into weekly threads).
- **Disclose you're the dev.** "I made this" reads better than pretending to be a random fan.
- **Lead with the free-and-no-signup angle.** It kills the "is this a paid ad" reflex. This is your biggest advantage — say it in the first line.
- **Ask for feedback, not installs.** "Does the scoring match your gut feeling about your level?" gets comments; "check out my app" gets removed.
- **Add UTM tags** to the link per channel (see tracking section) so you know what actually works.

---

## 1. Where to post (ranked by fit)

| Community | Why it fits | How to post |
|---|---|---|
| **r/LearnJapanese** (~850k) | Core audience. Strict. | Use the weekly self-promo / "Shitsumonday"-style thread, OR a value-first standalone post framed as a tool you built + asking for feedback. Check current rules. |
| **r/Anki** | Todoku's export IS an Anki deck. Very on-topic. | Standalone post framed around the Anki workflow. Friendlier to tools. |
| **r/languagelearning** (~2M) | Broad, immersion-friendly. | Weekly "share your projects" thread. |
| **r/SideProject / r/InternetIsBeautiful** | Loves free, single-purpose web tools. | Standalone. IIB is picky about "beautiful/useful" — emphasize the instant, no-login demo. |
| **r/anime** | Huge, but self-promo is heavily restricted. | Only via casual comments where relevant, not a launch post. Low priority. |
| **Hacker News (Show HN)** | Devs + the "immersion learning" crowd. Good for a resume story too. | "Show HN: Todoku – comprehension scoring for anime subtitles". |
| **Product Hunt** | Extra backlink + signups; screenshots matter. | Optional, once landing page looks polished. |

**Discord servers** (paste the short message in #resources / #tools, after reading rules):
- TheMoeWay (Japanese immersion)
- Refold Japanese
- r/LearnJapanese's official Discord
- General "study with me" / JLPT servers

---

## 2. Reddit posts (copy-paste, tweak per sub)

### r/LearnJapanese (value-first)

**Title:** I built a free tool that scores how much of an anime episode you can actually understand (no signup)

> I've been learning by watching anime, but I never knew if a show was "at my level" until I was 3 episodes in and lost. So I built **Todoku** to answer that up front.
>
> You paste a subtitle file (.srt/.ass) or song lyrics, tell it your JLPT level (or take a 20-word placement test), and it gives you a comprehension score — the % of unique content words you likely know — plus the exact words you don't. You can mark words you already know to tune it, and export the unknown ones straight to an Anki deck.
>
> It's free, no login required, no ads. I'm not selling anything — I just want it to be useful.
>
> A couple of honest caveats: it scores *vocabulary* recognition, not grammar, and the JLPT word lists are community approximations (the JLPT has no official list). So treat the number as a "is this watchable for me yet" gauge, not a grade.
>
> Would love feedback: does the score match your gut feeling about your own level? Try it on a show you know well — https://todoku.space

### r/Anki (workflow angle)

**Title:** Made a free tool that turns anime subtitles into a targeted Anki deck (only the words you don't know)

> Mining sentences is great but slow. I wanted the reverse: feed it a whole episode's subtitles, and get back *only* the words above my level, ready to import.
>
> **Todoku** (free, no signup) tokenizes the subtitle file, filters to content words, removes everything at/below your JLPT level and anything you've marked known, and exports the rest as a tab-separated deck (kanji / reading + part of speech + JLPT level).
>
> Import in Anki: File → Import → pick the .txt, fields separated by Tab.
>
> https://todoku.space — curious whether the deck size/quality is useful for how you study.

### r/SideProject / r/InternetIsBeautiful

**Title:** Todoku – paste Japanese subtitles, instantly see what % you'd understand (free, no login)

> A single-purpose web tool for Japanese learners: drop in an anime subtitle file or song lyrics and it computes your comprehension score against JLPT vocab, then lets you export the unknown words to Anki. No account, no ads, works in the browser. Built with Next.js + a Japanese morphological analyzer (kuromoji). Feedback welcome — https://todoku.space

### Hacker News (Show HN)

**Title:** Show HN: Todoku – comprehension scoring for anime subtitles (free, no login)

> I learn Japanese mostly by watching anime and could never tell if a show was at my level before starting it. Todoku takes a subtitle file or lyrics, tokenizes with kuromoji, and scores the % of unique content words you'd know at your JLPT level, then exports the unknown ones to Anki. It's free and needs no signup. Stack: Next.js on Vercel, kuromoji for morphological analysis. Caveat: it measures vocabulary, not grammar, and JLPT word lists are unofficial approximations. Would love feedback on the scoring model. https://todoku.space

---

## 3. Discord message (short)

> Made a free tool for immersion learners: **Todoku** (https://todoku.space). Paste an anime subtitle file or song lyrics and it tells you what % of the vocab you already know for your JLPT level, then exports the unknown words to Anki. No login, no ads. Would love feedback on whether the score feels accurate for content you know.

---

## 4. How to track users

You don't have analytics yet. Add lightweight tracking so you know if the launch worked.

**Recommended combo (fast + privacy-clean, matches your Privacy Policy):**

1. **Vercel Web Analytics** — one click in the Vercel dashboard + `<Analytics/>` from `@vercel/analytics/next` in your layout. Gives pageviews, top pages, referrers, countries. No cookies. Free tier is enough to start.
2. **Plausible** (or self-hosted **Umami**) — privacy-friendly, no cookie banner needed, shows unique visitors, referrers, and lets you track custom events (e.g. an "analyze" click or an "export" click) so you see real usage, not just visits. ~$9/mo hosted, or free if you self-host Umami.

**You already have a signup counter for free:** you store users in Postgres. Run
`SELECT COUNT(*) FROM users;` (and `... WHERE created_at > now() - interval '7 days'`) to see account growth. That's your truest "real users" number since login is optional.

**Tag every launch link with UTM params** so you know which channel converts:
- Reddit LJ: `https://todoku.space/?utm_source=reddit&utm_medium=post&utm_campaign=learnjapanese`
- r/Anki: `...utm_campaign=anki`
- HN: `...utm_source=hn`
- Discord: `...utm_source=discord`

Then referrers/UTMs in Vercel or Plausible tell you Reddit vs HN vs Discord at a glance.

**If you want funnels later:** PostHog (free tier) tracks the full path — landing → analyze → export → signup — and session replays. Heavier to set up; only add it once you have traffic worth analyzing. Note: PostHog/GA set cookies, so you'd need to update the Privacy Policy and possibly add a consent notice.

**Suggested minimum for launch day:** Vercel Web Analytics + UTM tags + the Postgres count. Add Plausible/Umami custom events within the first week to measure activation (visitors who actually run an analysis).
