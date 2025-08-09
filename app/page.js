'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import Header from '../components/Header';
import FeedCard from '../components/FeedCard';
import StockTable from '../components/StockTable';
import StickyBar from '../components/StickyBar';
import HowItWorksSheet from '../components/HowItWorksSheet';
import CitationsSheet from '../components/CitationsSheet';
import OverallBar from '../components/OverallBar';
import Citations from '../components/Citations';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Main />
    </Suspense>
  );
}

function Main() {
  const params = useSearchParams();
  const qs = params.toString(); // e.g., "demo=1"
  const postsKey = `/api/posts${qs ? `?${qs}` : ''}`;
  const sentiKey = `/api/sentiment${qs ? `?${qs}` : ''}`;

  const { data: posts } = useSWR(postsKey, fetcher, { revalidateOnFocus: false });
  const { data: sentiment } = useSWR(sentiKey, fetcher, { revalidateOnFocus: false });

  // Derived numbers for OverallBar
  const overall = useMemo(() => {
    const sums = sentiment?.summaries || {};
    let pos = 0, neu = 0, neg = 0;
    Object.values(sums).forEach((s) => {
      if (!s?.counts) return;
      pos += s.counts.positive || 0;
      neu += s.counts.neutral || 0;
      neg += s.counts.negative || 0;
    });
    const total = pos + neu + neg || 0;
    const pct = total ? Math.round((pos / total) * 100) : 0;
    return { pos, neu, neg, total, pct };
  }, [sentiment]);

  // Hover link between feed and table
  const [hoverTicker, setHoverTicker] = useState(null);

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Overall sentiment bar */}
        <div className="mt-6">
          <OverallBar percent={overall.pct} />
        </div>

        {/* Two-column layout */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Left: Feed */}
          <section className="md:col-span-2 space-y-3">
            {(posts || []).map((item, idx) => (
              <div key={item?.id ?? item?.url ?? idx} className="space-y-1">
                <FeedCard item={item} onHoverTicker={setHoverTicker} />
                {/* Clickable per-post citations */}
                <div className="px-3 pb-2 relative z-[999] pointer-events-auto">
                  <Citations citations={item?.citations} />
                </div>
              </div>
            ))}
          </section>

          {/* Right: Stock Sentiment */}
          <aside className="md:col-span-1">
            <StockTable
              summaries={sentiment?.summaries || {}}
              hoveredTicker={hoverTicker}
              onHover={setHoverTicker}
            />
            <p className="mt-2 text-xs text-[#777] rounded border border-gray-200 p-3">
              Tip: Hover a row to preview price, or long-press on mobile.
            </p>
          </aside>
        </div>
      </div>

      {/* Sheets / sticky controls */}
      <HowItWorksSheet />
      <CitationsSheet citations={sentiment?.citations || []} />
      <StickyBar />
    </main>
  );
}
