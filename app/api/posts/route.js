// app/api/posts/route.js
import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";
import { normalizeCitations } from "../../../lib/citations.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function truthy(v) {
  if (v == null) return false;
  const s = String(v).toLowerCase();
  return s === "" || s === "1" || s === "true" || s === "on" || s === "yes";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const demo = truthy(searchParams.get("demo")); // middleware adds ?demo=1 when demo mode is active

  let { posts } = await fetchPosts({ demo });
  posts = (posts || []).map(normalizeCitations);

  const res = NextResponse.json(posts); // keep same shape your UI expects (array)
  res.headers.set("Cache-Control", "no-store"); // stop mixing demo/live via caching
  return res;
}
