import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";
import { classifyWithXAI } from "../../../lib/classifyWithXAI.js";
import { USE_VADER } from "../../../lib/xai.js";
import { vaderScore, labelFromCompound, isStrongPositive } from "../../../lib/sentiment.js";
import { mapTicker } from "../../../lib/mapTicker.js";
import { getCache, setCache } from "../../../lib/cache.js";

export const revalidate = 0;

function computeStrength(positives, negatives) {
  const net = positives - negatives;
  const score = net * 25 + positives * 10;
  const strength = Math.max(0, Math.min(100, Math.round(score)));
  return strength;
}

export async function GET(request) {
  const cacheKey = "sentiment:v1";
  const cached = getCache(cacheKey, 120 * 1000);
  if (cached) {
    const res = NextResponse.json(cached);
    res.headers.set("Cache-Control", "s-maxage=120, stale-while-revalidate=120");
    return res;
  }

  const { posts } = await fetchPosts({ demo: false });
  const items = posts.map((p) => ({ id: p.id, text: p.text }));

  let out = null;
  try {
    out = await classifyWithXAI(items);
  } catch {}

  const idToLabel = new Map();
  if (out?.items?.length) {
    for (const it of out.items) {
      if (!it?.id) continue;
      idToLabel.set(it.id, it);
    }
  }

  const enriched = posts.map((p) => {
    const label = idToLabel.get(p.id);
    if (label && typeof label.score === "number" && label.sentiment) {
      return { ...p, score: label.score, sentiment: label.sentiment, ticker: label.ticker ?? null };
    }
    if (USE_VADER) {
      const compound = vaderScore(p.text);
      const sentiment = labelFromCompound(compound);
      const ticker = mapTicker(p.text);
      return { ...p, score: compound, sentiment, ticker };
    }
    return p;
  });

  const tickers = ["AEO", "LEVI", "ULTA", "VSCO"];
  const summaries = {};
  for (const t of tickers) {
    summaries[t] = {
      ticker: t,
      total: 0,
      counts: { positive: 0, neutral: 0, negative: 0 },
      lastStrongPositive: null,
      strength: 0,
    };
  }

  for (const p of enriched) {
    const t = p.ticker;
    if (!t || !summaries[t]) continue;
    const s = summaries[t];
    s.total += 1;
    if (p.sentiment === "positive") s.counts.positive += 1;
    else if (p.sentiment === "negative") s.counts.negative += 1;
    else s.counts.neutral += 1;
    if (typeof p.score === "number" && isStrongPositive(p.score)) {
      if (!s.lastStrongPositive || p.createdAt > s.lastStrongPositive) s.lastStrongPositive = p.createdAt;
    }
  }

  for (const t of tickers) {
    const s = summaries[t];
    s.strength = computeStrength(s.counts.positive, s.counts.negative);
  }

  const payload = { summaries, citations: out?.citations };
  setCache(cacheKey, payload);

  const res = NextResponse.json(payload);
  res.headers.set("Cache-Control", "s-maxage=120, stale-while-revalidate=120");
  return res;
}





