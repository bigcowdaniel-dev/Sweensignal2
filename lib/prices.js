import { getCache, setCache } from "./cache.js";

const TICKER_TO_STOOQ = {
  AEO: "aeo.us",
  LEVI: "levi.us",
  ULTA: "ulta.us",
  VSCO: "vsco.us",
};

export async function fetchDailyPrices(ticker) {
  const key = `prices:${ticker}`;
  const cached = getCache(key, 60 * 1000);
  if (cached) return cached;

  const sym = TICKER_TO_STOOQ[ticker];
  if (!sym) return [];
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=d`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error("stooq http " + res.status);
    const csv = await res.text();
    const lines = csv.trim().split(/\r?\n/);
    const data = lines
      .slice(1)
      .map((line) => line.split(","))
      .map(([d, o, h, l, c]) => ({ t: d, c: Number(c) }))
      .filter((p) => p.t && Number.isFinite(p.c));
    setCache(key, data);
    return data;
  } catch {
    return [];
  }
}





