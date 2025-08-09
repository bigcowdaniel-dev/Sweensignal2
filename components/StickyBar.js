'use client';

export default function StickyBar({
  onOpenHowItWorks = () => {},
  onOpenCitations = () => {},
}) {
  // Center cluster: How it works? + Citations
  return (
    <>
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
        <button
          onClick={onOpenHowItWorks}
          className="rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        >
          🧠 How it works?
        </button>
        <button
          onClick={onOpenCitations}
          className="rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        >
          🔗 Citations
        </button>
      </div>

      {/* Right: copy live link (kept, since you had it before) */}
      <div className="fixed bottom-3 right-6 z-[60]">
        <button
          onClick={() => {
            const u =
              process.env.NEXT_PUBLIC_STICKY_LINK_URL ||
              (typeof window !== 'undefined' ? window.location.href : '');
            if (!u) return;
            navigator.clipboard?.writeText(u);
          }}
          className="rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        >
          🔗 Copy live link
        </button>
      </div>
    </>
  );
}
