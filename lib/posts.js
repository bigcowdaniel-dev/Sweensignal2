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

// Helpers to spread demo posts across multiple days
const DAY = 864e5;
function tsDaysAgo(days = 0, mins = 0) {
  return Date.now() - days * DAY - mins * 60_000;
}

/**
 * DEMO SEEDS — 50 realistic tweet-style items
 * All are Sydney Sweeney–related and finance-adjacent.
 * ~38 mention $AEO, ~12 mention $LEVI. Timestamps spread over 10 days.
 */
const SEEDS = [
  // ---- $AEO (Sydney Sweeney tie-ins) ----
  { id: 'tw-0001', ts: tsDaysAgo(0, 5),   text: 'Sydney Sweeney wearing Aerie basics in a new candid — my feed exploded. If that sticks, $AEO gets the halo.', url: 'https://x.com/user/status/91000001' },
  { id: 'tw-0002', ts: tsDaysAgo(0, 18),  text: 'Seeing TikToks stitching Sydney Sweeney’s Aerie look with “back to school” hauls. Organic push is huge for $AEO.', url: 'https://x.com/user/status/91000002' },
  { id: 'tw-0003', ts: tsDaysAgo(0, 35),  text: 'Sydney Sweeney reposted a creator styling Aerie sweats. Mentions for American Eagle jumped on my tracker. $AEO', url: 'https://x.com/user/status/91000003' },
  { id: 'tw-0004', ts: tsDaysAgo(0, 52),  text: 'Aerie site banner quietly features Sydney again. If clickthroughs pop, QTD comps could surprise. $AEO', url: 'https://x.com/user/status/91000004' },
  { id: 'tw-0005', ts: tsDaysAgo(0, 70),  text: 'Sydney Sweeney IG story tagged Aerie leggings. Conversion engine engaged. Watching $AEO sentiment bump.', url: 'https://x.com/user/status/91000005' },
  { id: 'tw-0006', ts: tsDaysAgo(0, 95),  text: 'Campus fit checks copying Sydney’s Aerie colorway. Small thing, but it moves units. $AEO', url: 'https://x.com/user/status/91000006' },
  { id: 'tw-0007', ts: tsDaysAgo(1, 12),  text: 'Sydney Sweeney paparazzi set: AE bag in hand. Not an ad, but the image is everywhere. $AEO momentum read.', url: 'https://x.com/user/status/91000007' },
  { id: 'tw-0008', ts: tsDaysAgo(1, 28),  text: 'Influencer caption: “Sydney made me buy it” (Aerie bra). That line converts, period. $AEO', url: 'https://x.com/user/status/91000008' },
  { id: 'tw-0009', ts: tsDaysAgo(1, 46),  text: 'Sydney Sweeney fan accounts compiling her “airport fits” — two AE pieces spotted. Brand heat = $AEO tailwind.', url: 'https://x.com/user/status/91000009' },
  { id: 'tw-0010', ts: tsDaysAgo(1, 63),  text: 'Retail walk-through: Aerie front table mirrors Sydney’s palette from last week. Smart merchandising. $AEO', url: 'https://x.com/user/status/91000010' },
  { id: 'tw-0011', ts: tsDaysAgo(1, 82),  text: 'Sydney Sweeney press clip used AE denim shorts b-roll. If syndication keeps running, it’s free GRPs for $AEO.', url: 'https://x.com/user/status/91000011' },
  { id: 'tw-0012', ts: tsDaysAgo(2, 10),  text: 'Aerie creator program pushing “Sydney set” bundles. Basket size goes up when you name the look. $AEO', url: 'https://x.com/user/status/91000012' },
  { id: 'tw-0013', ts: tsDaysAgo(2, 30),  text: 'Sydney Sweeney street style roundup: AE joggers in 3/10 pics. Not scientific, but that’s reach. $AEO', url: 'https://x.com/user/status/91000013' },
  { id: 'tw-0014', ts: tsDaysAgo(2, 55),  text: 'Saw “Get Sydney’s Aerie fit” SEO headlines this morning. When media writes the funnel for you… $AEO', url: 'https://x.com/user/status/91000014' },
  { id: 'tw-0015', ts: tsDaysAgo(2, 95),  text: 'Aerie PDP reviews calling out “Sydney look” specifically. UGC that sells. $AEO', url: 'https://x.com/user/status/91000015' },
  { id: 'tw-0016', ts: tsDaysAgo(3, 14),  text: 'Sydney Sweeney fan cam at a game caught AE hoodie. Clip has 2M views already. Watch weekly mentions for $AEO.', url: 'https://x.com/user/status/91000016' },
  { id: 'tw-0017', ts: tsDaysAgo(3, 36),  text: 'Micro-influencers stitching Sydney’s Aerie loungewear → “budget friendly dupe” angle. Volume move for $AEO.', url: 'https://x.com/user/status/91000017' },
  { id: 'tw-0018', ts: tsDaysAgo(3, 58),  text: 'Sydney content + Aerie discount code combos all over TikTok shop today. That’s a recipe. $AEO', url: 'https://x.com/user/status/91000018' },
  { id: 'tw-0019', ts: tsDaysAgo(3, 79),  text: 'AE checkout flow now suggests “Sydney’s picks.” Smart attach rate tactic. $AEO', url: 'https://x.com/user/status/91000019' },
  { id: 'tw-0020', ts: tsDaysAgo(4, 8),   text: 'Street photo drop: Sydney in an AE crewneck + sneakers. Simple, copyable, high-repeat look. $AEO', url: 'https://x.com/user/status/91000020' },
  { id: 'tw-0021', ts: tsDaysAgo(4, 31),  text: 'Sydney Sweeney late-night talk clip showed Aerie tote in greenroom. Product seeded perfectly. $AEO', url: 'https://x.com/user/status/91000021' },
  { id: 'tw-0022', ts: tsDaysAgo(4, 54),  text: '“Get ready with me: Sydney edition” using AE denim. Tutorial tags $AEO and it’s trending on my For You.', url: 'https://x.com/user/status/91000022' },
  { id: 'tw-0023', ts: tsDaysAgo(4, 77),  text: 'Aerie email subject line name-checking Sydney performed +3pp over last week per my inbox tracker. $AEO', url: 'https://x.com/user/status/91000023' },
  { id: 'tw-0024', ts: tsDaysAgo(5, 12),  text: 'Sydney Sweeney film festival snaps with AE tank layered under blazer. Easy “steal this look.” $AEO', url: 'https://x.com/user/status/91000024' },
  { id: 'tw-0025', ts: tsDaysAgo(5, 40),  text: 'Mall check: teens asking associates for “the Sydney leggings.” That’s a branded SKU in the wild. $AEO', url: 'https://x.com/user/status/91000025' },
  { id: 'tw-0026', ts: tsDaysAgo(5, 68),  text: 'Sydney’s stylist tagged Aerie in credits. Tiny caption, giant impact when the mood board travels. $AEO', url: 'https://x.com/user/status/91000026' },
  { id: 'tw-0027', ts: tsDaysAgo(5, 96),  text: 'Scrolling IG: “Sydney airport fit under $80” reels from five creators. Low AOV, high frequency. $AEO', url: 'https://x.com/user/status/91000027' },
  { id: 'tw-0028', ts: tsDaysAgo(6, 18),  text: 'AE homepage carousel leans into Sydney’s palette again. They’re riding what’s working. $AEO', url: 'https://x.com/user/status/91000028' },
  { id: 'tw-0029', ts: tsDaysAgo(6, 44),  text: 'Sydney Sweeney Q&A clip with a quick Aerie mention is running in paid slots now. That’s the conversion push. $AEO', url: 'https://x.com/user/status/91000029' },
  { id: 'tw-0030', ts: tsDaysAgo(6, 71),  text: 'Creator live shopping: “Sydney edit” sold out midstream, restock ETA this weekend. $AEO', url: 'https://x.com/user/status/91000030' },
  { id: 'tw-0031', ts: tsDaysAgo(6, 98),  text: 'Sydney Sweeney fan subreddit pinned an Aerie dupes thread. That’s durable demand energy. $AEO', url: 'https://x.com/user/status/91000031' },
  { id: 'tw-0032', ts: tsDaysAgo(7, 20),  text: 'Press wire used Sydney stills with Aerie credits. Syndication = free brand air cover. $AEO', url: 'https://x.com/user/status/91000032' },
  { id: 'tw-0033', ts: tsDaysAgo(7, 47),  text: 'Aerie store windows swapped to a Sydney-themed color story overnight. Cohesive execution. $AEO', url: 'https://x.com/user/status/91000033' },
  { id: 'tw-0034', ts: tsDaysAgo(7, 75),  text: '“Sydney set” tag now shows up in search suggestions on the Aerie site. Intent capture 101. $AEO', url: 'https://x.com/user/status/91000034' },
  { id: 'tw-0035', ts: tsDaysAgo(7, 104), text: 'Sydney Sweeney TikTok duet with a small creator wearing AE joggers. That’s how you scale reach. $AEO', url: 'https://x.com/user/status/91000035' },
  { id: 'tw-0036', ts: tsDaysAgo(8, 16),  text: 'Retail podcasts are literally calling it the “Sweeney effect” for Aerie. Narrative helps multiple. $AEO', url: 'https://x.com/user/status/91000036' },
  { id: 'tw-0037', ts: tsDaysAgo(8, 42),  text: 'Sydney’s stylist confirmed AE denim in a look breakdown video. Authenticity sells. $AEO', url: 'https://x.com/user/status/91000037' },
  { id: 'tw-0038', ts: tsDaysAgo(8, 69),  text: 'Aerie collab rumors with Sydney surfacing again. Even whispers move mentions. $AEO', url: 'https://x.com/user/status/91000038' },
  { id: 'tw-0039', ts: tsDaysAgo(8, 97),  text: 'Sydney Sweeney gym paparazzi angle showed AE quarter-zip. Athleisure attach looks real. $AEO', url: 'https://x.com/user/status/91000039' },
  { id: 'tw-0040', ts: tsDaysAgo(9, 22),  text: 'Sydney fan edit with Aerie logos hit 1M views this morning. Low-cost awareness is undefeated. $AEO', url: 'https://x.com/user/status/91000040' },
  { id: 'tw-0041', ts: tsDaysAgo(9, 50),  text: 'Shopper told me she “came in for the Sydney hoodie.” Direct response at work. $AEO', url: 'https://x.com/user/status/91000041' },
  { id: 'tw-0042', ts: tsDaysAgo(9, 78),  text: 'AE discount code “SYD” trending on honey extensions today. If true, watch conversion. $AEO', url: 'https://x.com/user/status/91000042' },
  { id: 'tw-0043', ts: tsDaysAgo(9, 106), text: 'Campus street shots: multiple students recreating Sydney’s Aerie outfit head-to-toe. That’s trend adoption. $AEO', url: 'https://x.com/user/status/91000043' },
  { id: 'tw-0044', ts: tsDaysAgo(9, 134), text: 'Sydney Sweeney tagged by a magazine wearing AE tee under a blazer — “smart casual” that travels. $AEO', url: 'https://x.com/user/status/91000044' },
  { id: 'tw-0045', ts: tsDaysAgo(9, 162), text: 'Two AE stores near me said “Sydney edit” sizes went first this weekend. Real demand. $AEO', url: 'https://x.com/user/status/91000045' },
  { id: 'tw-0046', ts: tsDaysAgo(9, 190), text: 'Sydney’s stylist IG Q&A: hinted “cozy Aerie drop soon.” If that hits, mentions spike. $AEO', url: 'https://x.com/user/status/91000046' },

  // ---- $LEVI (Sydney Sweeney tie-ins) ----
  { id: 'tw-0047', ts: tsDaysAgo(1, 22),  text: 'Sydney Sweeney shot in vintage 501s on a coffee run. When that look trends, Levi’s wins. $LEVI', url: 'https://x.com/user/status/91000047' },
  { id: 'tw-0048', ts: tsDaysAgo(3, 25),  text: 'Editorial called Sydney’s jeans “classic 501 energy.” That line alone sells denim. $LEVI', url: 'https://x.com/user/status/91000048' },
  { id: 'tw-0049', ts: tsDaysAgo(4, 88),  text: 'Street style carousel: Sydney in light-wash Levi’s with a white tee — the template returns. $LEVI', url: 'https://x.com/user/status/91000049' },
  { id: 'tw-0050', ts: tsDaysAgo(5, 155), text: 'Sydney Sweeney behind-the-scenes clip in Levi’s shorts. Summer capsule could see a bump. $LEVI', url: 'https://x.com/user/status/91000050' },
  { id: 'tw-0051', ts: tsDaysAgo(6, 32),  text: 'Menswear pod said “Sydney brought back straight-leg denim.” If consumers internalize that, 501s ride. $LEVI', url: 'https://x.com/user/status/91000051' },
  { id: 'tw-0052', ts: tsDaysAgo(6, 120), text: 'Sydney fan edit: “get the Levi’s look for less” is still Levi’s, just a different wash. Either way, the brand wins. $LEVI', url: 'https://x.com/user/status/91000052' },
  { id: 'tw-0053', ts: tsDaysAgo(7, 58),  text: 'Sydney’s off-duty Levi’s + slingback combo making rounds on Pinterest boards again. Slow-burn demand. $LEVI', url: 'https://x.com/user/status/91000053' },
  { id: 'tw-0054', ts: tsDaysAgo(7, 126), text: 'I keep seeing “Sydney 501 inspo” in thrift hauls and new retail in the same clip. Rising tide effect. $LEVI', url: 'https://x.com/user/status/91000054' },
  { id: 'tw-0055', ts: tsDaysAgo(8, 64),  text: 'Magazine slideshow tagged Sydney’s jeans as Levi’s twice this week. Repetition is free advertising. $LEVI', url: 'https://x.com/user/status/91000055' },
  { id: 'tw-0056', ts: tsDaysAgo(8, 140), text: 'Tailoring TikToks showing “Sydney’s hem” on 501s. When alteration trends, core product moves. $LEVI', url: 'https://x.com/user/status/91000056' },
  { id: 'tw-0057', ts: tsDaysAgo(9, 72),  text: 'Levi’s store mannequin just swapped to a Sydney-style tee + denim combo. That’s a fast react. $LEVI', url: 'https://x.com/user/status/91000057' },
  { id: 'tw-0058', ts: tsDaysAgo(9, 148), text: 'Sydney Sweeney fan page posted a Levi’s fit grid and it’s getting serious engagement. $LEVI', url: 'https://x.com/user/status/91000058' },
];

/** Live search via xAI (unchanged; used when DATA_MODE === 'live') */
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

  // DEMO path (zero spend)
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
