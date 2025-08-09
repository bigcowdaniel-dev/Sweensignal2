"use client";

import { useEffect, useState } from "react";

const liveLink = process.env.NEXT_PUBLIC_STICKY_LINK_URL;
const portfolioLink = process.env.NEXT_PUBLIC_PORTFOLIO_URL;

export default function StickyBar({ onOpenHow, onOpenCitations }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40">
      <div className="mx-auto max-w-5xl grid grid-cols-3 gap-2">
        <a href="#" className="btn bg-pink/10 border-pink text-pink">$2 Lifetime Membership</a>
        <div className="flex gap-2 justify-center">
          <button className="btn" onClick={() => onOpenHow?.()}>🧠 How it works?</button>
          <button className="btn" onClick={() => onOpenCitations?.()}>📎 Citations</button>
        </div>
        <div className="flex justify-end gap-2">
          {portfolioLink ? (
            <a className="btn" href={portfolioLink} target="_blank" rel="noreferrer">Portfolio</a>
          ) : null}
          {liveLink ? (
            <a className="btn" href={liveLink} target="_blank" rel="noreferrer">Open Live</a>
          ) : null}
          <button
            className="btn"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
              } catch {}
            }}
          >
            🔗 Copy live link
          </button>
        </div>
      </div>
      {copied ? <div className="toast">Link copied</div> : null}
    </div>
  );
}

