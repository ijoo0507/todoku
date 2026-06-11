'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useVocab } from '@/hooks/useVocab';
import { useUsage } from '@/hooks/useUsage';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { knownSet } = useVocab();
  const { usage } = useUsage();
  const [cleared, setCleared] = useState(false);
  const [levelReset, setLevelReset] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleClearVocab = () => {
    if (!confirm('Clear all marked words? This cannot be undone.')) return;
    localStorage.removeItem('todoku-known-words');
    setCleared(true);
  };

  const handleResetLevel = () => {
    localStorage.removeItem('todoku-level');
    setLevelReset(true);
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setPortalLoading(false);
    }
  };

  const handleExportVocab = () => {
    const words = Array.from(knownSet);
    if (words.length === 0) return;
    const csv = 'word\n' + words.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todoku-known-words.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-lg mx-auto">

        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Todoku" width={36} height={36} className="rounded-xl" unoptimized />
            <span className="text-white font-medium">todoku</span>
          </Link>
          <Link href="/about" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">about →</Link>
        </div>

        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-4">

          {/* Account */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Account</h2>
            {session?.user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {session.user.image && (
                    <Image src={session.user.image} alt="avatar" width={36} height={36} className="rounded-full" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{session.user.name}</p>
                    <p className="text-slate-500 text-xs">{session.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Not signed in — <Link href="/" className="text-indigo-400 hover:text-indigo-300">sign in</Link> to sync vocab across devices.</p>
            )}
          </div>

          {/* Subscription */}
          {session?.user && (
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Subscription</h2>
              <div className="flex items-center justify-between">
                <div>
                  {usage?.plan === 'pro' ? (
                    <>
                      <p className="text-white text-sm font-medium">Pro plan</p>
                      <p className="text-slate-500 text-xs mt-0.5">Unlimited analyses</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white text-sm font-medium">Free plan</p>
                      <p className="text-slate-500 text-xs mt-0.5">5 analyses per day</p>
                    </>
                  )}
                </div>
                {usage?.plan === 'pro' ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 disabled:opacity-50 transition-all"
                  >
                    {portalLoading ? 'Loading...' : 'Manage'}
                  </button>
                ) : (
                  <button
                    onClick={() => { window.location.href = '/'; }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-all"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Level */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Level</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Retake placement test</p>
                <p className="text-slate-500 text-xs mt-0.5">Clears your saved level so you see the test again</p>
              </div>
              {levelReset ? (
                <span className="text-green-400 text-sm">✓ Done — <Link href="/" className="underline">go to app</Link></span>
              ) : (
                <button
                  onClick={handleResetLevel}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Vocab */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Vocab database</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Export known words</p>
                  <p className="text-slate-500 text-xs mt-0.5">{knownSet.size} words marked known · downloads as CSV</p>
                </div>
                <button
                  onClick={handleExportVocab}
                  disabled={knownSet.size === 0}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Export
                </button>
              </div>
              <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Clear vocab database</p>
                  <p className="text-slate-500 text-xs mt-0.5">Remove all {knownSet.size} known words — cannot be undone</p>
                </div>
                {cleared ? (
                  <span className="text-green-400 text-sm">✓ Cleared</span>
                ) : (
                  <button
                    onClick={handleClearVocab}
                    disabled={knownSet.size === 0}
                    className="px-4 py-2 rounded-lg bg-red-900/50 text-red-400 text-sm hover:bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed border border-red-800 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-8 border-t border-slate-800">
          <Link href="/about" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            How Todoku works →
          </Link>
        </div>

      </div>
    </main>
  );
}
