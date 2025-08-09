"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Header from "../components/Header";
import FeedCard from "../components/FeedCard";
import StockTable from "../components/StockTable";
import StickyBar from "../components/StickyBar";
import HowItWorksSheet from "../components/HowItWorksSheet";
import CitationsSheet from "../components/CitationsSheet";
import OverallBar from "../components/OverallBar";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Page() {
  const { data: posts } = useSWR("/api/posts", fetcher, { refreshInterval: 60000 });
  const { data: sentiment } = useSWR("/api/sentiment", fetcher, { refreshInterval: 120000 });
  const [hoverTicker, setHoverTicker] = useState(null);
  const [showHow, setShowHow] = useState(false);
  const [showCitations, setShowCitations] = useState(false);

  const enrichedPosts = useMemo(() => {
    // For UI, combine post list with any available ticker/sentiment from summaries where possible
    // The sentiment endpoint returns only summaries; posts themselves are unclassified unless seeds
    return (posts || []).map((p) => p);
  }, [posts]);

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="max-w-5xl mx-auto p-4 md:p-6 grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <OverallBar posts={enrichedPosts} summaries={sentiment?.summaries} />
          <div className="grid gap-3">
            {(enrichedPosts || []).map((item) => (
              <FeedCard key={item.id} item={item} onHoverTicker={setHoverTicker} hoveredTicker={hoverTicker} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <StockTable summaries={sentiment?.summaries} onHoverTicker={setHoverTicker} hoveredTicker={hoverTicker} />
          <div className="card p-3 text-xs text-meta">
            <div>Tip: Hover a row to preview price, or long-press on mobile.</div>
          </div>
        </div>
      </main>
      <StickyBar onOpenHow={() => setShowHow(true)} onOpenCitations={() => setShowCitations(true)} />
      <HowItWorksSheet open={showHow} onClose={() => setShowHow(false)} />
      <CitationsSheet open={showCitations} onClose={() => setShowCitations(false)} citations={sentiment?.citations} />
    </div>
  );
}

