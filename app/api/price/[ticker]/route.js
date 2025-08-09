import { NextResponse } from "next/server";
import { fetchDailyPrices } from "../../../../lib/prices.js";

export const revalidate = 0;

export async function GET(_req, { params }) {
  const ticker = (params?.ticker || "").toUpperCase();
  const data = await fetchDailyPrices(ticker);
  const res = NextResponse.json(data);
  res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=60");
  return res;
}





