const BRAND = { AEO:"🦅", LEVI:"👖", ULTA:"💄", VSCO:"🎀" };

export default function StockTable({ summaries = {}, hoveredTicker, onHover }) {
  const rows = ["AEO", "LEVI", "ULTA", "VSCO"].map(t => ({ t, d: summaries[t] || {} }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-[1fr_1fr_56px] items-center gap-2 px-2 pb-2 text-xs text-[#777]">
        <div>Ticker</div><div>Strength</div><div className="text-right">Posts</div>
      </div>

      <div className="space-y-2">
        {rows.map(({ t, d }) => {
          const strength = Number(d?.strength || 0);
          const total = Number(d?.total || 0);
          const active = hoveredTicker === t;

          return (
            <button
              key={t}
              onMouseEnter={() => onHover?.(t)}
              onMouseLeave={() => onHover?.(null)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition
                ${active ? "border-[#FF4FB2]/60 bg-[#FFF3FA]/40" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <div className="grid grid-cols-[1fr_1fr_56px] items-center gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-base">{BRAND[t]}</span>
                  <span>{t}</span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF4FB2] to-[#1F8EFA]"
                    style={{ width: `${Math.max(0, Math.min(100, strength))}%` }}
                  />
                </div>

                <div className="text-right text-sm tabular-nums">{total}</div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-[#777]">
        Tip: Hover a row to preview price, or long-press on mobile.
      </p>
    </div>
  );
}

