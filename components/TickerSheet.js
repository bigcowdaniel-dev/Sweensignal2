// components/TickerSheet.js
'use client';

import PriceChart from './PriceChart';

export default function TickerSheet({
  open = false,
  symbol = '',
  queryString = '',
  onClose = () => {},
}) {
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
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-[560px] transform bg-white shadow-xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Ticker price"
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-medium">
            {symbol ? `${symbol} — share price` : 'Share price'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="p-4">
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
