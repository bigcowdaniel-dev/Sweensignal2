'use client';

import { useState } from "react";

const EMOJI = { positive: "😊", neutral: "😐", negative: "😡" };

export default function FeedCard({ item, onHoverTicker }) {
  const [copied, setCopied] = useState(false);

  // SOURCE • 🙂/😐/😡 • PRIMARY TICKER (or —)
  const meta = [
    String(item?.source || "news").toUpperCase(),
    EMOJI[item?.sentiment] || "❔",
    item?.ticker || "—",
  ].join(" • ");

  // Up to 3 ticker chips
  const chips = Array.isArray(item?.tickers) ? item.tickers.slice(0, 3) : [];

  return (
    <article className="rounded-2xl border border-black/5 bg-white/80 backdrop-blur p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Meta line */}
      <div className="text-xs text-gray-500 tracking-wide mb-2">{meta}</div>

      {/* Title / text */}
      <h3 className="text-sm font-medium leading-5 mb-2">
        {item?.title || truncate(item?.text, 140) || "(no title)"}
      </h3>

      {/* Snippet */}
      {item?.text && (
        <p className="text-sm text-gray-700 line-clamp-3 mb-3">
          {item.text}
        </p>
      )}

      {/* Ticker chips (hover to preview price chart in the table; click copies link) */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {chips.map((t) => (
            <button
              key={t}
              type="button"
              onMouseEnter={() => onHoverTicker?.(t)}
              onMouseLeave={() => onHoverTicker?.(null)}
              className="text-xs rounded-full border px-2.5 py-1 hover:bg-black/5"
              aria-label={`Focus ${t} in table`}
              title={`Focus ${t} in table`}
            >
              ${t}
            </button>
          ))}
        </div>
      )}

      {/* Footer: source host + open + copy */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {item?.citations?.length > 0 && (
          <a
            href={firstUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            {firstHost(item)}
          </a>
        )}

        <span aria-hidden>•</span>

        <button
          type="button"
          onClick={() => {
            const u = firstUrl(item);
            if (!u) return;
            navigator.clipboard?.writeText(u);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="hover:underline"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>

        {/* Timestamp on the right */}
        <span className="ml-auto">{formatTs(item?.ts)}</span>
      </div>
    </article>
  );
}

function truncate(s, n) {
  if (!s) return "";
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function formatTs(ts) {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
}

function firstUrl(item) {
  const c = Array.isArray(item?.citations) ? item.citations[0] : null;
  return (typeof c === "string" ? c : c?.url) || item?.url || "";
}

function firstHost(item) {
  return host(firstUrl(item));
}

function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
