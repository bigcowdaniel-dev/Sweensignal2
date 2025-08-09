// app/api/sentiment/route.js
import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EPS = 1e-6;

// Track these tickers even if zero this period
const TRACKED = ["AEO", "LEVI", "ULTA", "VSCO", "META"];

/** Brand/keyword → ticker heuristics so non-cashtag posts still count */
const KEYWORD_TO_TICKER = [
  { re: /\b(aerie|american\s+eagle)\b/i, ticker: "AEO" },
  { re: /\blevi'?s?\b/i,                   ticker: "LEVI" },
  { re: /\bulta\b/i,                       ticker: "ULTA" },
  { re: /\bvictoria'?s?\s+secret|\bvsco\b/i, ticker: "VSCO" },
  { re: /\bmeta|facebook|\binstagram\b|\big\b/i, ticker: "META" },
];

function toDateStr(ts) {
  try {
    if (!ts) return new Date().toISOString().slice(0, 10);
    const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
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

/** Lightweight text sentiment fallback (when no label is provided) */
function scoreSentiment(text = "") {
  const s = String(text).toLowerCase();

  const pos = new Set([
    "good","great","bull","bullish","up","rally","strong","beat","beats","breakout",
    "love","pump","momentum","buy","long","win","winner","gain","green"
  ]);
  const neg = new Set([
    "bad","bear","bearish","down","dump","weak","miss","missed","crash",
    "hate","sell","short","lose","loser","loss","red","concern","risk","risks"
  ]);

  let score = 0;
  const tokens = s.split(/[^a-z$]+/);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = tokens[i - 1] || "";
    const flip = prev === "not" || prev === "dont" || prev === "don't" ||
                 prev === "isn't" || prev === "wasn't" || prev === "ain't";
    if (pos.has(t)) score += flip ? -1 : 1;
    if (neg.has(t)) score += flip ? 1 : -1;
  }
  const denom = Math.max(Math.abs(score), 3);
  return Math.max(-1, Math.min(1, score / denom));
}

/** Normalize a ticker symbol like "$AEO" → "AEO" */
function normTicker(sym = "") {
  return String(sym).replace(/^\$/,"").toUpperCase();
}

/** Extract tickers from a post: cashtags + brand heuristics */
function getTickersFromPost(p) {
  const out = new Set();

  // 1) Any pre-parsed tickers from upstream
  if (Array.isArray(p?.tickers)) p.tickers.forEach((t) => t && out.add(normTicker(t)));
  if (p?.ticker) out.add(normTicker(p.ticker));

  // 2) $TICKER in text
  if (typeof p?.text === "string") {
    for (const m of p.text.matchAll(/\$([A-Z]{1,5})/g)) out.add(normTicker(m[1]));
  }

  // 3) Brand keywords → tickers (so posts without cashtags still count)
  const text = [p?.title, p?.text, p?.body, p?.caption].filter(Boolean).join(" ");
  for (const { re, ticker } of KEYWORD_TO_TICKER) {
    if (re.test(text)) out.add(ticker);
  }

  return [...out];
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
  const totalByDay = new Map(); // day -> total posts (denominator)
  const byTickerDay = new Map(); // ticker -> Map(day -> count)
  const sentiByTicker = new Map(); // ticker -> {positive, neutral, negative}

  const globalCitations = [];
  const seenCite = new Set();

  for (const p of posts) {
    const day = toDateStr(p.ts || p.date || p.created_at);
    totalByDay.set(day, (totalByDay.get(day) || 0) + 1);

    const tickers = getTickersFromPost(p);
    // Sentiment label from upstream (rare for xAI). If missing, compute from text.
    const lbl = p?.sentiment || p?.label || p?.prediction || p?.senti;
    const lblScore = labelToScore(lbl);
    const fallbackScore = lblScore !== 0 ? lblScore : scoreSentiment(
      [p?.title, p?.text, p?.body, p?.caption].filter(Boolean).join(" ")
    );

    for (const tRaw of tickers) {
      const t = normTicker(tRaw);
      if (!byTickerDay.has(t)) byTickerDay.set(t, new Map());
      const m = byTickerDay.get(t);
      m.set(day, (m.get(day) || 0) + 1);

      if (!sentiByTicker.has(t)) sentiByTicker.set(t, { positive: 0, neutral: 0, negative: 0 });
      const s = sentiByTicker.get(t);
      if (fallbackScore >  0.1) s.positive += 1;
      else if (fallbackScore < -0.1) s.negative += 1;
      else s.neutral += 1;
    }

    // Collect one citation per post if present
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

  // Ensure we always have at least one day (so latest indexing is safe)
  if (totalByDay.size === 0) {
    const today = toDateStr(Date.now());
    totalByDay.set(today, 0);
  }

  // Sort days ascending for reproducible series
  const days = [...totalByDay.keys()].sort();

  // 3) Compute metrics per ticker
  const tickers = {};

  // Build set of all tickers we saw + the TRACKED defaults
  const allTickers = new Set(TRACKED);
  for (const t of byTickerDay.keys()) allTickers.add(t);

  for (const t of allTickers) {
    const map = byTickerDay.get(t) || new Map();

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
        latest,                 // 0..1 (share of Sweeney posts on the latest day)
        series: strengthSeries, // aligned to `days`
        mu, sd, ema7, latestDate: days[days.length - 1] || null,
      },
      sentiment: {
        counts,
        score: Number(sentiScore.toFixed(3)), // -1..1
      },
      signal: {
        value: Number(signal.toFixed(3)),
        z: Number(z.toFixed(3)),
        reverse, // true when strength falls below ~70% of baseline
      },
    };
  }

  const res = NextResponse.json({ days, tickers, citations: globalCitations.slice(0, 200) });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
