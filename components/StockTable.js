'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TickerSheet from './TickerSheet';

function pct(x) {
  return `${Math.round((x || 0) * 100)}%`;
}
function sentiBadge(score) {
  if (score > 0.15) return '😊';
  if (score < -0.15) return '😞';
  return '😐';
}

export default function StockTable({ metrics = {}, hoveredTicker, onHover = () => {} }) {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState('');

  // Preserve whatever query string you’re using (?demo=1 etc)
  const queryString = useMemo(() => {
    const p = params?.toString?.() || '';
    return p ? `?${p}` : '';
  }, [params]);

  const rows = useMemo(() => {
    const r = Array.isArray(metrics?.rows) ? metrics.rows : [];
    return r;
  }, [metrics]);

  function openTicker(sym) {
    setSymbol(sym);
    setOpen(true);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-3 py-2 text-left">Ticker</th>
            <th className="px-3 py-2 text-right">Mentions</th>
            <th className="px-3 py-2 text-right">Sentiment</th>
            <th className="px-3 py-2 text-right">SweenSignal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const sigClass =
              r.sig > 0 ? 'text-green-600' : r.sig < 0 ? 'text-red-600' : 'text-gray-700';
            return (
              <tr
                key={r.ticker}
                onMouseEnter={() => onHover(r.ticker)}
                onMouseLeave={() => onHover(null)}
                className={`border-t hover:bg-gray-50 ${hoveredTicker === r.ticker ? 'bg-gray-50' : ''}`}
              >
                <td className="px-3 py-2">
                  {/* Button instead of Link — opens in-place sheet */}
                  <button
                    type="button"
                    onClick={() => openTicker(r.ticker)}
                    className="underline opacity-90 hover:opacity-100"
                    aria-label={`Open ${r.ticker} share price`}
                  >
                    {r.ticker}
                  </button>
                  {r.reverse && (
                    <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] text-yellow-800">
                      reverse?
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{pct(r.latest)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <span className="mr-1">{sentiBadge(r.senti)}</span>
                  {(r.senti >= 0 ? '+' : '') + (r.senti || 0).toFixed(2)}
                </td>
                <td className={`px-3 py-2 text-right tabular-nums ${sigClass}`}>
                  {(r.sig >= 0 ? '+' : '') + (r.sig || 0).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* In-place ticker box (modal) */}
      <TickerSheet
        open={open}
        symbol={symbol}
        queryString={queryString}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
