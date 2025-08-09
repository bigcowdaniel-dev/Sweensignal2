import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function truthy(v) {
  if (v == null) return false;
  const s = String(v).toLowerCase();
  return s === "" || s === "1" || s === "true" || s === "on" || s === "yes";
}

function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

/**
 * Preserve the original post (including `tickers`) and
 * append `citations` plus a convenience `ticker` = first item.
 */
function normalizeCitations(post = {}) {
  const citations = [];
  const tryUrls = [post?.url, post?.link, post?.permalink].filter(Boolean);
  for (const u of tryUrls) {
    citations.push({ title: host(u), url: u });
  }

  // Ensure tickers are an uppercase unique array
  const tickers = Array.isArray(post?.tickers)
    ? [...new Set(post.tickers.map((t) => String(t).toUpperCase()))]
    : [];

  const ticker = post?.ticker || tickers[0] || null;

  return {
    ...post,
    tickers,
    ticker,
    citations,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const demo = truthy(searchParams.get("demo"));

  let { posts } = await fetchPosts({ demo });
  posts = (posts || []).map(normalizeCitations);

  const res = NextResponse.json(posts);
  res.headers.set("Cache-Control", "no-store"); // avoid demo/live mixing
  return res;
}
