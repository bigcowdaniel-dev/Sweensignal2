export const metadata = {
  title: "SweenSignal",
  description: "Live Sydney Sweeney chatter mapped to AEO/LEVI/ULTA/VSCO sentiment",
  openGraph: {
    title: "SweenSignal",
    description: "Live Sydney Sweeney chatter mapped to retail tickers",
    images: ["/opengraph-image.png"],
  },
  icons: { icon: "/favicon.ico" },
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* Simple top bar with a clickable How it works? link */}
        <nav className="flex items-center gap-4 p-3 border-b">
          <a href="/" className="font-semibold">SweenSignal</a>
          <div className="flex-1" />
          <a href="/how-it-works" className="underline opacity-80 hover:opacity-100">
            How it works?
          </a>
        </nav>

        {children}
      </body>
    </html>
  );
}
