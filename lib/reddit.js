const USER_AGENT =
  process.env.REDDIT_UA || "SweenSignalBot/0.1 (https://sweensignal.vercel.app)";

const QUERY =
  'Sydney Sweeney (aeo OR levi OR levis OR ulta OR "victoria\'s secret" OR vsco OR aerie OR denim OR makeup OR beauty OR lingerie)';

export async function fetchRedditPosts() {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(QUERY)}&sort=new&limit=25`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("reddit http " + res.status);
    const json = await res.json();
    const children = json?.data?.children || [];
    return children
      .map((c) => c?.data)
      .filter(Boolean)
      .map((d) => ({
        id: String(d.id),
        text: d.title || d.selftext || "",
        createdAt: new Date((d.created_utc || 0) * 1000).toISOString(),
        url: d.url || `https://reddit.com${d.permalink}`,
        source: "reddit",
        sentiment: null,
        compound: null,
        score: null,
        ticker: null,
      }));
  } catch {
    return [];
  }
}





