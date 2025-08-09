const now = Date.now();
const daysAgo = (d) => new Date(now - d * 24 * 3600 * 1000).toISOString();

export const seedPosts = [
  {
    id: "s1",
    text: "Sydney Sweeney spotted in Aerie campaign; fans love the denim fit",
    createdAt: daysAgo(2),
    url: "https://example.com/aeo1",
    source: "sample",
    sentiment: "positive",
    compound: 0.72,
    score: 0.72,
    ticker: "AEO",
  },
  {
    id: "s2",
    text: "LEVI collab rumor feels overhyped",
    createdAt: daysAgo(4),
    url: "https://example.com/levi1",
    source: "sample",
    sentiment: "negative",
    compound: -0.45,
    score: -0.45,
    ticker: "LEVI",
  },
  {
    id: "s3",
    text: "ULTA mentions spike after Sydney's makeup routine goes viral",
    createdAt: daysAgo(1),
    url: "https://example.com/ulta1",
    source: "sample",
    sentiment: "positive",
    compound: 0.64,
    score: 0.64,
    ticker: "ULTA",
  },
  {
    id: "s4",
    text: "Debate on VSCO lingerie line; mixed reactions",
    createdAt: daysAgo(3),
    url: "https://example.com/vsco1",
    source: "sample",
    sentiment: "neutral",
    compound: 0.05,
    score: 0.05,
    ticker: "VSCO",
  },
  {
    id: "s5",
    text: "American Eagle jeans seen on set; comfy but pricey",
    createdAt: daysAgo(0.5),
    url: "https://example.com/aeo2",
    source: "sample",
    sentiment: "neutral",
    compound: 0.1,
    score: 0.1,
    ticker: "AEO",
  },
];





