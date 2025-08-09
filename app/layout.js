// app/layout.js
import './globals.css';
import { Suspense } from 'react';

export const metadata = {
  title: 'SweenSignal',
  description: 'Meme-driven sentiment dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Suspense here guarantees useSearchParams() is always inside a boundary */}
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
