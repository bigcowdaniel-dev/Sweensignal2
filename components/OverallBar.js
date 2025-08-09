import { useMemo } from "react";

export default function OverallBar({ percent, summaries }) {
  const pct = useMemo(() => {
    if (typeof percent === "number" && !Number.isNaN(percent)) return clamp(percent);
    if (summaries && typeof summaries === "object") {
      let pos = 0, neu = 0, neg = 0;
      for (const k of Object.keys(summaries)) {
        const c = summaries[k]?.counts || {};
        pos += c.positive || 0;
        neu += c.neutral  || 0;
        neg += c.negative || 0;
      }
      const total = pos + neu + neg;
      return total ? clamp(Math.round((pos / total) * 100)) : 0;
    }
    return 0;
  }, [percent, summaries]);

  const vibe =
    pct >= 60 ? "Poppin’" :
    pct >= 40 ? "Vibey"   :
    pct > 0   ? "Chill"   : "—";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Overall Sentiment</span>
        <span className="text-[#777]">Positive ({pct}%) <span className="ml-1">{vibe}</span></span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#FFF3FA]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF4FB2] via-[#FF4FB2] to-[#1F8EFA] transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function clamp(n){ return Math.max(0, Math.min(100, n)); }
