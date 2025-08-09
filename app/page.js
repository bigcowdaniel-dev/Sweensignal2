'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import Header from '../components/Header';
import FeedCard from '../components/FeedCard';
import StockTable from '../components/StockTable';
import StickyBar from '../components/StickyBar';
import HowItWorksSheet from '../components/HowItWorksSheet';
import CitationsSheet from '../components/CitationsSheet';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Page() {
  return (
    <Suspense>
      {/* Page shell: fixed-height column. Body scroll is disabled in globals.css */}
      <div className="flex h-screen flex-col">
        <Header />
        <Main />
      </div>
    </Suspense>
  );
}

function Main() {
  const params = useSearchParams();
  const qs = params?.toString?.() || '';

  const postsKey = `/api/posts${qs ? `?${qs}` : ''}`;
  const sentiKey  = `/api/sentiment${qs ? `?${qs}` : ''}`;

  const { data: posts }     = useSWR(postsKey, fetcher, { revalidateOnFocus: false });
  const { data: sentiment } = useSWR(sentiKey,  fetcher, { revalidateOnFocus: false });

  const [hoverTicker, setHoverTicker] = useState(null);
  const [openHow, setOpenHow] = useState(false);
  const [openCite, setOpenCite] = useState(false);

  const citations = useMemo(() => {
    // Collect up to ~20 unique sources from posts if present
    const out = [];
    const seen = new Set();
    (Array.isArray(posts) ? posts : []).forEach(p => {
      const list = Array.isArray(p?.citations) ? p.citations : [];
      list.forEach(c => {
        const url = typeof c === 'string' ? c : c?.url;
        if (!url || seen.has(url)) return;
        seen.add(url);
        out.push(c);
      });
    });
    return out.slice(0, 40);
  }, [posts]);

  // ---- LAYOUT: no page scroll. Only the left column (feed) scrolls. ----
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-12 gap-6 px-4 sm:px-6 md:px-8 py-2">
        {/* LEFT: News feed (the ONLY scrollable area) */}
        <section
          className="col-span-12 lg:col-span-8 h-full overflow-y-auto pr-1"
          aria-label="News feed"
        >
          <div className="grid gap-4 pb-24">
            {(Array.isArray(posts) ? posts : []).map((item) => (
              <FeedCard
                key={item?.id || item?.url || Math.random()}
                item={item}
                onHoverTicker={(t) => setHoverTicker(t)}
              />
            ))}
          </div>
        </section>

        {/* RIGHT: Stock table (stable, non-scrolling) */}
        <aside className="col-span-12 lg:col-span-4 h-full overflow-hidden">
          <div className="stock-widget sticky top-2 max-h-full overflow-hidden p-0">
            <StockTable
              metrics={sentiment}
              hoveredTicker={hoverTicker}
              onHover={(t) => setHoverTicker(t)}
            />
            <div className="px-3 pb-3 pt-2 text-xs text-gray-500">
              Tip: Hover a row to preview price, or long-press on mobile.
            </div>
          </div>
        </aside>
      </div>

      {/* Floating controls + image */}
      <StickyBar
        onOpenHowItWorks={() => setOpenHow(true)}
        onOpenCitations={() => setOpenCite(true)}
        imageSrc="/sweeney.png"
      />

      {/* Center sheets (modal style) */}
      <HowItWorksSheet open={openHow} onClose={() => setOpenHow(false)} />
      <CitationsSheet open={openCite} onClose={() => setOpenCite(false)} citations={citations} />
    </main>
  );
}
