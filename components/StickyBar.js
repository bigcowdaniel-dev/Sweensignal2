'use client';

export default function StickyBar({
  onOpenHowItWorks = () => {},
  onOpenCitations = () => {},
  imageSrc = '/sweeney.png', // put your file in /public/sweeney.png
}) {
  function copyLiveLink() {
    const url =
      process.env.NEXT_PUBLIC_STICKY_LINK_URL ||
      (typeof window !== 'undefined' ? window.location.href : '');
    if (!url) return;
    try {
      navigator.clipboard?.writeText(url);
    } catch {}
  }

  return (
    <>
      {/* Bottom-left: Copy live link */}
      <div className="fixed bottom-3 left-4 z-[60]">
        <button
          onClick={copyLiveLink}
          className="rounded-md border px-3 py-1 text-sm bg-white/90 hover:bg-white shadow"
        >
          🔗 Copy live link
        </button>
      </div>

      {/* Bottom-center: action buttons */}
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

      {/* Bottom-right: Sydney Sweeney image (non-interactive, won’t block clicks) */}
      <img
        src={imageSrc}
        alt="Sydney Sweeney"
        className="fixed bottom-3 right-3 w-32 md:w-40 h-auto rounded-lg shadow-lg pointer-events-none select-none"
        draggable="false"
      />
    </>
  );
}
