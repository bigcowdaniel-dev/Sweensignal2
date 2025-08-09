'use client';

import { useState } from "react";

const EMOJI = { positive: "😊", neutral: "😐", negative: "😡" };

export default function FeedCard({ item, onHoverTicker }) {
  const [copied, setCopied] = useState(false);

  // Build small meta line: SOURCE • 🙂/😐/😡 • TICKER
  const meta = [
    (item?.source || "NEWS").toUpperCase(),
    EMOJI[item?.sentiment] || "❔",
    item?.ticker || "—",
  ].join(" • ");

  // Share button copies a demo-link anchored to this item
  async function copyLink() {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/?demo=1#${item?.id || ""}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  }

  // Hovering a card highlights its ticker in the right table
  const hoverTicker =
    item?.ticker ||
    (Array.isArray(item?.tickers) && item.tickers.length ? item.tickers[0] : null);

  return (
    <article
      className="rounded-lg border bg-white p-3 shadow-sm"
      onMouseEnter={() => onHoverTicker?.(hoverTicker)}
      onMouseLeave={() => onHoverTicker?.(null)}
    >
      {/* top meta + share */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-[#777]">
          {meta}
        </div>
        <button
          onClick={copyLink}
          className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
        >
          Share
        </button>
      </div>

      {/* main text */}
      <a
        href={item?.url || "#"}
        target="_blank"
        rel="noreferrer"
        className="block text-[15px] leading-6"
      >
        {item?.text}
      </a>

      {/* time + copy confirmation */}
      <div className="mt-2 text-[11px] text-[#999]">
        {formatTime(item?.ts || item?.createdAt)}
        {copied && <span className="ml-2 text-[#FF4FB2]">Copied!</span>}
      </div>

      {/* source host link (small, like in your screenshot) */}
      {item?.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-[12px] text-[#888] underline"
        >
          {host(item.url)}
        </a>
      )}
    </article>
  );
}

function formatTime(t) {
  try {
    if (!t) return "";
    const d = typeof t === "number" ? new Date(t) : new Date(t);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
}

function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
