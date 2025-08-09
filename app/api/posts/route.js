import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";
import { extractTickersFromText } from "../../../lib/extractTickers.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** permissive boolean parser for query/env flags */
function truthy(v) {
  if (v == null) return false;
  const s = String(v).toLowerCase();
  return s === "" || s === "1" || s === "true" || s === "on" || s === "yes";
}

function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Prefer explicit .source, else derive from first citation/url host */
function withSource(item) {
  if (item?.source) return item;
  const firstCitationUrl =
    (Array.isArray(item?.citations) && item.citations.length
      ? (typeof item.citations[0] === "string"
          ? item.citations[0]
          : item.citations[0]?.url)
      : null) || item?.url;

  return {
    ...item,
    source: host(firstCitationUrl) || "news",
  };
}

/** Normalize citations to {url, host} objects; keep at most 10 unique */
function withNormalizedCitations(item) {
  const seen = new Set();
  const citations = [];

  const add = (u) => {
    const h = host(u);
    if (!u || seen.has(u)) return;
    seen.add(u);
    citations.push({ url: u, host: h });
  };

  // flatten any strings / objects we get
  (Array.isArray(item?.citations) ? item.citations : []).forEach((c) => {
    const u = typeof c === "string" ? c : c?.url;
    if (u) add(u);
  });

  if (item?.url) add(item.url);

  return { ...item, citations: citations.slice(0, 10) };
}

/** Ensure we always have .tickers (array) and a convenience .ticker (first) */
function withTickers(item) {
  const text = [
    item?.title,
    item?.text,
    item?.body,
    item?.caption,
  ].filter(Boolean).join(" ");

  let tickers = Array.isArray(item?.tickers) ? item.tickers : [];

  // If none were extracted upstream, attempt brand/$TICKER extraction here
  if (!tickers.length) {
    tickers = extractTickersFromText(text);
  }

  // De‑dupe + sanitize (1–5 uppercase letters)
  const clean = [...new Set(tickers)]
    .map((t) => String(t || "").toUpperCase().trim())
    .filter((t) => /^[A-Z]{1,5}$/.test(t));

  return { ...item, tickers: clean, ticker: clean[0] || null };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const demo = truthy(searchParams.get("demo"));

  // Fetch raw posts (respects DATA_MODE in lib/posts.js)
  let { posts } = await fetchPosts({ demo });

  // Normalize each post
  posts = (posts || [])
    .map(withNormalizedCitations)
    .map(withSource)
    .map(withTickers);

  // Do not cache so "demo" and "live" never get mixed in the CDN
  const res = NextResponse.json(posts);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
