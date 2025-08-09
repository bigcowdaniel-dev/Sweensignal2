// lib/mapTicker.js
const KW = {
  AEO:  ["aeo","american eagle","aerie","jeans","denim"],
  LEVI: ["levi","levis","levi’s","denim"],
  ULTA: ["ulta","ulta beauty","makeup","beauty"],
  VSCO: ["victoria's secret","victoria secret","vsco","lingerie","pink"],
};

export function mapTicker(text = "") {
  const s = (text || "").toLowerCase();
  for (const [ticker, words] of Object.entries(KW)) {
    if (words.some(w => s.includes(w))) return ticker;
  }
  return null;
}
 
