import { getCache, setCache } from "./cache.js";

/**
 * Map app tickers → Stooq symbols
 * Add any symbols you want hover‑prices for.
 * Stooq uses ".us" for US tickers.
 */
const TICKER_TO_STOOQ = {
  // Originals
  AEO: "aeo.us",
  LEVI: "levi.us",
  ULTA: "ulta.us",
  VSCO: "vsco.us",

  // Expanded common mentions from the feed
  KO: "ko.us",
  PEP: "pep.us",
  CELH: "celh.us",
  SBUX: "sbux.us",
  NKE: "nke.us",
  META: "meta.us",
  TSLA: "tsla.us",
  AAPL: "aapl.us",
  MSFT: "msft.us",
  AMZN: "amzn.us",
  NVDA: "nvda.us",
  DIS: "dis.us",
  NFLX: "nflx.us",
  SNAP: "snap.us",
  TGT: "tgt.us",
  WMT: "wmt.us",
  BUD: "bud.us",
  STZ: "stz.us",
  DEO: "deo.us",
};

export async function fetchDailyPrices(ticker) {
  const key = `prices:${ticker}`;
  const cached = getCache(key, 60 * 1000);
  if (cached) return cached;

  const sym = TICKER_TO_STOOQ[ticker];
  if (!sym) return [];

  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=d`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const csv = await res.text();

    // Skip header; keep only date, close
    const data = csv
      .trim()
      .split("\n")
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
