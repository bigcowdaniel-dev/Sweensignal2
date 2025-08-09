// components/Header.js
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const isDemo = process.env.NEXT_PUBLIC_FORCE_DEMO === '1';

  return (
    <header className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between py-4 overflow-visible">
        {/* Clickable logo → home */}
        <Link href="/" className="flex items-center overflow-visible">
          <Image
            src="/logo.png"
            alt="SweenSignal"
            width={200}
            height={40}
            priority
            className="h-8 w-auto max-w-none"
          />
        </Link>

        {isDemo && (
          <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-600">
            Demo mode
          </span>
        )}
      </div>

      {/* tagline */}
      <h1 className="pb-2 text-center text-[15px] text-[#777]">
        Stonks Only Go Sween
      </h1>
    </header>
  );
}
