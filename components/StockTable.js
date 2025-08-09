'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TickerSheet from './TickerSheet';

// ---- helpers ----
function isNum(n) { return Number.isFinite(n); }

function formatMentions(x) {
  const v = Number(x);
  if (!isNum(v)) return '0%';
  // If it's a fraction (0..1.2) treat as percent; otherwise show count
  if (v >= 0 && v <= 1.2) return `${Math.round(v * 100)}%`;
  return new Intl.NumberFormat('en-US').format(Math.round(v));
}

function sentiBadge(score) {
  if (score > 0.15) return '😊';
  if (score < -0.15) return '😞';
  return '😐';
}

// Accepts array, {rows}, {data}, {tickers}, or an object map { AEO:{...}, ... }
function coerceRows(input) {
  if (!input) return [];

  // If the caller passed the whole sentiment blob, drill into .tickers
  const maybe = input?.tickers ?? input;

  if (Array.isArray(maybe)) return maybe;
  if (Array.isArray(maybe?.rows)) return maybe.rows;
  if (Array.isArray(maybe?.data)) return maybe.data;

  // Object map -> array
  if (typeof maybe === 'object') {
    return Object.entries(maybe).map(([key, val]) => {
      // Ensure the key (ticker) is present
      return { ticker: key, ...(val || {}) };
    });
  }
  return [];
}

function normalizeRow(r = {}) {
  const ticker = r.ticker ?? r.symbol ?? r.name ?? '';
  const mentions = r.latest ?? r.mentions ?? r.mentionShare ?? r.mention_rate ?? r.count ?? 0;
  const senti = r.senti ?? r.sentiment ?? 0;
  const sig = r.sig ?? r.signal ?? 0;
  const reverse = !!(r.reverse ?? r.rev);
  return { ticker, latest: Number(mentions) || 0, senti: Number(senti) || 0, sig: Number(sig) || 0, reverse };
}

export default function StockTable({ metrics = {}, hoveredTicker, onHover = () => {} }) {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState('');

  // preserve ?demo=1, etc for the chart API
  const queryString = useMemo(() => {
    const p = params?.toString?.() || '';
    return p ? `?${p}` : '';
  }, [params]);

  const rows = useMemo(() => {
    const raw = coerceRows(metrics);
    return raw.map(normalizeRow).filter(r => r.ticker);
  }, [metrics]);

  function openTicker(sym) {
    setSymbol(sym);
    setOpen(true);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <table className="w-full table-fixed text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="w-[28%] px-3 py-2 text-left">Ticker</th>
            <th className="w-[24%] px-3 py-2 text-right">Mentions</th>
            <th className="w-[24%] px-3 py-2 text-right">Sentiment</th>
            <th className="w-[24%] px-3 py-2 text-right">SweenSignal</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                No tickers yet.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
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

                  <td className="px-3 py-2 text-right tabular-nums">{formatMentions(r.latest)}</td>

                  <td className="px-3 py-2 text-right tabular-nums">
                    <span className="mr-1">{sentiBadge(r.senti)}</span>
                    {(r.senti >= 0 ? '+' : '') + r.senti.toFixed(2)}
                  </td>

                  <td className={`px-3 py-2 text-right tabular-nums ${sigClass}`}>
                    {(r.sig >= 0 ? '+' : '') + r.sig.toFixed(2)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* In-place ticker modal */}
      <TickerSheet open={open} symbol={symbol} queryString={queryString} onClose={() => setOpen(false)} />
    </div>
  );
}
