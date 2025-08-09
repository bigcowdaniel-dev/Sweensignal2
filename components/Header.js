export default function Header() {
  const isDemo = process.env.NEXT_PUBLIC_FORCE_DEMO === "1";

  return (
    <header className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          {/* your logo stays the same */}
          <span className="select-none text-lg font-semibold">
            <span className="text-[#FF4FB2]">Sween</span><span className="text-[#1F8EFA]">Signal</span>
          </span>
        </div>

        {isDemo && (
          <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-600">
            Demo mode
          </span>
        )}
      </div>

      <h1 className="pb-2 text-center text-[15px] text-[#777]">
        Sydney Sweeney retail sentiment
      </h1>
    </header>
  );
}
