// middleware.ts (root)
import { NextRequest, NextResponse } from 'next/server';

const FORCE_DEMO =
  process.env.FORCE_DEMO === '1' ||
  process.env.NEXT_PUBLIC_FORCE_DEMO === '1';

function isFalseyDemo(v: string | null) {
  if (v == null) return false;
  const s = v.toLowerCase();
  return s === '0' || s === 'false' || s === 'off' || s === 'no';
}
function isTruthyDemo(v: string | null) {
  if (v == null) return false;
  const s = v.toLowerCase();
  return s === '' || s === '1' || s === 'true' || s === 'on' || s === 'yes';
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isApi = url.pathname.startsWith('/api/');
  const demoParam = url.searchParams.get('demo');
  const queryDemoOn = isTruthyDemo(demoParam);
  const queryDemoOff = isFalseyDemo(demoParam);
  const cookieHasDemo = req.cookies.get('demo')?.value === '1';

  // Turn demo OFF explicitly
  if (queryDemoOff) {
    url.searchParams.delete('demo');
    const res = isApi ? NextResponse.rewrite(url) : NextResponse.next();
    res.cookies.set('demo', '', { path: '/', maxAge: 0 });
    return res;
  }

  const demoActive = !queryDemoOff && (FORCE_DEMO || queryDemoOn || cookieHasDemo);

  // For page requests: persist cookie when demo is active
  if (!isApi) {
    if (demoActive) {
      const res = NextResponse.next();
      res.cookies.set('demo', '1', { path: '/', maxAge: 60 * 60 * 24 * 7 });
      return res;
    }
    return NextResponse.next();
  }

  // For API calls: force demo=1 when active (keeps demo consistent across endpoints)
  if (demoActive) url.searchParams.set('demo', '1');
  else if (url.searchParams.get('demo') === '1') url.searchParams.delete('demo');

  // Add a short timestamp to avoid stale cache mixing
  url.searchParams.set('_t', String(Math.floor(Date.now() / 1000)));
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
