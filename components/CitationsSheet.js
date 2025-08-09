'use client';

import { useEffect } from 'react';

export default function CitationsSheet({
  citations = [],
  open = false,
  onClose = () => {},
}) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const items = Array.isArray(citations) ? citations : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-colors ${
          open ? 'bg-black/40' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Panel */}
      <aside
        className={`fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border border-gray-200 bg-white shadow-xl transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Citations"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-base font-semibold">Citations</h2>
          <button onClick={onClose} className="text-sm underline opacity-90 hover:opacity-100">
            Close
          </button>
        </div>

        <div className="p-5">
          {items.length ? (
            <div className="grid gap-2 text-sm">
              {items.slice(0, 20).map((c, i) => {
                const url = typeof c === 'string' ? c : c?.url;
                if (!url) return null;
                let host = '';
                try {
                  host = new URL(url).hostname.replace(/^www\./, '');
                } catch {}
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
          ) : (
            <p className="text-sm text-gray-600">No citations available.</p>
          )}
        </div>
      </aside>
    </>
  );
}
