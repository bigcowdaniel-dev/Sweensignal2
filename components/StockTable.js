"use client";

import { useMemo, useState } from "react";
import MiniChartPopover from "./MiniChartPopover";

const TICKERS = ["AEO", "LEVI", "ULTA", "VSCO"];

export default function StockTable({ summaries, onHoverTicker, hoveredTicker }) {
  const [hover, setHover] = useState(null);

  const rows = useMemo(() => {
    return TICKERS.map((t) => ({
      ticker: t,
      strength: summaries?.[t]?.strength || 0,
      posts: summaries?.[t]?.total || 0,
      lastStrongPositive: summaries?.[t]?.lastStrongPositive || null,
    }));
  }, [summaries]);

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs text-meta">
          <tr>
            <th className="px-3 py-2">Ticker</th>
            <th className="px-3 py-2">Strength</th>
            <th className="px-3 py-2">Posts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.ticker}
              className={`relative border-t hover:bg-lilac/60 cursor-pointer ${hoveredTicker === r.ticker ? 'bg-lilac/60' : ''}`}
              onMouseEnter={() => {
                setHover(r.ticker);
                onHoverTicker?.(r.ticker);
              }}
              onMouseLeave={() => {
                setHover(null);
                onHoverTicker?.(null);
              }}
              onTouchStart={() => {
                setHover(r.ticker);
                onHoverTicker?.(r.ticker);
              }}
            >
              <td className="px-3 py-2 font-medium">{r.ticker}</td>
              <td className="px-3 py-2">
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-2 rounded-full" style={{ width: `${r.strength}%`, background: "var(--blue)" }} />
                </div>
                <span className="text-xs text-meta ml-2">{r.strength}</span>
              </td>
              <td className="px-3 py-2">{r.posts}</td>
              {hover === r.ticker ? (
                <td className="absolute">
                  <MiniChartPopover ticker={r.ticker} lastStrongPositive={r.lastStrongPositive} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

