"use client";

export default function FeedCard({ item, onHoverTicker, hoveredTicker }) {
  const meta = [item.source?.toUpperCase(), item.sentiment || "?", item.ticker || "-"]
    .filter(Boolean)
    .join(" • ");
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => onHoverTicker?.(item.ticker)}
      onMouseLeave={() => onHoverTicker?.(null)}
      className={`card block p-4 hover:border-pink transition-colors ${hoveredTicker && item.ticker === hoveredTicker ? 'border-pink' : ''}`}
    >
      <div className="text-sm text-meta mb-2">{meta}</div>
      <div className="text-sm">{item.text}</div>
      <div className="text-xs text-meta mt-2">{new Date(item.createdAt).toLocaleString()}</div>
    </a>
  );
}

