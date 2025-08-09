import {
  xai,
  XAI_MODEL,
  USE_XAI,
  USE_XAI_LIVE_SEARCH,
  XAI_SEARCH_MODE,
  XAI_MAX_SEARCH_RESULTS,
  XAI_FROM_DAYS,
  XAI_SOURCES,
} from "./xai.js";

function buildSearchParameters() {
  if (!USE_XAI_LIVE_SEARCH) return undefined;
  const fromISO = new Date(Date.now() - XAI_FROM_DAYS * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const sources = XAI_SOURCES.map((type) => {
    if (type === "rss")
      return {
        type: "rss",
        links: "https://news.google.com/rss/search?q=Sydney%20Sweeney",
      };
    if (type === "web") return { type, safe_search: true };
    if (type === "news") return { type, country: "US", safe_search: true };
    if (type === "x") return { type, post_favorite_count: 50 };
    return { type };
  });
  return {
    mode: XAI_SEARCH_MODE,
    max_search_results: XAI_MAX_SEARCH_RESULTS,
    from_date: fromISO,
    return_citations: true,
    sources,
  };
}

export async function classifyWithXAI(items) {
  if (!USE_XAI || !process.env.XAI_API_KEY) return null;
  if (!items?.length) return { items: [] };

  const search_parameters = buildSearchParameters();
  const res = await xai.chat.completions.create({
    model: XAI_MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" },
    ...(search_parameters ? { search_parameters } : {}),
    messages: [
      {
        role: "system",
        content:
          "You classify text about Sydney Sweeney. For each item, strictly return JSON: items:[{id (string), sentiment ('positive'|'neutral'|'negative'), score (number -1..1), ticker ('AEO'|'LEVI'|'ULTA'|'VSCO'|null)}]. No extra fields.",
      },
      { role: "user", content: JSON.stringify({ items }) },
    ],
  });

  const msg = res?.choices?.[0]?.message;
  const raw = msg?.content || "{}";
  const citations = Array.isArray(msg?.citations)
    ? msg.citations
        .map((c) => (c?.url || c?.title || "").trim())
        .filter(Boolean)
    : undefined;

  try {
    const json = JSON.parse(raw);
    return { items: json.items || [], citations };
  } catch {
    return null; // triggers VADER fallback
  }
}





