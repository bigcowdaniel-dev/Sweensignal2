import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function truthy(v) {
  if (v == null) return false;
  const s = String(v).toLowerCase();
  return s === "" || s === "1" || s === "true" || s === "on" || s === "yes";
}
function host(u) { try { return new URL(u).hostname.replace(/^www\./,''); } catch { return "source"; } }
function normalizeCitations(post) {
  const out = [];
  const tryUrls = [post?.url, post?.link, post?.permalink];
  for (const u of tryUrls) {
    if (typeof u === "string" && /^https?:\/\//.test(u)) {
      out.push({ url: u, title: host(u), source: host(u) });
      break;
    }
  }
  if (Array.isArray(post?.citations)) {
    for (const c of post.citations) {
      const u = typeof c === "string" ? c : c?.url;
      if (u && /^https?:\/\//.test(u)) out.push({ url: u, title: host(u), source: host(u) });
    }
  }
  const seen = new Set();
  const deduped = out.filter(x => x?.url && !seen.has(x.url) && seen.add(x.url));
  return { ...post, citations: deduped };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const demo = truthy(searchParams.get("demo")); // middleware (if present) will set this

  let { posts } = await fetchPosts({ demo });
  posts = (posts || []).map(normalizeCitations);

  const res = NextResponse.json(posts);         // your UI expects an array
  res.headers.set("Cache-Control", "no-store"); // avoid demo/live mixing
  return res;
}


