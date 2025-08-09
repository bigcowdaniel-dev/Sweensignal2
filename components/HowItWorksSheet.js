'use client';

import { useEffect } from 'react';

export default function HowItWorksSheet({
  open = false,
  onClose = () => {},
}) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-colors ${
          open ? 'bg-black/40' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border border-gray-200 bg-white shadow-xl transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="How it Works"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-base font-semibold">How it Works</h2>
          <button onClick={onClose} className="text-sm underline opacity-90 hover:opacity-100">
            Close
          </button>
        </div>

        <div className="space-y-3 p-5 text-sm">
          <p>
            SweenSignal tracks Sydney Sweeney mentions across multiple sources, maps them to brands/tickers,
            and computes sentiment + a simple “signal.”
          </p>
          <ul className="ml-5 list-disc">
            <li>Sources: Reddit, News/RSS, optional xAI classify</li>
            <li>Prices: Stooq daily OHLC</li>
            <li>Demo: visit with <code>?demo=1</code>; clear with <code>?demo=0</code></li>
          </ul>
          <p className="opacity-70">
            There’s also a full page at <code>/how-it-works</code>.
          </p>
        </div>
      </aside>
    </>
  );
}
