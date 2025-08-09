'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function StockTable({ summaries = {}, hoveredTicker, onHover = () => {} }) {
  const params = useSearchParams();
  const qs = params.toString();
  const entries = Object.entries(summaries || {});

  if (!entries.length) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <p className="text-sm opacity-70">No ticker summaries yet.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-3 py-2">Ticker</th>
            <th className="text-right px-3 py-2">Positive</th>
            <th className="text-right px-3 py-2">Neutral</th>
            <th className="text-right px-3 py-2">Negative</th>
            <th className="text-right px-3 py-2">Pos%</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([ticker, s]) => {
            const counts = s?.counts || {};
            const pos = counts.positive || 0;
            const neu = counts.neutral || 0;
            const neg = counts.negative || 0;
            const total = pos + neu + neg || 0;
            const pct = total ? Math.round((pos / total) * 100) : 0;

            const href = `/ticker/${encodeURIComponent(ticker)}${qs ? `?${qs}` : ''}`;

            return (
              <tr
                key={ticker}
                onMouseEnter={() => onHover(ticker)}
                onMouseLeave={() => onHover(null)}
                className={`border-t hover:bg-gray-50 ${hoveredTicker === ticker ? 'bg-gray-50' : ''}`}
              >
                <td className="px-3 py-2">
                  <Link href={href} className="underline opacity-90 hover:opacity-100">
                    {ticker}
                  </Link>
                </td>
                <td className="px-3 py-2 text-right">{pos}</td>
                <td className="px-3 py-2 text-right">{neu}</td>
                <td className="px-3 py-2 text-right">{neg}</td>
                <td className="px-3 py-2 text-right">{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
