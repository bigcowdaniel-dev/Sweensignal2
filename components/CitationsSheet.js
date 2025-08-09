'use client';
export default function CitationsSheet({
  citations = [],
  open = false,
  onClose = () => {},
}) {
  return (
    <>
      {/* Backdrop: disabled when closed */}
      <div
        className={`fixed inset-0 z-40 transition-colors ${
          open ? 'bg-black/40' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Panel: disabled when closed */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 h-full w-[420px] max-w-[95vw] bg-white shadow-xl transition-transform
          ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Latest Citations</h2>
          <button onClick={onClose} className="text-sm underline">Close</button>
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
                <a href={url} target="_blank" rel="noreferrer" className="underline hover:opacity-100">
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
