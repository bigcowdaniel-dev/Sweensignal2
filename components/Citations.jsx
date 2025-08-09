'use client';
import React from 'react';

export default function Citations({ citations }) {
  const items = Array.isArray(citations) ? citations : [];
  if (!items.length) return null;

  return (
    <div className="mt-2 text-xs opacity-80 flex flex-wrap gap-2">
      {items.slice(0, 4).map((c, i) => {
        const url = typeof c === 'string' ? c : c?.url;
        if (!url) return null;
        let host = '';
        try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
        const title = typeof c === 'string' ? host : (c?.title || host || 'source');
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="underline hover:opacity-100"
          >
            {title}
          </a>
        );
      })}
    </div>
  );
}
