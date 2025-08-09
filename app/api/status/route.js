import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";
import { XAI_MODEL, USE_XAI, USE_XAI_LIVE_SEARCH, XAI_SEARCH_MODE, XAI_SOURCES, XAI_MAX_SEARCH_RESULTS } from "../../../lib/xai.js";

export const revalidate = 0;

export async function GET() {
  const { posts, meta } = await fetchPosts({ demo: false });
  const status = {
    reddit: { ok: !!meta?.reddit?.ok, count: meta?.reddit?.count || 0 },
    news: { ok: !!meta?.news?.ok, count: meta?.news?.count || 0 },
    xai: { ok: !!process.env.XAI_API_KEY && USE_XAI, model: XAI_MODEL },
    liveSearch: {
      enabled: !!USE_XAI_LIVE_SEARCH,
      mode: XAI_SEARCH_MODE,
      sources: XAI_SOURCES,
      max: XAI_MAX_SEARCH_RESULTS,
    },
    cache: { postsTTL: 60, priceTTL: 60 },
    totalPosts: posts.length,
  };
  const res = NextResponse.json(status);
  res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=60");
  return res;
}





