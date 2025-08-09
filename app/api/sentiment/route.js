export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { classifyWithXAI } from "../../../lib/classifyWithXAI.js";
import { mapTicker } from "../../../lib/mapTicker.js";
import { vaderScore, labelFromCompound } from "../../../lib/sentiment.js";
import { getCache, setCache } from "../../../lib/cache.js";
import { fetchReddit } from "../../../lib/reddit.js";
import { fetchNews } from "../../../lib/news.js";
import seeds from "../../../lib/seeds.js";

const TICKERS = ["AEO", "LEVI", "ULTA", "VSCO"];
const CACHE_KEY = "sentiment:v1";
const TTL_MS = 120 * 1000;

async function getPosts({ demo }) {
  try {
    if (demo) return seeds;
    const [r, n] = await Promise.allSettled([fetchReddit(), fetchNews()]);
    const posts = []
      .concat(r.status === "fulfilled" ? r.value : [])
      .concat(n.status === "fulfilled" ? n.value : []);
    return posts.length ? posts : seeds;
  } catch {
    return seeds;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const demo = searchParams.get("demo") === "1";

  const cached = getCache(CACHE_KEY, TTL_MS);
  if (cached && !demo) return NextResponse.json(cached);

  const posts = await getPosts({ demo });

  const items = posts.map(p => ({ id: p.id, text: p.text }));
  const out = await classifyWithXAI(items);
  const byId = Object.fromEntries((out?.items || []).map(x => [x.id, x]));

  const labeled = posts.map(p => {
    const ai = byId[p.id] || {};
    const ticker = ai.ticker || mapTicker(p.text) || mapTicker(p.url);
    let score = typeof ai.score === "number" ? ai.score : vaderScore(p.text);
    const sentiment = ai.sentiment || labelFromCompound(score);
    return { ...p, ticker, score, sentiment };
  }).filter(p => !!p.ticker);

  const summaries = {};
  for (const t of TICKERS) {
    const ps = labeled.filter(p => p.ticker === t);
    const counts = { positive: 0, neutral: 0, negative: 0 };
    let lastStrongPositive = null;
    for (const p of ps) {
      counts[p.sentiment] = (counts[p.sentiment] || 0) + 1;
      if (p.sentiment === "positive" && p.score >= 0.6) {
        if (!lastStrongPositive || p.createdAt > lastStrongPositive) {
          lastStrongPositive = p.createdAt;
        }
      }
    }
    const positives = counts.positive || 0;
    const negatives = counts.negative || 0;
    const strength = Math.max(0, Math.min(100, (positives - negatives) * 25 + positives * 10));
    summaries[t] = { ticker: t, total: ps.length, counts, lastStrongPositive, strength };
  }

  const payload = { summaries, citations: out?.citations };
  if (!demo) setCache(CACHE_KEY, payload);
  return NextResponse.json(payload);
}

