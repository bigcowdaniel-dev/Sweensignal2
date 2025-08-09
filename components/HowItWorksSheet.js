"use client";

export default function HowItWorksSheet({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30">
      <div className="card w-full md:w-[640px] max-h-[80vh] overflow-auto p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">How it works</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-4 text-sm text-meta">
          <p>Sources: Reddit search + Google News RSS. Optional xAI Live Search may consult recent web/news/X sources.</p>
          <p>Sentiment: xAI classifier returns labels and scores (−1..1), strong positive ≥ 0.6. Fallback uses VADER with ±0.3 thresholds and a backup regex-based ticker map.</p>
          <p>Prices: Daily via Stooq (AEO, LEVI, ULTA, VSCO).</p>
          <p>Caching: posts/prices ~60s, sentiment ~120s.</p>
          <p>Privacy: all fetches server-side; no cookies/accounts.</p>
        </div>
      </div>
    </div>
  );
}





