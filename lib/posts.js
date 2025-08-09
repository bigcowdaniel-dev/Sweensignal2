// lib/posts.js
import { extractTickersFromText } from './extractTickers.js';

/**
 * Uses xAI Live Search (sources: "x") to fetch recent X posts,
 * then normalizes to your feed shape.
 *
 * Env required:
 *  - XAI_API_KEY   (from https://console.x.ai)
 * Optional:
 *  - XAI_MODEL     (default: "grok-4")
 */
const XAI_KEY = process.env.XAI_API_KEY || '';
const XAI_MODEL = process.env.XAI_MODEL || 'grok-4';

const DEFAULT_QUERY =
  'Sydney Sweeney finance stocks ($AEO OR $LEVI OR $ULTA OR VSCO OR Aerie OR Levi OR Ulta OR "Victoria\'s Secret")';

/** Demo fallback in case key is missing or API errors */
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

/** Call xAI Chat Completions with Live Search turned ON and source 'x' */
async function fetchFromXAI({ query = DEFAULT_QUERY, days = 7, max = 20 } = {}) {
  if (!XAI_KEY) return [];

  const fromDate = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);

  const body = {
    model: XAI_MODEL,
    // Ask Grok to return strictly-typed JSON we can parse
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a JSON API. Return ONLY a JSON object with this schema: ' +
          '{ "posts": [ { "id": string, "ts": string, "url": string, "text": string } ] }. ' +
          'Use Live Search on X to find recent posts about Sydney Sweeney with finance/cashtag context. ' +
          'For "ts", return ISO8601 UTC. Keep "text" ≤ 240 chars, no emojis, no line breaks.'
      },
      {
        role: 'user',
        content:
          `Query: ${query}\n` +
          'Find posts that include stock tickers/cashtags when possible. Deduplicate near-identical items.'
      }
    ],
    // <-- This enables Live Search and limits it to X posts
    search_parameters: {
      mode: 'on',
      return_citations: true,
      from_date: fromDate,
      max_search_results: Math.min(Math.max(max, 5), 50),
      sources: [
        {
          type: 'x',
          // simple quality filter so we don’t get zero-like spam
          post_favorite_count: 1
        }
      ]
    }
  };

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${XAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    // no-store so the homepage always feels fresh
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
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error('[xAI Live Search] JSON parse error', e);
    return [];
  }

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

/** Normalize to the shape your app expects, with ticker extraction */
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

export async function fetchPosts({ demo = false } = {}) {
  try {
    let arr = [];
    if (!demo) {
      arr = await fetchFromXAI({});
    }
    const use = (arr && arr.length ? arr : SEEDS);
    return { posts: use.map(normalize) };
  } catch (e) {
    console.error('fetchPosts error', e);
    return { posts: SEEDS.map(normalize) };
  }
}
