'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function Header() {
  const params = useSearchParams();
  const demoParam = params?.get('demo');
  const envDemo = process.env.NEXT_PUBLIC_FORCE_DEMO === '1';
  const isDemo = demoParam === '1' || envDemo;

  return (
    <header className="sticky top-0 z-30 overflow-visible">
      {/* Gradient brand bar behind the header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-[#FF4FB2]/10 to-[#1F8EFA]/10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="flex items-start justify-between py-3">
          {/* Left: logo + tagline */}
          <div className="min-w-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SweenSignal"
                width={280}    // ~25% larger
                height={56}
                priority
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-1 text-sm text-[#555]">Stonks Only Go Sween</p>
          </div>

          {/* Right: status badges */}
          <div className="flex items-center gap-3 pt-1">
            {isDemo && (
              <span className="relative inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-700">
                {/* pulsing pink dot */}
                <span className="relative inline-flex">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-pink-400 opacity-60" />
                  <span className="relative inline-block h-2 w-2 rounded-full bg-pink-500" />
                </span>
                Demo mode
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
