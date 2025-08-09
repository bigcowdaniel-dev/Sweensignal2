// app/page.js
'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import Header from '../components/Header';
import FeedCard from '../components/FeedCard';
import StockTable from '../components/StockTable';
import StickyBar from '../components/StickyBar';
import Citations from '../components/Citations';
import TickerSheet from '../components/TickerSheet';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Page() {
  const params = useSearchParams();

  // Preserve query flags (e.g., ?demo=1) for API/chart requests
  const queryString = useMemo(() => {
    const qs = new URLSearchParams(params ?? undefined);
    return qs.toString();
  }, [params]);

  // Data
  const { data: posts } = useSWR('/api/posts', fetcher, { suspense: false });
  const { data: metrics } = useSWR('/api/sentiment', fetcher, { suspense: false });

  // UI state
  const [showHow, setShowHow] = useState(false);
  const [showCitations, setShowCitations] = useState(false);

  // NEW: ticker sheet state
  const [selectedTicker, setSelectedTicker] = useState(null);

  // Intercept clicks on links to /ticker/XYZ and open the sheet instead
  useEffect(() => {
    function onClick(e) {
      // find the nearest anchor
      const a = e.target instanceof Element ? e.target.closest('a') : null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      // handle only internal ticker links: /ticker/XXX or /ticker/XXX?...
      if (!/^\/ticker\/[A-Za-z0-9._-]+/.test(href)) return;

      e.preventDefault();
      try {
        const url = new URL(href, window.location.origin);
        const symbol = (url.pathname.split('/').pop() || '').toUpperCase();
        if (symbol) setSelectedTicker(symbol);
      } catch {
        // fallback: crude parse
        const parts = href.split('/');
        const symbol = (parts[parts.length - 1] || '').split('?')[0].toUpperCase();
        if (symbol) setSelectedTicker(symbol);
      }
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Close helpers
  const closeAllSheets = () => {
    setShowHow(false);
    setShowCitations(false);
    setSelectedTicker(null);
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_360px] md:px-8">
        {/* Left: feed */}
        <section className="space-y-4">
          {(posts || []).map((p, i) => (
            <FeedCard key={i} item={p} />
          ))}
        </section>

        {/* Right: stock table */}
        <aside>
          <div className="rounded-xl border bg-white p-3">
            <div className="mb-2 text-sm text-gray-500">
              <strong>Tip:</strong> Hover a row to preview price, or click a ticker to open its chart.
            </div>
            <StockTable metrics={metrics || {}} />
          </div>
        </aside>
      </div>

      {/* Bottom helpers */}
      <StickyBar
        onOpenHowItWorks={() => setShowHow(true)}
        onOpenCitations={() => setShowCitations(true)}
      />

      {/* Existing inline “How it works” content (kept) */}
      {showHow && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center"
          onClick={closeAllSheets}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-medium">How it works</h2>
            <p className="text-sm opacity-80">
              SweenSignal tracks Sydney Sweeney mentions, maps co‑mentions to tickers, and scores association strength & sentiment.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm opacity-80">
              <li>Sources: Reddit, News/RSS, optional xAI classify</li>
              <li>Prices: Stooq daily OHLC</li>
              <li>Demo mode: visit with <code>?demo=1</code></li>
            </ul>
          </div>
        </div>
      )}

      {/* Existing inline “Citations” content (kept) */}
      {showCitations && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center"
          onClick={closeAllSheets}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-medium">Citations</h2>
            <Citations />
          </div>
        </div>
      )}

      {/* NEW: Ticker sheet */}
      <TickerSheet
        open={!!selectedTicker}
        symbol={selectedTicker || ''}
        queryString={queryString}
        onClose={() => setSelectedTicker(null)}
      />
    </main>
  );
}
