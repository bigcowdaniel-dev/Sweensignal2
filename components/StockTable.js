'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
  const qs = params.toString();

  const rows = Object.entries(metrics || {}).map(([ticker, m]) => {
    const s = m?.strength || {};
    const latest = s.latest || 0;
    const senti = m?.sentiment?.score ?? 0;
    const sig = m?.signal?.value ?? 0;
    return { ticker, latest, senti, sig, reverse: !!m?.signal?.reverse };
  });

  if (!rows.length) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <p className="text-sm opacity-70">No ticker metrics yet.</p>
      </div>
    );
  }

  // sort by strongest signal, desc
  rows.sort((a, b) => Math.abs(b.sig) - Math.abs(a.sig));

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-3 py-2">Ticker</th>
            <th className="text-right px-3 py-2">Strength</th>
            <th className="text-right px-3 py-2">Sentiment</th>
            <th className="text-right px-3 py-2">SweenSignal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const href = `/ticker/${encodeURIComponent(r.ticker)}${qs ? `?${qs}` : ''}`;
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
                  <Link href={href} className="underline opacity-90 hover:opacity-100">
                    {r.ticker}
                  </Link>
                  {r.reverse && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">reverse?</span>}
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
    </div>
  );
}
