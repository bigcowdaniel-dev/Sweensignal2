import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const isDemo = process.env.NEXT_PUBLIC_FORCE_DEMO === '1';

  return (
    <header className="relative z-20 mx-auto max-w-6xl overflow-visible px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between py-4">
        {/* Clickable logo → home */}
        <Link href="/" className="flex items-center min-w-0">
          <Image
            src="/logo.png"
            alt="SweenSignal"
            width={220}
            height={44}
            priority
            className="h-11 w-auto object-contain block"
          />
        </Link>

        <div className="flex items-center gap-3">
          {isDemo && (
            <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-600">
              Demo mode
            </span>
          )}
        </div>
      </div>

      {/* tagline */}
      <h1 className="pb-2 text-center text-[15px] text-[#777]">
        Stonks Only Go Sween
      </h1>
    </header>
  );
}
