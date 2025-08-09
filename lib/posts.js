// lib/posts.js
import { extractTickersFromText } from './extractTickers.js';

// In real live mode, replace these with your actual fetchers (Reddit/News/etc.)
async function fetchLivePosts() {
  // TODO: wire real sources. Keep shape: { id, text, url?, ts?, title? }
  return [];
}

// Demo seeds — content mentions multiple brands so mapping/regex kick in.
// You can tweak these texts; tickers are NOT hardcoded, they’re derived.
const SEEDS = [
  {
    id: 'seed-1',
    ts: Date.now() - 1000 * 60 * 60 * 24 * 1,
    text:
      "Sydney Sweeney spotted in new Aerie drop; American Eagle fans say $AEO could benefit if the campaign trends.",
    url: "https://www.ae.com/"
  },
  {
    id: 'seed-2',
    ts: Date.now() - 1000 * 60 * 60 * 24 * 2,
    text:
      "Press tour buzz overlaps with Levi’s styling notes — denim subs debating fits and whether LEVI gets the halo.",
    url: "https://www.levi.com/"
  },
  {
    id: 'seed-3',
    ts: Date.now() - 1000 * 60 * 60 * 24 * 3,
    text:
      "Beauty threads linking Sweeney’s routine to Ulta picks; some traders tagging $ULTA on the move.",
    url: "https://www.ulta.com/"
  },
  {
    id: 'seed-4',
    ts: Date.now() - 1000 * 60 * 60 * 24 * 4,
    text:
      "After an interview mention, Victoria’s Secret chatter pops; a few posts tag VSCO when discussing brand collabs.",
    url: "https://www.victoriassecret.com/"
  },
  {
    id: 'seed-5',
    ts: Date.now() - 1000 * 60 * 60 * 24 * 5,
    text:
      "Random finance meme with $AEO, $LEVI and store photos — mods argue if it’s real signal or just hype.",
    url: "https://reddit.com/r/stocks"
  }
];

function normalize(post) {
  const text = [post.title, post.text, post.body, post.caption].filter(Boolean).join(' ');
  const tickers = extractTickersFromText(text);
  return {
    id: post.id || post.permalink || post.url || String(Math.random()).slice(2),
    text: post.text || post.title || post.body || '',
    url: post.url || post.link || post.permalink || null,
    ts: post.ts || post.time || post.created_at || Date.now(),
    tickers
  };
}

export async function fetchPosts({ demo = false } = {}) {
  let posts = [];
  if (demo) {
    posts = SEEDS.map(normalize);
  } else {
    const live = await fetchLivePosts();
    const arr = Array.isArray(live) && live.length ? live : SEEDS; // safe fallback
    posts = arr.map(normalize);
  }
  return { posts };
}
