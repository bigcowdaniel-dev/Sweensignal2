// app/api/sentiment/route.js
import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EPS = 1e-6;

function toDateStr(ts) {
  try {
    if (!ts) return new Date().toISOString().slice(0, 10);
    const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function getTickersFromPost(p) {
  const out = new Set();
  if (Array.isArray(p?.tickers)) p.tickers.forEach((t) => t && out.add(String(t).toUpperCase()));
  if (p?.ticker) out.add(String(p.ticker).toUpperCase());
  // very light $TICKER regex as fallback
  if (typeof p?.text === "string") {
    for (const m of p.text.matchAll(/\$([A-Z]{1,5})/g)) out.add(m[1].toUpperCase());
  }
  return [...out];
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stddev(arr) {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const v = mean(arr.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}
function ema(arr, k = 7) {
  if (!arr.length) return 0;
  const alpha = 2 / (k + 1);
  let e = arr[0];
  for (let i = 1; i < arr.length; i++) e = alpha * arr[i] + (1 - alpha) * e;
  return e;
}

function labelToScore(lbl) {
  const s = String(lbl || "").toLowerCase();
  if (s.startsWith("pos")) return 1;
  if (s.startsWith("neg")) return -1;
  return 0;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const demo = ["", "1", "true", "on", "yes"].includes(
    (searchParams.get("demo") || "").toLowerCase()
  );

  // 1) Get posts (live or demo)
  let { posts } = await fetchPosts({ demo });
  posts = Array.isArray(posts) ? posts : [];

  // 2) Group by day & ticker
  const totalByDay = new Map(); // day -> total posts (used as denominator)
  const byTickerDay = new Map(); // ticker -> Map(day -> count)
  const sentiByTicker = new Map(); // ticker -> {pos,neu,neg}

  // optional: collect unique citations for the Citations sheet
  const globalCitations = [];
  const seenCite = new Set();

  for (const p of posts) {
    const day = toDateStr(p.ts || p.date || p.created_at);
    totalByDay.set(day, (totalByDay.get(day) || 0) + 1);

    const tickers = getTickersFromPost(p);
    const lbl = p?.sentiment || p?.label || p?.prediction || p?.senti;
    const lblScore = labelToScore(lbl);

    for (const t of tickers) {
      if (!byTickerDay.has(t)) byTickerDay.set(t, new Map());
      const m = byTickerDay.get(t);
      m.set(day, (m.get(day) || 0) + 1);

      if (!sentiByTicker.has(t)) sentiByTicker.set(t, { positive: 0, neutral: 0, negative: 0 });
      const s = sentiByTicker.get(t);
      if (lblScore > 0) s.positive += 1;
      else if (lblScore < 0) s.negative += 1;
      else s.neutral += 1;
    }

    // collect one citation per post if present
    const candidates = [];
    if (Array.isArray(p.citations)) {
      for (const c of p.citations) {
        const url = typeof c === "string" ? c : c?.url;
        if (url) candidates.push(url);
      }
    }
    if (p.url) candidates.push(p.url);
    if (p.link) candidates.push(p.link);
    if (p.permalink) candidates.push(p.permalink);

    for (const u of candidates) {
      if (/^https?:\/\//.test(u) && !seenCite.has(u)) {
        seenCite.add(u);
        globalCitations.push({ url: u });
      }
    }
  }

  // Sort days ascending for reproducible series
  const days = [...totalByDay.keys()].sort();

  // 3) Compute metrics per ticker
  const tickers = {};
  for (const [t, map] of byTickerDay.entries()) {
    const strengthSeries = days.map((d) => {
      const denom = totalByDay.get(d) || 0;
      const num = map.get(d) || 0;
      return denom ? num / denom : 0;
    });

    const latest = strengthSeries.length ? strengthSeries[strengthSeries.length - 1] : 0;
    const hist = strengthSeries.slice(0, -1);
    const mu = hist.length ? mean(hist) : mean(strengthSeries);
    const sd = hist.length ? stddev(hist) : stddev(strengthSeries);
    const z = sd > 0 ? (latest - mu) / (sd + EPS) : 0;
    const ema7 = ema(strengthSeries, 7);
    const reverse = ema7 < 0.7 * (mu || EPS);

    const counts = sentiByTicker.get(t) || { positive: 0, neutral: 0, negative: 0 };
    const total = (counts.positive || 0) + (counts.neutral || 0) + (counts.negative || 0);
    const sentiScore =
      total > 0 ? ((counts.positive || 0) - (counts.negative || 0)) / total : 0;

    const signal = z * (sentiScore > 0 ? 1 : sentiScore < 0 ? -1 : 0);

    tickers[t] = {
      strength: {
        latest,            // 0..1 fraction of day’s Sweeney posts
        series: strengthSeries, // array aligned to `days`
        mu, sd, ema7, latestDate: days[days.length - 1] || null,
      },
      sentiment: {
        counts,
        score: Number(sentiScore.toFixed(3)), // -1..1
      },
      signal: {
        value: Number(signal.toFixed(3)),
        z: Number(z.toFixed(3)),
        reverse, // true when strength falls below 70% of baseline
      },
    };
  }

  const res = NextResponse.json({ days, tickers, citations: globalCitations.slice(0, 200) });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
