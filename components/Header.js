'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';

function ChartIcon() {
  // tiny line chart icon to sit before the tagline text
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mr-1 inline-block h-3.5 w-3.5 align-[-2px]"
    >
      <path
        d="M3 17l5-6 4 4 6-8"
        fill="none"
        stroke="url(#g)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="#FF4FB2" />
          <stop offset="100%" stopColor="#1F8EFA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Header() {
  const params = useSearchParams();
  const demoParam = params?.get('demo');
  const envDemo = process.env.NEXT_PUBLIC_FORCE_DEMO === '1';
  const isDemo = demoParam === '1' || envDemo;

  // --- Tagline phrases (edit these to taste) ---
  const phrases = useMemo(
    () => [
      'Spot the Sween before the Street',
      'Vibes → Mentions → Moves',
      'Fans talk, tickers walk',
      'Meme momentum, simplified',
    ],
    []
  );

  // --- Vertical ticker state ---
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // rotate every 2.5s
    intervalRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % phrases.length);
    }, 2500);
    return () => clearInterval(intervalRef.current);
  }, [phrases.length]);

  // Fixed line height for smooth vertical translate
  const lineHeightPx = 24; // bumped from 22 → 24 to match text-base

  return (
    <header className="sticky top-0 z-30 overflow-visible">
      {/* Gradient brand band behind the header (taller: ~80px) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-[#FF4FB2]/10 to-[#1F8EFA]/10" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="flex items-start justify-between py-4">
          {/* Left: logo + rotating tagline */}
          <div className="min-w-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SweenSignal"
                width={180}
                height={56}
                priority
                className="h-14 w-auto object-contain"
              />
            </Link>

            {/* Rotating tagline (vertical ticker style) */}
            <div
              className="mt-1 h-[24px] overflow-hidden"
              aria-live="polite"
              aria-atomic="true"
            >
              <ul
                className="will-change-transform"
                style={{
                  transform: `translateY(-${idx * lineHeightPx}px)`,
                  transition: 'transform 500ms ease',
                }}
              >
                {phrases.map((text, i) => (
                  <li
                    key={i}
                    className="h-[24px] leading-[24px] whitespace-nowrap"
                  >
                    <span className="select-none bg-gradient-to-r from-[#FF4FB2] to-[#1F8EFA] bg-clip-text text-base font-medium text-transparent drop-shadow-[0_0_1px_rgba(255,255,255,0.6)]">
                      <ChartIcon />
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: demo pill */}
          <div className="mt-1 shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 py-1.5 text-xs text-meta shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="pulse-core absolute inset-0" />
                <span className={`absolute inset-0 rounded-full ${isDemo ? 'bg-[#FF4FB2]' : 'bg-gray-300'}`} />
              </span>
              Demo mode
            </span>
          </div>
        </div>
      </div>

      {/* Local CSS for the pulse animation */}
      <style jsx>{`
        .pulse-core {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          box-shadow: 0 0 0 0 rgba(255, 79, 178, 0.6);
          animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 79, 178, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 79, 178, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 79, 178, 0);
          }
        }
      `}</style>
    </header>
  );
}
