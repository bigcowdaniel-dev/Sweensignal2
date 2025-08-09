import Parser from "rss-parser";

const parser = new Parser();

const QUERY =
  'Sydney Sweeney (aeo OR levi OR levis OR ulta OR "victoria\'s secret" OR vsco OR aerie OR denim OR makeup OR beauty OR lingerie)';

export async function fetchNewsPosts() {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(QUERY)}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const feed = await parser.parseURL(url);
    const items = feed?.items || [];
    return items.map((it, idx) => ({
      id: String(it.id || it.guid || idx),
      text: it.title || it.contentSnippet || it.content || "",
      createdAt: new Date(it.isoDate || it.pubDate || Date.now()).toISOString(),
      url: it.link,
      source: "news",
      sentiment: null,
      compound: null,
      score: null,
      ticker: null,
    }));
  } catch {
    return [];
  }
}





