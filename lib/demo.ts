import type { NextRequest } from 'next/server';

export const FORCED_DEMO =
  process.env.FORCE_DEMO === '1' ||
  process.env.NEXT_PUBLIC_FORCE_DEMO === '1';

/** Server-side: determine demo state from env, cookie, or query param. */
export function isDemoRequest(req: NextRequest): boolean {
  if (FORCED_DEMO) return true;
  const qp = req.nextUrl.searchParams;
  if (qp.get('demo') === '1' || qp.has('demo')) return true;
  return req.cookies.get('demo')?.value === '1';
}

/** Utility to append demo=1 to a URL string if demo is active. */
export function withDemoParam(url: URL, demo: boolean): URL {
  if (demo) url.searchParams.set('demo', '1');
  return url;
}
