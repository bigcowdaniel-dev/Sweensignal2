"use client";

import StatusPill from "./StatusPill";

function Wordmark() {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width="44" height="20" viewBox="0 0 110 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 35 C25 5, 45 45, 65 15 S105 25, 105 25" stroke="var(--pink)" strokeWidth="4" fill="none" />
      </svg>
      <span className="text-xl font-semibold">
        <span className="text-blue">Sween</span><span className="text-pink">Signal</span>
      </span>
    </div>
  );
}

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-4 md:px-6">
      <Wordmark />
      <div className="hidden md:block text-meta">Sydney Sweeney retail sentiment</div>
      <div className="flex items-center"><StatusPill /></div>
    </header>
  );
}





