'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import Header from '../components/Header';
import FeedCard from '../components/FeedCard';
import StockTable from '../components/StockTable';
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

  // Hover link between feed and table
  const [hoverTicker, setHoverTicker] = useState(null);

  // Local panels (kept minimal; no overlays when closed)
  const [openHow, setOpenHow] = useState(false);
  const [openCitations, setOpenCitations] = useState(false);

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Left: Feed */}
          <section className="md:col-span-2 space-y-3">
            {(posts || []).map((item, idx) => (
              <div key={item?.id ?? item?.url ?? idx} className="space-y-1">
                <FeedCard item={item} onHoverTicker={setHoverTicker} />
                {/* Clickable per-post citations, outside any card link/overlay */}
                <div className="px-3 pb-2 relative z-[999] pointer-events-auto">
                  <Citations citations={item?.citations} />
                </div>
              </div>
            ))}
          </section>

          {/* Right: Per-ticker Strength/Sentiment/SweenSignal */}
          <aside className="md:col-span-1">
            <StockTable
              metrics={sentiment?.tickers || {}}
              hoveredTicker={hoverTicker}
              onHover={setHoverTicker}
            />
            <p className="mt-2 text-xs text-[#777] rounded border border-gray-200 p-3">
              Tip: Click a ticker to view a dated price chart. Hover to preview.
            </p>
          </aside>
        </div>
      </div>

      {/* ---------- Bottom controls (own buttons) ---------- */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
        <button
          onClick={() => setOpenHow(true)}
          className="rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        >
          🧠 How it works?
        </button>
        <button
          onClick={() => setOpenCitations(true)}
          className="rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        >
          🔗 Citations
        </button>
      </div>
      <div className="fixed bottom-3 right-6 z-[60]">
        <button
          onClick={() => {
            const u =
              process.env.NEXT_PUBLIC_STICKY_LINK_URL ||
              (typeof window !== 'undefined' ? window.location.href : '');
            if (!u) return;
            navigator.clipboard?.writeText(u);
          }}
          className="rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        >
          🔗 Copy live link
        </button>
      </div>

      {/* ---------- Inline panels (rendered only when open) ---------- */}
      {openHow && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpenHow(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 z-50 h-full w-[380px] max-w-[90vw] bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">How SweenSignal Works</h2>
              <button onClick={() => setOpenHow(false)} className="text-sm underline">Close</button>
            </div>
            <div className="p-4 text-sm space-y-3">
              <p>
                We compute <b>Strength</b> as the share of daily Sweeney posts that also mention a ticker.
                <b> SweenSignal</b> is the z-score of today’s Strength times the sign of sentiment.
              </p>
              <ul className="list-disc ml-5">
                <li>Reverse SweenSignal triggers when 7-day EMA falls below 70% of baseline.</li>
                <li>Toggle demo with <code>?demo=1</code>; clear with <code>?demo=0</code>.</li>
              </ul>
            </div>
          </aside>
        </>
      )}

      {openCitations && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpenCitations(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 z-50 h-full w-[420px] max-w-[95vw] bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Latest Citations</h2>
              <button onClick={() => setOpenCitations(false)} className="text-sm underline">Close</button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              {Array.isArray(sentiment?.citations) && sentiment.citations.length > 0 ? (
                sentiment.citations.slice(0, 50).map((c, i) => {
                  const url = typeof c === 'string' ? c : c?.url;
                  if (!url) return null;
                  let host = '';
                  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
                  const title = typeof c === 'string' ? host : (c?.title || host || 'source');
                  return (
                    <div key={i} className="truncate">
                      <a href={url} target="_blank" rel="noreferrer" className="underline hover:opacity-100">
                        {title}
                      </a>
                    </div>
                  );
                })
              ) : (
                <p className="opacity-70">No citations yet.</p>
              )}
            </div>
          </aside>
        </>
      )}
    </main>
  );
}
