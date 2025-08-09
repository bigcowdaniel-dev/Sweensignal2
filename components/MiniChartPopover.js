"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function MiniChartPopover({ ticker, lastStrongPositive }) {
  const { data } = useSWR(() => (ticker ? `/api/price/${ticker}` : null), fetcher);
  const [markerX, setMarkerX] = useState(null);

  useEffect(() => {
    if (!data || !lastStrongPositive) return setMarkerX(null);
    // Find closest date to lastStrongPositive
    const target = new Date(lastStrongPositive).toISOString().slice(0, 10);
    let closest = null;
    let best = Infinity;
    for (const d of data) {
      const diff = Math.abs(new Date(d.t) - new Date(target));
      if (diff < best) {
        best = diff;
        closest = d.t;
      }
    }
    setMarkerX(closest);
  }, [data, lastStrongPositive]);

  if (!ticker) return null;
  return (
    <div className="absolute z-20 -top-4 left-full ml-2 w-60 h-32 card p-2 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <XAxis dataKey="t" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip formatter={(v) => [`$${v}`, "Close"]} labelFormatter={(l) => l} />
          {markerX ? (
            <ReferenceLine x={markerX} stroke="var(--pink)" strokeWidth={2} />
          ) : null}
          <Line type="monotone" dataKey="c" stroke="var(--blue)" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}





