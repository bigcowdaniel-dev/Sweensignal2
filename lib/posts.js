// lib/posts.js
import { extractTickersFromText } from './extractTickers.js';

/**
 * DATA MODE (cost kill-switch)
 * - Set on the SERVER (Vercel → Settings → Environment Variables)
 * - DATA_MODE = "demo"  → never call xAI (uses seeds only)
 * - DATA_MODE = "live"  → call xAI (normal behavior)
 * - If unset, defaults to "live"
 *
 * Tip: You can keep NEXT_PUBLIC_FORCE_DEMO=1 just to show the pink "Demo mode"
 * pill in the UI, but DATA_MODE=demo is what actually saves money.
 */
const DATA_MODE = (process.env.DATA_MODE || 'live').toLowerCase(); // 'live' | 'demo'

// xAI config (used only when DATA_MODE === 'live')
const XAI_KEY = process.env.XAI_API_KEY || '';
const XAI_MODEL = process.env.XAI_MODEL || 'grok-4';

const DEFAULT_QUERY =
  'Sydney Sweeney finance stocks ($AEO OR $LEVI OR $ULTA OR VSCO OR Aerie OR Levi OR Ulta OR "Victoria\'s Secret")';

/** Demo fallback seeds */
const SEEDS = [
  {
    id: 'seed-1',
    ts: Date.now() - 1000 * 60 * 60 * 24 * 1,
    text:
      "Sydney Sweeney spotted in new Aerie drop; American Eagle fans say $AEO could benefit if the campaign trends.",
    url: "https://ae.com"
  },
  {
    id: 'seed-2',
    ts: Date.now() - 1000 * 60 * 60 * 24 * 2,
    text:
      "Press tour buzz overlaps with Levi’s styling notes — denim subs debating fits and whether LEVI gets the halo.",
    url: "https://levi.com"
  },
  {
    id: 'seed-3',
    ts: Date.now() - 1000 * 60 * 60 * 24 * 3,
    text:
      "Beauty threads linking Sweeney’s routine to Ulta picks; some traders tagging $ULTA on the move.",
    url: "https://ulta.com"
  }
];

/** Call xAI Live Search for X posts */
async function fetchFromXAI({ query = DEFAULT_QUERY, days = 7, max = 20 } = {}) {
  if (!XAI_KEY) return [];

  const fromDate = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);

  const body = {
    model: XAI_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a JSON API. Return ONLY a JSON object: ' +
          '{ "posts": [ { "id": string, "ts": string, "url": string, "text": string } ] }. ' +
          'Use Live Search on X to find recent posts about Sydney Sweeney with finance/cashtag context. ' +
          'For "ts", return ISO8601 UTC. Keep "text" <= 240 chars, no emojis, no line breaks.'
      },
      {
        role: 'user',
        content:
          `Query: ${query}\n` +
          'Find posts that include stock tickers/cashtags when possible. Deduplicate near-identical items.'
      }
    ],
    search_parameters: {
      mode: 'on',
      return_citations: true,
      from_date: fromDate,
      max_search_results: Math.min(Math.max(max, 5), 50),
      sources: [{ type: 'x', post_favorite_count: 1 }]
    }
  };

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${XAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  if (!res.ok) {
    console.error('[xAI Live Search] HTTP', res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return [];

  let parsed;
  try { parsed = JSON.parse(content); } catch { return []; }

  const raw = Array.isArray(parsed?.posts) ? parsed.posts : [];
  return raw
    .map(p => {
      const tsMs = Date.parse(p.ts || '') || Date.now();
      const url = p.url || '';
      const text = (p.text || '').trim();
      return {
        id: p.id || url || String(tsMs),
        ts: tsMs,
        text,
        url,
        source: 'x'
      };
    })
    .filter(p => p.url && p.text);
}

/** Normalize to feed shape + extract tickers */
function normalize(post) {
  const text = [post.title, post.text, post.body, post.caption].filter(Boolean).join(' ').trim();
  const tickers = extractTickersFromText(text);
  return {
    id: post.id || post.permalink || post.url || String(Math.random()).slice(2),
    text,
    url: post.url || post.link || post.permalink || null,
    ts: post.ts || post.created_at || Date.now(),
    tickers
  };
}

/**
 * Public function used by /api/posts and /api/sentiment.
 * - If DATA_MODE === 'demo' → always return seeds (NO external calls)
 * - Otherwise, use xAI Live Search (with safe fallback to seeds)
 * - `opts.demo` still works (e.g. /api/posts?demo=1), but the server flag wins.
 */
export async function fetchPosts(opts = {}) {
  const forcedDemo = DATA_MODE === 'demo';
  const askedDemo  = !!opts.demo;

  // If either is true → DEMO only (zero spend)
  if (forcedDemo || askedDemo) {
    return { posts: SEEDS.map(normalize) };
  }

  try {
    const live = await fetchFromXAI({});
    const arr = Array.isArray(live) && live.length ? live : SEEDS; // fallback
    return { posts: arr.map(normalize) };
  } catch (e) {
    console.error('fetchPosts error', e);
    return { posts: SEEDS.map(normalize) };
  }
}
