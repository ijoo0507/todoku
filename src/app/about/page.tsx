import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Todoku" width={36} height={36} className="rounded-xl" unoptimized />
            <span className="text-white font-medium">todoku</span>
          </Link>
          <Link href="/settings" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">settings →</Link>
        </div>

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">How Todoku works</h1>
          <p className="text-slate-400 leading-relaxed">
            Todoku (届く, "to reach") measures how much of a Japanese text you can actually understand,
            using real content like anime subtitles and song lyrics instead of textbook exercises.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Comprehension scoring</h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              When you upload a subtitle file or paste lyrics, Todoku tokenizes the text using
              kuromoji (a Japanese morphological analyzer) to extract content words: nouns, verbs,
              adjectives, and adverbs. Function words like particles (は, が, を) and auxiliaries are
              excluded since they don't carry meaning on their own.
            </p>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 font-mono text-sm text-indigo-300">
              score = known unique words ÷ total unique words × 100
            </div>
            <p className="text-slate-500 text-sm mt-3">
              Unique words are counted in dictionary form, so 食べた and 食べる count as one word.
              Frequency is tracked so you can prioritize the most common unknown words first.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">JLPT word lists</h2>
            <p className="text-slate-400 leading-relaxed mb-3">
              The JLPT (Japanese Language Proficiency Test) organizes vocabulary into five levels,
              N5 (beginner) through N1 (advanced). Todoku uses curated word sets for each level as
              the baseline for what you should know at your placement level.
            </p>
            <p className="text-slate-400 leading-relaxed mb-3">
              These lists are based on commonly referenced JLPT vocabulary resources. They are
              not official. The JLPT does not publish an official word list, so treat them as
              a reasonable approximation, not a definitive standard.
            </p>
            <p className="text-slate-400 leading-relaxed">
              The lists are cumulative: if you're placed at N3, Todoku assumes you know all N5, N4,
              and N3 words. You can also mark individual words as known to fine-tune your score.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Placement test</h2>
            <p className="text-slate-400 leading-relaxed">
              The placement test shows 20 words (5 per level from N5 to N2) and asks if you recognize
              each one. Readings are hidden by default. The goal is kanji recognition, not phonetic
              reading. Your level is inferred from how many words you know at each level. You can
              skip the test and set your level manually if you already know where you are.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Why I built this</h2>
            <p className="text-slate-400 leading-relaxed mb-3">
              I've been watching anime for 15+ years. Somewhere along the way I developed a genuine
              interest in learning Japanese and tried a lot of approaches: apps, textbooks,
              structured study plans. But no matter what I tried, I always ended up back where I
              started, watching anime and listening to J-pop.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Eventually I stopped fighting it. If that's how I naturally spend my time anyway,
              why not turn it into the study? Todoku is the tool I wished existed: something that
              meets you where you already are, and tells you exactly how much you understand and
              what to learn next.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Limitations</h2>
            <ul className="text-slate-400 space-y-2 text-sm leading-relaxed">
              <li>• Scoring is based on <em>vocabulary</em> recognition, not grammar comprehension. You could score 90% and still not understand a sentence due to unfamiliar grammar patterns.</li>
              <li>• The JLPT word lists are approximations and may differ from other resources.</li>
              <li>• Subtitle files vary in quality. Machine-generated or poorly formatted files may skew results.</li>
              <li>• Named entities (character names, place names) are counted as unknown words even if you'd recognize them in context.</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">← back to app</Link>
          <Link href="/settings" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">settings →</Link>
        </div>

      </div>
    </main>
  );
}
