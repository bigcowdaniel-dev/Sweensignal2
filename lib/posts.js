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

/** Demo fallback seeds (50 realistic tweet-style items; ~75% AEO, ~25% LEVI) */
const SEEDS = [
  // ---------- AEO HEAVY ----------
  { id: 'tw-0001', ts: Date.now() - 1000 * 60 * 3,  text: 'Back-to-school racks at American Eagle were picked clean at my mall. Traffic looked strong. $AEO', url: 'https://x.com/user/status/90000001' },
  { id: 'tw-0002', ts: Date.now() - 1000 * 60 * 5,  text: 'Watching $AEO into next week. Inventory looks tighter than last fall and promos aren’t crazy. Could support margins.', url: 'https://x.com/user/status/90000002' },
  { id: 'tw-0003', ts: Date.now() - 1000 * 60 * 7,  text: 'Aerie seamless leggings are everywhere on campus again. If this sticks, $AEO comps might surprise.', url: 'https://x.com/user/status/90000003' },
  { id: 'tw-0004', ts: Date.now() - 1000 * 60 * 9,  text: 'Channel checks: AE jeans table constantly restocked today. Associates said “it’s been like this all week.” $AEO', url: 'https://x.com/user/status/90000004' },
  { id: 'tw-0005', ts: Date.now() - 1000 * 60 * 11, text: 'Digital ads: seeing American Eagle carousel across IG/TikTok with strong creative. Feels like a coordinated push. $AEO', url: 'https://x.com/user/status/90000005' },
  { id: 'tw-0006', ts: Date.now() - 1000 * 60 * 13, text: 'If $AEO holds gross margin flat with lighter promos vs LY, the multiple has room. Watching guidance language closely.', url: 'https://x.com/user/status/90000006' },
  { id: 'tw-0007', ts: Date.now() - 1000 * 60 * 15, text: 'Not investment advice, but I walked out of American Eagle with two pairs I didn’t plan to buy. Conversion thesis. $AEO', url: 'https://x.com/user/status/90000007' },
  { id: 'tw-0008', ts: Date.now() - 1000 * 60 * 17, text: 'Aerie store had a line for fitting rooms at 6pm. Associates said new arrivals dropped this week. $AEO', url: 'https://x.com/user/status/90000008' },
  { id: 'tw-0009', ts: Date.now() - 1000 * 60 * 19, text: 'Seeing fewer blanket 40% off banners at AE compared to last year. Cleaner pricing = healthier read. $AEO', url: 'https://x.com/user/status/90000009' },
  { id: 'tw-0010', ts: Date.now() - 1000 * 60 * 21, text: 'If denim cycle really is turning up again, American Eagle is leveraged to that trend. $AEO', url: 'https://x.com/user/status/90000010' },
  { id: 'tw-0011', ts: Date.now() - 1000 * 60 * 25, text: 'Watch loyalty signups. AE app installs trending in the Top Charts again this weekend. $AEO', url: 'https://x.com/user/status/90000011' },
  { id: 'tw-0012', ts: Date.now() - 1000 * 60 * 28, text: 'Aerie intimates sell-through looked fast based on size gaps. Could be a quiet driver for $AEO this quarter.', url: 'https://x.com/user/status/90000012' },
  { id: 'tw-0013', ts: Date.now() - 1000 * 60 * 31, text: 'Crowdsourced: friends in retail say AE floor sets landed on time this season. Less freight noise. $AEO', url: 'https://x.com/user/status/90000013' },
  { id: 'tw-0014', ts: Date.now() - 1000 * 60 * 34, text: 'Foot traffic heatmap for my area shows AE outperforming most specialty peers today. Anecdote, but notable. $AEO', url: 'https://x.com/user/status/90000014' },
  { id: 'tw-0015', ts: Date.now() - 1000 * 60 * 38, text: 'If $AEO touches last quarter’s high on volume into print, I’ll trim a bit. Risk manage the move.', url: 'https://x.com/user/status/90000015' },
  { id: 'tw-0016', ts: Date.now() - 1000 * 60 * 42, text: 'Aerie’s site UX is quick today. No lag, fast PDP loads. Conversion tailwind when the funnel is smooth. $AEO', url: 'https://x.com/user/status/90000016' },
  { id: 'tw-0017', ts: Date.now() - 1000 * 60 * 46, text: 'AE denim fits got a minor tweak this season. Waist feels more consistent. Small product wins matter. $AEO', url: 'https://x.com/user/status/90000017' },
  { id: 'tw-0018', ts: Date.now() - 1000 * 60 * 50, text: 'Store associate said returns are lower on the new jean cut. That flows through to less markdown risk. $AEO', url: 'https://x.com/user/status/90000018' },
  { id: 'tw-0019', ts: Date.now() - 1000 * 60 * 55, text: 'American Eagle gift card rack cleaned out at Target by mid-day. Seasonal tell? $AEO', url: 'https://x.com/user/status/90000019' },
  { id: 'tw-0020', ts: Date.now() - 1000 * 60 * 60, text: 'Seeing UGC try-on hauls tag $AEO again. If that flywheel spins, awareness spikes without heavy spend.', url: 'https://x.com/user/status/90000020' },
  { id: 'tw-0021', ts: Date.now() - 1000 * 60 * 66, text: 'My AE order shipped next-day. Logistics feel tight. Less WISMO means happier customers and better repeat. $AEO', url: 'https://x.com/user/status/90000021' },
  { id: 'tw-0022', ts: Date.now() - 1000 * 60 * 72, text: '$AEO weekly looks constructive. Higher lows since spring and basing under resistance.', url: 'https://x.com/user/status/90000022' },
  { id: 'tw-0023', ts: Date.now() - 1000 * 60 * 78, text: 'If comps print positive and they guide cautiously, setup for a multi-day move is there. $AEO', url: 'https://x.com/user/status/90000023' },
  { id: 'tw-0024', ts: Date.now() - 1000 * 60 * 84, text: 'Associate at Aerie said “soft launch” of new lounge set hit this week. Looks like early demand. $AEO', url: 'https://x.com/user/status/90000024' },
  { id: 'tw-0025', ts: Date.now() - 1000 * 60 * 90, text: 'Less red-sticker chaos at AE vs last year. Cleaner floors usually mean better margin discipline. $AEO', url: 'https://x.com/user/status/90000025' },
  { id: 'tw-0026', ts: Date.now() - 1000 * 60 * 99, text: 'Aerie is quietly a powerhouse. If intimates hold share, the multiple on $AEO should reflect the mix shift.', url: 'https://x.com/user/status/90000026' },
  { id: 'tw-0027', ts: Date.now() - 1000 * 60 * 108, text: 'AE at checkout pushed BOPIS hard. Omnichannel attach like that helps speed and reduces shipping cost. $AEO', url: 'https://x.com/user/status/90000027' },
  { id: 'tw-0028', ts: Date.now() - 1000 * 60 * 120, text: 'Mentions of $AEO spiking on my feed since yesterday’s capsule drop. Could be a sentiment tell.', url: 'https://x.com/user/status/90000028' },
  { id: 'tw-0029', ts: Date.now() - 1000 * 60 * 135, text: 'American Eagle denim wall reset looks premium. If units per transaction lift, that flows to the bottom line. $AEO', url: 'https://x.com/user/status/90000029' },
  { id: 'tw-0030', ts: Date.now() - 1000 * 60 * 150, text: 'Short interest on $AEO is not crazy, but a clean beat can still squeeze a bit. Watching borrow rates.', url: 'https://x.com/user/status/90000030' },
  { id: 'tw-0031', ts: Date.now() - 1000 * 60 * 170, text: 'Aerie fitting is consistent across sizes in this drop. That usually means fewer returns. $AEO', url: 'https://x.com/user/status/90000031' },
  { id: 'tw-0032', ts: Date.now() - 1000 * 60 * 190, text: 'Regional check: suburban centers seeing more AE bags than last month. Macro is messy, but demand is there. $AEO', url: 'https://x.com/user/status/90000032' },
  { id: 'tw-0033', ts: Date.now() - 1000 * 60 * 210, text: 'App push notifications felt smarter today—surfaced my saved items on sale, not random stuff. $AEO', url: 'https://x.com/user/status/90000033' },
  { id: 'tw-0034', ts: Date.now() - 1000 * 60 * 240, text: 'If AE guides to controlled inventory and healthy full-price mix, model gets cleaner. $AEO', url: 'https://x.com/user/status/90000034' },
  { id: 'tw-0035', ts: Date.now() - 1000 * 60 * 270, text: 'Seeing more men’s denim content from AE creators. Category expansion could matter by holiday. $AEO', url: 'https://x.com/user/status/90000035' },
  { id: 'tw-0036', ts: Date.now() - 1000 * 60 * 300, text: 'My take: $AEO doesn’t need blowout comps, just stable margins and believable H2 commentary.', url: 'https://x.com/user/status/90000036' },
  { id: 'tw-0037', ts: Date.now() - 1000 * 60 * 330, text: 'Local AE was hiring part-time again. Staffing normalizing into fall. $AEO', url: 'https://x.com/user/status/90000037' },
  { id: 'tw-0038', ts: Date.now() - 1000 * 60 * 360, text: 'Search interest for “Aerie bras” creeping up week-over-week on Google Trends. $AEO', url: 'https://x.com/user/status/90000038' },

  // ---------- AEO WITH SYDNEY TIE-INS (kept subtle, still finance-adjacent) ----------
  { id: 'tw-0039', ts: Date.now() - 1000 * 60 * 75, text: 'Pop culture overlap: new celeb posts wearing AE basics popped on my feed. Not a huge deal, but it nudges sentiment. $AEO', url: 'https://x.com/user/status/90000039' },
  { id: 'tw-0040', ts: Date.now() - 1000 * 60 * 165, text: 'Influencer try-on featuring AE fleece did real views this morning. Organic reach beats paid when it lands. $AEO', url: 'https://x.com/user/status/90000040' },

  // ---------- LEVI SLICE ----------
  { id: 'tw-0041', ts: Date.now() - 1000 * 60 * 6,  text: 'Levi’s window displays refreshed downtown with a clean “icons” story. Classic sells in a choppy macro. $LEVI', url: 'https://x.com/user/status/90000041' },
  { id: 'tw-0042', ts: Date.now() - 1000 * 60 * 12, text: 'If cotton stabilizes and promos stay rational, $LEVI gross margin could grind higher into holiday.', url: 'https://x.com/user/status/90000042' },
  { id: 'tw-0043', ts: Date.now() - 1000 * 60 * 18, text: 'Seeing Levi’s 501 campaign pop up across multiple channels again. Consistent brand spend. $LEVI', url: 'https://x.com/user/status/90000043' },
  { id: 'tw-0044', ts: Date.now() - 1000 * 60 * 24, text: 'Shop associate said new washes landed early and are moving. Dark rinses leading. $LEVI', url: 'https://x.com/user/status/90000044' },
  { id: 'tw-0045', ts: Date.now() - 1000 * 60 * 30, text: 'Levi’s DTC push keeps building. If stores + ecomm keep comping, channel mix helps the P&L. $LEVI', url: 'https://x.com/user/status/90000045' },
  { id: 'tw-0046', ts: Date.now() - 1000 * 60 * 45, text: '$LEVI weekly chart forming a nice base. Needs a catalyst but technicals improved.', url: 'https://x.com/user/status/90000046' },
  { id: 'tw-0047', ts: Date.now() - 1000 * 60 * 60, text: 'Wholesale partners said replen orders for core fits were steady this month. $LEVI', url: 'https://x.com/user/status/90000047' },
  { id: 'tw-0048', ts: Date.now() - 1000 * 60 * 95, text: 'Levi’s tailoring in-store is a small thing but boosts attachment and satisfaction. $LEVI', url: 'https://x.com/user/status/90000048' },
  { id: 'tw-0049', ts: Date.now() - 1000 * 60 * 130,text: 'Search interest for “Levi’s 501” steady year over year. Stability is not a bad outcome here. $LEVI', url: 'https://x.com/user/status/90000049' },
  { id: 'tw-0050', ts: Date.now() - 1000 * 60 * 180,text: 'My read: $LEVI doesn’t need fireworks. Clean execution + steady demand supports a patient long.', url: 'https://x.com/user/status/90000050' },
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
