import { useState } from "react";

const EMOJI = { positive:"😊", neutral:"😐", negative:"😡" };

export default function FeedCard({ item, onHoverTicker }) {
  const [copied, setCopied] = useState(false);
  const meta = [
    item.source?.toUpperCase() || "NEWS",
    EMOJI[item.sentiment] || "❔",
    item.ticker || "—",
  ].join(" • ");

  const copyLink = async () => {
    try {
      const url = `${location.origin}/?demo=1#${item.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <article
      id={item.id}
      onMouseEnter={() => onHoverTicker?.(item.ticker)}
      onMouseLeave={() => onHoverTicker?.(null)}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#FF4FB2]/50 hover:shadow"
    >
      <div className="mb-1 flex items-center justify-between text-xs text-[#777]">
        <span className="uppercase tracking-wide">{meta}</span>
        <button
          onClick={copyLink}
          className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] hover:border-[#FF4FB2] hover:text-[#FF4FB2]"
        >
          Share
        </button>
      </div>

      <a href={item.url} target="_blank" rel="noreferrer" className="block text-[15px] leading-6">
        {item.text}
      </a>

      <div className="mt-2 text-[11px] text-[#999]">
        {formatTime(item.createdAt)}
        {copied && <span className="ml-2 text-[#FF4FB2]">Copied!</span>}
      </div>
    </article>
  );
}

function formatTime(t) {
  try { return new Date(t).toLocaleString(); } catch { return ""; }
}
