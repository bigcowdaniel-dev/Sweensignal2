'use client';
import { useState } from 'react';

export default function CitationsSheet({ citations = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-36 z-40 rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="citations-sheet"
      >
        Citations
      </button>

      {/* Backdrop (click to close) */}
      <div
        className={`fixed inset-0 z-40 transition-colors ${
          open ? 'bg-black/40' : 'bg-transparent pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Panel */}
      <aside
        id="citations-sheet"
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 h-full w-[420px] max-w-[95vw] bg-white shadow-xl transition-transform
          ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Latest Citations</h2>
          <button onClick={() => setOpen(false)} className="text-sm underline">Close</button>
        </div>
        <div className="p-4 space-y-2 text-sm">
          {citations.length === 0 && (
            <p className="opacity-70">No citations yet.</p>
          )}
          {citations.slice(0, 50).map((c, i) => {
            const url = typeof c === 'string' ? c : c?.url;
            if (!url) return null;
            let host = '';
            try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
            const title = typeof c === 'string' ? host : (c?.title || host || 'source');
            return (
              <div key={i} className="truncate">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-100"
                >
                  {title}
                </a>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
