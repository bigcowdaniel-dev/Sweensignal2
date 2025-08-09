'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';

export default function Header() {
  const params = useSearchParams();
  const demoParam = params?.get('demo');
  const envDemo = process.env.NEXT_PUBLIC_FORCE_DEMO === '1';
  const isDemo = demoParam === '1' || envDemo;

  // --- Tagline phrases (edit these to taste) ---
  const phrases = useMemo(
    () => [
      'Stonks Only Go Sween',
      'Buy the Sween, Sell the Dream',
      'In Sween We Trust',
      'Sween Today, Green Tomorrow',
      'To the Sween 🌙',
      'Powered by Pure Sweenergy',
      'Spot the Sween Before the Street',
      'Catch the Sween, Ride the Wave',
      'From Sweeney to Stonks in Seconds',
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
  const lineHeightPx = 22; // keep in sync with text size/leading below

  return (
    <header className="sticky top-0 z-30 overflow-visible">
      {/* Gradient brand bar behind the header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-[#FF4FB2]/10 to-[#1F8EFA]/10" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="flex items-start justify-between py-4">
          {/* Left: logo + rotating tagline */}
          <div className="min-w-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SweenSignal"
                width={280}
                height={56}
                priority
                className="h-14 w-auto object-contain"
              />
            </Link>

            {/* Rotating tagline (vertical ticker style) */}
            <div
              className="mt-1 h-[22px] overflow-hidden"
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
                    className="h-[22px] leading-[22px] whitespace-nowrap"
                  >
                    <span className="select-none bg-gradient-to-r from-[#FF4FB2] to-[#1F8EFA] bg-clip-text text-[13px] font-semibold text-transparent drop-shadow-[0_0_1px_rgba(255,255,255,0.6)]">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: status badges */}
          <div className="flex items-center gap-3 pt-1">
            {isDemo && (
              <span className="relative inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-700">
                {/* custom pulsing dot (independent of Tailwind animate classes) */}
                <span className="relative inline-block">
                  <span className="pulse-ring" />
                  <span className="pulse-core" />
                </span>
                Demo mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Local CSS for the pulse animation */}
      <style jsx>{`
        .pulse-core {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #ff4fb2;
          border-radius: 9999px;
          position: relative;
          z-index: 2;
        }
        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          box-shadow: 0 0 0 0 rgba(255, 79, 178, 0.6);
          animation: sween-pulse 1.2s ease-out infinite;
          z-index: 1;
        }
        @keyframes sween-pulse {
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
