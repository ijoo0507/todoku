'use client';

interface Props {
  used: number;
  limit: number | null;
  plan?: string;
  onUpgradeClick: () => void;
}

export default function UsageCounter({ used, limit, plan, onUpgradeClick }: Props) {
  if (plan === 'pro') {
    return (
      <span className="px-2 py-0.5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium">
        Pro
      </span>
    );
  }

  if (limit === null) return null;

  const remaining = limit - used;
  const isLow = remaining <= 1;
  const isOut = remaining <= 0;

  return (
    <button
      onClick={onUpgradeClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all hover:opacity-80 ${
        isOut
          ? 'bg-red-900/40 border-red-700/50 text-red-300'
          : isLow
          ? 'bg-amber-900/40 border-amber-700/50 text-amber-300'
          : 'bg-slate-700/50 border-slate-600 text-slate-400'
      }`}
    >
      <span>{isOut ? 'Limit reached' : `${remaining}/${limit} left today`}</span>
      {(isOut || isLow) && <span className="text-current opacity-70">· upgrade</span>}
    </button>
  );
}
