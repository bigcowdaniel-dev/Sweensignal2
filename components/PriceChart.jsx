'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import {
  ResponsiveContainer,
  LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const fetcher = (url) => fetch(url).then((r) => r.json());

function normalizePrices(raw) {
  if (!raw) return [];
  // Accept a few shapes: {prices:[{date,close}...]}, or [{date,close}], or stooq-ish [{t,c}]
  const arr =
    Array.isArray(raw) ? raw :
    Array.isArray(raw.prices) ? raw.prices :
    Array.isArray(raw.data) ? raw.data : [];

  return arr
    .map((p) => {
      const date = p.date || p.d || p.t || p.time || p.timestamp;
      const close = Number(p.close ?? p.c ?? p.price ?? p.v ?? p.closing);
      const d = typeof date === 'string' ? date.slice(0, 10) : new Date(date).toISOString().slice(0, 10);
      return (isFinite(close) ? { date: d, close } : null);
    })
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export default function PriceChart({ symbol, queryString = '' }) {
  const url = `/api/price/${encodeURIComponent(symbol)}${queryString ? `?${queryString}` : ''}`;
  const { data } = useSWR(url, fetcher, { revalidateOnFocus: false });

  const series = useMemo(() => normalizePrices(data), [data]);

  if (!series.length) {
    return <div className="text-sm opacity-70">No price data.</div>;
  }

  return (
    <div className="w-full h-64 border rounded-lg p-2 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
          <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="close" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
