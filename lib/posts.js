import { getCache, setCache } from "./cache.js";
import { fetchRedditPosts } from "./reddit.js";
import { fetchNewsPosts } from "./news.js";
import { seedPosts } from "./seeds.js";

function dedupePosts(posts) {
  const seen = new Set();
  const out = [];
  for (const p of posts) {
    const key = p.url || p.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

export async function fetchPosts({ demo = false } = {}) {
  const cacheKey = `posts:v1:${demo ? "demo" : "live"}`;
  const cached = getCache(cacheKey, 60 * 1000);
  if (cached) return cached;

  if (demo) {
    const payload = { posts: seedPosts.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), meta: { reddit: { ok: true, count: 0 }, news: { ok: true, count: 0 } } };
    setCache(cacheKey, payload);
    return payload;
  }

  let reddit = [];
  let news = [];
  let redditOk = false;
  let newsOk = false;
  try {
    reddit = await fetchRedditPosts();
    redditOk = reddit.length > 0;
  } catch {}
  try {
    news = await fetchNewsPosts();
    newsOk = news.length > 0;
  } catch {}

  let posts = dedupePosts([...reddit, ...news]).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (!posts.length) {
    posts = seedPosts.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } else {
    // Ensure unclassified for live sources
    posts = posts.map((p) => ({ ...p, sentiment: null, compound: null, score: null, ticker: null }));
  }

  const payload = {
    posts,
    meta: {
      reddit: { ok: redditOk, count: reddit.length },
      news: { ok: newsOk, count: news.length },
    },
  };

  setCache(cacheKey, payload);
  return payload;
}





