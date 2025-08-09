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
        {children}
      </body>
    </html>
  );
}





