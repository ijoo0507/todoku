import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Privacy Policy · Todoku',
  description: 'How Todoku handles your data.',
};

const CONTACT_EMAIL = 'ijoob@umich.edu';
const LAST_UPDATED = 'July 18, 2026';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Todoku" width={36} height={36} className="rounded-xl" unoptimized />
            <span className="text-white font-medium">todoku</span>
          </Link>
          <Link href="/terms" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">terms →</Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-slate-300 leading-relaxed text-sm">

          <p>
            Todoku is a free tool that measures how much of a Japanese text you can understand.
            This policy explains what data we handle and why. The short version: we collect as
            little as possible, we don&apos;t sell your data, and there are no ads.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">What we collect</h2>
            <p className="mb-3">
              <strong className="text-white">If you sign in with Google</strong> (optional), we
              receive and store your name, email address, and profile picture. We use this only to
              recognize your account. Signing in is not required to use Todoku.
            </p>
            <p className="mb-3">
              <strong className="text-white">On your device.</strong> Your JLPT level and your list
              of &quot;known&quot; words are stored in your browser&apos;s localStorage. They stay on
              your device and are not part of any account unless you choose to export them.
            </p>
            <p>
              <strong className="text-white">Text you analyze.</strong> Subtitle files and lyrics you
              submit are processed in memory to compute your comprehension score and are then
              discarded. We do not store, log, or share the content you analyze.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Cookies</h2>
            <p>
              If you sign in, we set a session cookie so you stay logged in. We do not use
              advertising or third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Service providers</h2>
            <p className="mb-3">We rely on a small number of providers to run Todoku:</p>
            <ul className="space-y-1 text-slate-400">
              <li>• <strong className="text-slate-300">Google</strong> — sign-in (OAuth).</li>
              <li>• <strong className="text-slate-300">Vercel</strong> — hosting and serving the app.</li>
              <li>• <strong className="text-slate-300">Neon</strong> — the database that stores accounts.</li>
            </ul>
            <p className="mt-3">
              These providers process data only to provide their service to us. We do not sell or
              rent your personal data to anyone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Keeping and deleting your data</h2>
            <p className="mb-3">
              We keep your account data for as long as your account exists. You can sign out at any
              time from Settings. To delete your account and associated data, email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:text-indigo-300">{CONTACT_EMAIL}</a>{' '}
              and we&apos;ll remove it.
            </p>
            <p>
              To clear the data stored on your device, use &quot;Clear vocab database&quot; in
              Settings, or clear your browser storage for this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Children</h2>
            <p>
              Todoku is not directed to children under 13, and we do not knowingly collect personal
              information from them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Changes</h2>
            <p>
              We may update this policy from time to time. Material changes will be reflected by the
              &quot;last updated&quot; date above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions about privacy? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:text-indigo-300">{CONTACT_EMAIL}</a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">← back to app</Link>
          <Link href="/terms" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">terms →</Link>
        </div>

      </div>
    </main>
  );
}
