import { NextRequest, NextResponse } from 'next/server';

// Optional global force flags (set in Vercel env)
const FORCE_DEMO =
  process.env.FORCE_DEMO === '1' ||
  process.env.NEXT_PUBLIC_FORCE_DEMO === '1';

// Helpers to parse boolean-ish query values
function isFalseyDemo(v: string | null): boolean {
  if (v == null) return false;
  const s = v.toLowerCase();
  return s === '0' || s === 'false' || s === 'off' || s === 'no';
}
function isTruthyDemo(v: string | null): boolean {
  if (v == null) return false;
  const s = v.toLowerCase();
  // treat bare ?demo as truthy, too (empty string)
  return s === '' || s === '1' || s === 'true' || s === 'on' || s === 'yes';
}

/**
 * Middleware goals:
 * 1) If site is visited with ?demo=1 (or FORCE_DEMO), persist as cookie (demo=1)
 * 2) If visited with ?demo=0/false/off/no, CLEAR the cookie
 * 3) For ALL /api/*, when demo is active, ensure demo=1 is on the URL
 * 4) Bust API caches via a short-lived timestamp (_t)
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const isApi = pathname.startsWith('/api/');

  const demoParam = url.searchParams.get('demo');
  const queryDemoOn = isTruthyDemo(demoParam);
  const queryDemoOff = isFalseyDemo(demoParam);
  const cookieHasDemo = req.cookies.get('demo')?.value === '1';

  // If the user explicitly asked to turn demo OFF, clear cookie and don't activate demo.
  if (queryDemoOff) {
    // Clean the URL of demo param for downstream handlers
    url.searchParams.delete('demo');

    if (isApi) {
      // For API calls, rewrite with cleaned URL and clear the cookie
      url.searchParams.set('_t', String(Math.floor(Date.now() / 1000)));
      const res = NextResponse.rewrite(url);
      res.cookies.set('demo', '', { path: '/', maxAge: 0 });
      return res;
    } else {
      // For page requests, just proceed and clear the cookie
      const res = NextResponse.next();
      res.cookies.set('demo', '', { path: '/', maxAge: 0 });
      return res;
    }
  }

  // Demo active only if not explicitly turned off
  const demoActive = !queryDemoOff && (FORCE_DEMO || queryDemoOn || cookieHasDemo);

  // For page requests: if demo is active, set a cookie so subsequent API calls inherit it.
  if (!isApi) {
    if (demoActive) {
      const res = NextResponse.next();
      res.cookies.set('demo', '1', { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7 days
      return res;
    }
    return NextResponse.next();
  }

  // For API calls: ensure demo=1 when active
  if (demoActive) {
    if (url.searchParams.get('demo') !== '1') {
      url.searchParams.set('demo', '1');
    }
  } else {
    // If not active, make sure we don't leak demo=1
    if (url.searchParams.get('demo') === '1') {
      url.searchParams.delete('demo');
    }
  }

  // Bust caches to avoid stale/mixed API results (1s granularity)
  url.searchParams.set('_t', String(Math.floor(Date.now() / 1000)));

  return NextResponse.rewrite(url);
}

// Run on everything except Next static assets and favicon
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
