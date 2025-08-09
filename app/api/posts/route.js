import { NextResponse } from "next/server";
import { fetchPosts } from "../../../lib/posts.js";

export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get("demo") === "1";
  const { posts } = await fetchPosts({ demo });
  const res = NextResponse.json(posts);
  res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=60");
  return res;
}





