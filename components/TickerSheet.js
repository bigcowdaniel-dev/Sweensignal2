// components/TickerSheet.js
'use client';

import { useEffect } from 'react';
import PriceChart from './PriceChart';

export default function TickerSheet({
  open = false,
  symbol = '',
  queryString = '',
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

  return (
    <>
      {/* Backdrop: absorbs clicks to close */}
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
        aria-label={symbol ? `${symbol} share price` : 'Share price'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-base font-semibold">
            {symbol ? `${symbol} share price` : 'Share price'}
          </h2>
          <button
            onClick={onClose}
            className="text-sm underline hover:opacity-100 opacity-90"
          >
            Close
          </button>
        </div>

        <div className="p-5">
          {symbol ? (
            <PriceChart symbol={symbol} queryString={queryString} />
          ) : (
            <div className="rounded-lg border p-6 text-sm text-gray-500">
              Pick a ticker to view its price chart.
            </div>
          )}
          <p className="mt-3 text-xs opacity-70">
            Data shown is daily close. Demo mode is respected if you visited with <code>?demo=1</code>.
          </p>
        </div>
      </aside>
    </>
  );
}
