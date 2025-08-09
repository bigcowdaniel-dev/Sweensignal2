# SweenSignal

Live Sydney Sweeney chatter mapped to AEO / LEVI / ULTA / VSCO sentiment. Next.js App Router + Tailwind + SWR + Recharts. xAI classifier with optional Live Search and VADER fallback.

## Setup

1. Install dependencies

```bash
npm i
```

2. Add environment variables in `.env.local` (see Env Vars below).

3. Run dev server

```bash
npm run dev
```

Visit http://localhost:3000

## Env Vars

- XAI_API_KEY (required for xAI features)
- XAI_MODEL (default: grok-3-mini)
- USE_XAI (default true)
- USE_VADER (default true)

Live Search toggles:
- USE_XAI_LIVE_SEARCH (default false)
- XAI_SEARCH_MODE (on | auto | off; default on)
- XAI_MAX_SEARCH_RESULTS (default 10)
- XAI_FROM_DAYS (default 30)
- XAI_SOURCES (comma list; default web,news) — allowed: web,x,news,rss

Client-only:
- NEXT_PUBLIC_STICKY_LINK_URL (optional absolute URL for “Open Live” button)

## Data sources

- Reddit search API (polite UA)
- Google News RSS via rss-parser
- Prices: Stooq daily CSV (AEO, LEVI, ULTA, VSCO)

## API

- GET /api/status
- GET /api/posts (?demo=1 for seeds)
- POST /api/classify
- GET /api/sentiment
- GET /api/price/:ticker

## Caching

- posts and prices: 60s (module-scope map) + Cache-Control: s-maxage=60, stale-while-revalidate=60
- sentiment: 120s (to avoid repeated xAI Live Search costs)

## Deploy (Vercel)

1. Push to GitHub
2. Import to Vercel, set Env Vars
3. Build and deploy

Recommended: set `NEXT_PUBLIC_STICKY_LINK_URL` to a canonical URL (e.g., production deployment) for the sticky “Open Live” button.

## Limits

- Reddit unauth search can rate-limit; seeds are used when empty or `?demo=1`
- Stooq: daily series only
- xAI Live Search can incur token costs; cap via XAI_MAX_SEARCH_RESULTS and caching

## Privacy

All fetches are server-side. No cookies, auth, or accounts.

## License

MIT






