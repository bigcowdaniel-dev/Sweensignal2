'use client';

import { useEffect } from 'react';

export default function HowItWorksSheet({
  open = false,
  onClose = () => {},
}) {
  // Close on ESC (unchanged)
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
      {/* Backdrop (unchanged) */}
      <div
        className={`fixed inset-0 z-40 transition-colors ${
          open ? 'bg-black/40' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Centered modal (unchanged positioning) */}
      <aside
        className={`fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border border-gray-200 bg-white shadow-xl transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="How it Works"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (unchanged controls) */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-base font-semibold">How it works</h2>
          <button
            onClick={onClose}
            className="text-sm underline opacity-90 hover:opacity-100"
          >
            Close
          </button>
        </div>

        {/* Body: clearer copy; scrolls if long */}
        <div className="space-y-4 p-5 text-sm leading-6 max-h-[70vh] overflow-y-auto">
          <p>
            SweenSignal watches the online chatter around <strong>Sydney Sweeney</strong>,
            maps posts to related <strong>brands/tickers</strong>, estimates
            <strong> sentiment</strong>, and summarizes it into a lightweight
            <strong> signal</strong> you can skim.
          </p>

          <section>
            <h3 className="mb-1 text-[13px] font-semibold">1) What we pull</h3>
            <ul className="ml-5 list-disc">
              <li>
                <strong>Live mode:</strong> uses <em>xAI Live Search</em> to fetch
                recent posts from X (Twitter) about Sweeney + related brands.
              </li>
              <li>
                <strong>Demo mode:</strong> shows a small fixed sample so you can try the UI
                with zero API spend.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-[13px] font-semibold">2) Mapping to tickers</h3>
            <ul className="ml-5 list-disc">
              <li>Cashtags like <code>$AEO</code> are detected directly.</li>
              <li>
                Brand words map to tickers when there’s no cashtag:
                <span className="ml-1">
                  Aerie → <code>AEO</code>, Levi → <code>LEVI</code>, Ulta → <code>ULTA</code>,
                  Victoria’s Secret → <code>VSCO</code>, Instagram/Meta → <code>META</code>.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-[13px] font-semibold">3) Sentiment</h3>
            <ul className="ml-5 list-disc">
              <li>
                If a post includes a label we use it; otherwise a small text heuristic scores tone
                from <code>-1</code> (negative) to <code>+1</code> (positive).
              </li>
              <li>Handles simple negation (e.g., “not good” counts as negative).</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-[13px] font-semibold">4) What the table shows</h3>
            <ul className="ml-5 list-disc">
              <li>
                <strong>Mentions</strong> — share of today’s Sweeney‑related posts that mention the ticker.
              </li>
              <li>
                <strong>Sentiment</strong> — average tone for that ticker’s posts.
              </li>
              <li>
                <strong>SweenSignal</strong> — a tiny composite of Mentions × Sentiment
                (green if positive, red if negative).
              </li>
              <li>
                <strong>reverse?</strong> — shown when momentum looks weaker than its recent baseline.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-[13px] font-semibold">5) Demo vs. live & cost control</h3>
            <ul className="ml-5 list-disc">
              <li>
                UI demo toggle: visit with <code>?demo=1</code> (or clear with <code>?demo=0</code>).
              </li>
              <li>
                Server kill switch (no paid calls): set <code>DATA_MODE=demo</code> in Vercel and redeploy.
              </li>
            </ul>
          </section>

          <p className="text-xs text-gray-500">
            Sources are linked in each card. This is a vibe‑first indicator, not investment advice.
          </p>
        </div>
      </aside>
    </>
  );
}
