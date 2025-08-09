'use client';
export default function HowItWorksSheet({
  open = false,
  onClose = () => {},
}) {
  // Backdrop: disabled when closed so it can’t block clicks
  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-colors ${
          open ? 'bg-black/40' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Panel: disabled when closed */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 h-full w-[380px] max-w-[90vw] bg-white shadow-xl transition-transform
          ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">How SweenSignal Works</h2>
          <button onClick={onClose} className="text-sm underline">Close</button>
        </div>
        <div className="p-4 text-sm space-y-3">
          <p>
            We track <b>Sydney Sweeney</b> mentions + co-mentions with brands/tickers,
            compute association strength & sentiment, and surface spikes as signals.
          </p>
          <ul className="list-disc ml-5">
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
