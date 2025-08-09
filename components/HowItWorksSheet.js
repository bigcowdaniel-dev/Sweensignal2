'use client';
import { useState } from 'react';

export default function HowItWorksSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Small trigger button — you can keep your existing trigger if you already have one */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="howitworks-sheet"
      >
        How it works?
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-colors ${
          open ? 'bg-black/40' : 'bg-transparent pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Panel */}
      <aside
        id="howitworks-sheet"
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 h-full w-[380px] max-w-[90vw] bg-white shadow-xl transition-transform
          ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">How SweenSignal Works</h2>
          <button onClick={() => setOpen(false)} className="text-sm underline">Close</button>
        </div>
        <div className="p-4 text-sm space-y-3">
          <p>
            We track <b>Sydney Sweeney</b> mentions and co-mentions with brands/tickers, compute
            association strength and sentiment, and surface spikes as signals.
          </p>
          <ul className="list-disc ml-5">
            <li>Sources: Reddit, News/RSS, optional xAI classify</li>
            <li>Prices: Stooq daily OHLC</li>
            <li>Demo: visit with <code>?demo=1</code>; clear with <code>?demo=0</code></li>
          </ul>
        </div>
      </aside>
    </>
  );
}
