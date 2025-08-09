import { NextRequest, NextResponse } from 'next/server';

// Optional global force flags (set in Vercel env)
const FORCE_DEMO =
  process.env.FORCE_DEMO === '1' ||
  process.env.NEXT_PUBLIC_FORCE_DEMO === '1';

/**
 * Middleware goals:
 * 1) If the site is visited with ?demo=1 (or FORCE_DEMO), persist that as a cookie (demo=1)
 * 2) For ALL /api/* requests, if demo is active (cookie or force), ensure demo=1 is on the URL
 * 3) Bust API caches by appending a short-lived timestamp param (_t)
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const isApi = pathname.startsWith('/api/');

  const queryHasDemo = url.searchParams.get('demo') === '1' || url.searchParams.has('demo');
  const cookieHasDemo = req.cookies.get('demo')?.value === '1';
  const demoActive = FORCE_DEMO || queryHasDemo || cookieHasDemo;

  // For page requests: if demo is active, set a cookie so subsequent API calls inherit it.
  if (!isApi) {
    if (demoActive) {
      const res = NextResponse.next();
      // Persist for 7 days
      res.cookies.set('demo', '1', { path: '/', maxAge: 60 * 60 * 24 * 7 });
      return res;
    }
    return NextResponse.next();
  }

  // For API calls: ensure demo=1 when active
  if (demoActive && url.searchParams.get('demo') !== '1') {
    url.searchParams.set('demo', '1');
  }

  // Bust caches to avoid stale/mixed API results (1s granularity)
  url.searchParams.set('_t', String(Math.floor(Date.now() / 1000)));

  return NextResponse.rewrite(url);
}

// Run on everything except Next static assets and favicon
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
