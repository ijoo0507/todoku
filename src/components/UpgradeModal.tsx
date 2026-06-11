'use client';

interface Props {
  onClose: () => void;
  isGuest?: boolean;
}

export default function UpgradeModal({ onClose, isGuest }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">届く</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {isGuest ? "You've used your free analyses" : "Daily limit reached"}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isGuest
              ? 'Create a free account to get 5 analyses per day, or go Pro for unlimited.'
              : 'Free accounts get 5 analyses per day. Upgrade to Pro for unlimited analyses, cross-device vocab sync, and more.'}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium text-sm">Pro</span>
              <span className="text-indigo-300 font-semibold">$5.99 / mo</span>
            </div>
            <ul className="text-slate-300 text-xs space-y-1">
              <li>✓ Unlimited analyses</li>
              <li>✓ Vocab sync across devices</li>
              <li>✓ Analysis history</li>
              <li>✓ Priority support</li>
            </ul>
          </div>

          {isGuest && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium text-sm">Free account</span>
                <span className="text-slate-300 font-semibold">$0</span>
              </div>
              <ul className="text-slate-400 text-xs space-y-1">
                <li>✓ 5 analyses per day</li>
                <li>✓ Full vocab database</li>
                <li>✓ Anki export</li>
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => alert('Stripe coming soon!')}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all"
          >
            Upgrade to Pro
          </button>
          {isGuest && (
            <button
              onClick={() => { window.location.href = '/api/auth/signin'; }}
              className="w-full py-3 rounded-xl bg-slate-700 text-slate-300 font-medium hover:bg-slate-600 transition-all"
            >
              Sign up free
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
