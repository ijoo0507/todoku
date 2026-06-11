'use client';

import { useState } from 'react';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setStatus('sending');
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    setStatus('done');
    setMessage('');
    setTimeout(() => { setOpen(false); setStatus('idle'); }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-3 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs transition-all shadow-lg"
      >
        feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-1">Send feedback</h3>
            <p className="text-slate-400 text-xs mb-4">Bug, idea, or just saying hi — I read everything.</p>
            {status === 'done' ? (
              <p className="text-green-400 text-sm text-center py-4">✓ Got it, thanks!</p>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  maxLength={2000}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500 mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || status === 'sending'}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-40 transition-all"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
