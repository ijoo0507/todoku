import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getShare } from '@/lib/shares';

export const runtime = 'nodejs';

// Dedupe the DB read between generateMetadata and the page
const loadShare = cache(getShare);

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const share = await loadShare(id);
  if (!share) return { title: 'Todoku' };
  const title = `I understand ${share.score}% of ${share.title ?? 'this'}`;
  const description = `${share.known} of ${share.totalUnique} unique words known. How much Japanese can you understand?`;
  return {
    title: `${title} · Todoku`,
    description,
    openGraph: { title, description, type: 'website', url: `/s/${share.id}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const share = await loadShare(id);
  if (!share) notFound();

  const color = scoreColor(share.score);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (share.score / 100) * circ;

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Todoku" width={36} height={36} className="rounded-xl" unoptimized />
            <span className="text-white font-medium">todoku</span>
          </Link>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
              <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
              <circle
                cx="60" cy="60" r={r}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={circ / 4}
                strokeLinecap="round"
              />
              <text x="60" y="56" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                {share.score}%
              </text>
              <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="9">
                comprehension
              </text>
            </svg>
            <div className="text-center sm:text-left">
              <h1 className="text-white text-xl font-semibold">
                I understand {share.score}% of this
              </h1>
              {share.title && <p className="text-slate-300 mt-1 break-words">{share.title}</p>}
              <p className="text-slate-500 text-sm mt-2">
                {share.known} of {share.totalUnique} unique words known
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 block w-full py-3 rounded-xl bg-indigo-600 text-white text-center text-sm font-medium hover:bg-indigo-500 transition-all"
        >
          Check how much you understand
        </Link>
      </div>
    </main>
  );
}

function scoreColor(score: number) {
  return score >= 90 ? '#22c55e' : score >= 75 ? '#3b82f6' : score >= 60 ? '#f59e0b' : '#ef4444';
}
