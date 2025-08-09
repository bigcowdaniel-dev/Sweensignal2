"use client";

export default function OverallBar({ posts, summaries }) {
  let totals = { positive: 0, neutral: 0, negative: 0 };
  let total = 0;

  if (summaries) {
    const tickers = Object.keys(summaries);
    for (const t of tickers) {
      const c = summaries[t]?.counts || { positive: 0, neutral: 0, negative: 0 };
      totals.positive += c.positive || 0;
      totals.neutral += c.neutral || 0;
      totals.negative += c.negative || 0;
    }
    total = tickers.reduce((acc, t) => acc + (summaries[t]?.total || 0), 0);
  } else {
    for (const p of posts || []) {
      if (p.sentiment === "positive") totals.positive++;
      else if (p.sentiment === "negative") totals.negative++;
      else totals.neutral++;
    }
    total = (posts || []).length;
  }

  total = total || 1;
  const pctPos = Math.round((totals.positive / total) * 100);
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between text-sm mb-2">
        <div>Overall Sentiment</div>
        <div className="text-meta">Positive ({pctPos}%)</div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2 bg-blue" style={{ width: `${pctPos}%` }} />
      </div>
    </div>
  );
}

