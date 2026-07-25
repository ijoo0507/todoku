import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Terms of Use · Todoku',
  description: 'The terms for using Todoku.',
};

const CONTACT_EMAIL = 'ijoob@umich.edu';
const LAST_UPDATED = 'July 18, 2026';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Todoku" width={36} height={36} className="rounded-xl" unoptimized />
            <span className="text-white font-medium">todoku</span>
          </Link>
          <Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">privacy →</Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Use</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-slate-300 leading-relaxed text-sm">

          <p>
            By using Todoku, you agree to these terms. Todoku is a free, personal-use tool. If you
            don&apos;t agree with these terms, please don&apos;t use the service.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">The service</h2>
            <p>
              Todoku analyzes Japanese text you provide and estimates how much of it you can
              understand based on JLPT vocabulary lists. It is provided free of charge for personal,
              educational use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Accuracy and JLPT lists</h2>
            <p>
              The JLPT does not publish an official vocabulary list. The word sets Todoku uses are
              community-sourced approximations and may differ from other resources. Scores reflect
              vocabulary recognition only, not grammar comprehension, and are estimates — not an
              official proficiency assessment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Your content</h2>
            <p className="mb-3">
              You keep all rights to the text you submit. You grant us only the limited, temporary
              right to process that text in order to compute your score. We don&apos;t store it (see
              the <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>).
            </p>
            <p>
              You are responsible for the content you upload. Only submit text you have the right to
              use, and comply with the copyright and terms of any source you obtain subtitles or
              lyrics from.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Acceptable use</h2>
            <p>
              Please don&apos;t abuse the service — no automated scraping, no attempts to overload or
              disrupt it, and no using it to break the law. We apply reasonable rate limits to keep
              Todoku available for everyone, and we may restrict access that harms the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">No warranty</h2>
            <p>
              Todoku is provided &quot;as is,&quot; without warranties of any kind. We don&apos;t
              guarantee it will be accurate, uninterrupted, or error-free, and it may change or shut
              down at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, Todoku and its creator are not liable for any
              indirect or consequential damages arising from your use of the service. Since Todoku is
              free, our total liability to you is limited accordingly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Changes</h2>
            <p>
              We may update these terms over time. Continued use after an update means you accept the
              revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:text-indigo-300">{CONTACT_EMAIL}</a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">← back to app</Link>
          <Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">privacy →</Link>
        </div>

      </div>
    </main>
  );
}
