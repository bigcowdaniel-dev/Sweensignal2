'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import Header from '../components/Header';
import FeedCard from '../components/FeedCard';
import StockTable from '../components/StockTable';
import StickyBar from '../components/StickyBar';
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
  const qs = params.toString();
  const postsKey = `/api/posts${qs ? `?${qs}` : ''}`;
  const sentiKey = `/api/sentiment${qs ? `?${qs}` : ''}`;

  const { data: posts } = useSWR(postsKey, fetcher, { revalidateOnFocus: false });
  const { data: sentiment } = useSWR(sentiKey, fetcher, { revalidateOnFocus: false });

  const [hoverTicker, setHoverTicker] = useState(null);

  // modal state
  const [open, setOpen] = useState(null); // 'how', 'cites', or null
  const toggle = (which) => setOpen((prev) => (prev === which ? null : which));
  const close = () => setOpen(null);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Feed */}
          <section className="md:col-span-2 space-y-3">
            {(posts || []).map((item, idx) => (
              <div key={item?.id ?? item?.url ?? idx} className="space-y-1">
                <FeedCard item={item} onHoverTicker={setHoverTicker} />
                <div className="px-3 pb-2 relative z-[999] pointer-events-auto">
                  <Citations citations={item?.citations} />
                </div>
              </div>
            ))}
          </section>

          {/* Stock table */}
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

      {/* Sticky bar */}
      <StickyBar
        onOpenHowItWorks={() => toggle('how')}
        onOpenCitations={() => toggle('cites')}
        imageSrc="/sweeney.png" // place your PNG in /public/sweeney.png
      />

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* How it Works Modal */}
      {open === 'how' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-xl rounded-xl bg-white shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h2 className="text-base font-semibold">How it Works</h2>
              <button onClick={close} className="text-sm underline">
                Close
              </button>
            </div>
            <div className="p-5 text-sm space-y-3">
              <p>
                SweenSignal tracks Sydney Sweeney mentions across multiple sources, matches
                them to brands and tickers, and calculates sentiment.
              </p>
              <ul className="list-disc ml-5">
                <li>Data from Reddit, news, and other feeds</li>
                <li>Tickers linked to brands or products she’s associated with</li>
                <li>Overall sentiment combines positive, neutral, and negative posts</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Citations Modal */}
      {open === 'cites' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h2 className="text-base font-semibold">Citations</h2>
              <button onClick={close} className="text-sm underline">
                Close
              </button>
            </div>
            <div className="p-5 text-sm max-h-[70vh] overflow-auto">
              {Array.isArray(sentiment?.citations) && sentiment.citations.length > 0 ? (
                <ul className="space-y-2">
                  {sentiment.citations.map((c, i) => (
                    <li key={i}>
                      <a
                        href={typeof c === 'string' ? c : c?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {typeof c === 'string' ? c : c?.title || c?.url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No citations available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
