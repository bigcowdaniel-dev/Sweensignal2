import { NextResponse } from "next/server";
import { classifyWithXAI } from "../../../lib/classifyWithXAI.js";

export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const out = await classifyWithXAI(items);
    const res = NextResponse.json({ items: out?.items ?? [], citations: out?.citations });
    res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=60");
    return res;
  } catch {
    return NextResponse.json({ items: [] }, { status: 400 });
  }
}





