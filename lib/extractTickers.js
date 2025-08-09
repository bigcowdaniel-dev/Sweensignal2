// lib/extractTickers.js
import brandsMap from '../data/brands.json' assert { type: 'json' };

/**
 * Extracts tickers from free text:
 *  - $TICKER patterns (1–5 uppercase letters)
 *  - brand/name matches via brands.json mapping
 * Returns an array of unique UPPERCASE tickers.
 */
export function extractTickersFromText(text = '') {
  const out = new Set();
  const t = String(text || ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

  // $TICKER regex
  const dollar = text.match(/\$([A-Z]{1,5})(?![A-Za-z])/g) || [];
  for (const tag of dollar) {
    const sym = tag.slice(1).toUpperCase();
    if (sym) out.add(sym);
  }

  // brand → ticker mapping (word-ish boundaries)
  for (const [brand, ticker] of Object.entries(brandsMap)) {
    const b = brand.toLowerCase();
    // require brand to appear as a whole word-ish token
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(b)}([^a-z0-9]|$)`, 'i');
    if (re.test(t)) out.add(String(ticker).toUpperCase());
  }

  // basic sanity: only 1–5 letters
  return [...out].filter((sym) => /^[A-Z]{1,5}$/.test(sym));
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
