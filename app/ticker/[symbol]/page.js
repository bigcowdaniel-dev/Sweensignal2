import Link from 'next/link';
import Header from '../../../components/Header';
import PriceChart from '../../../components/PriceChart';

export const dynamic = 'force-dynamic';

export default function TickerPage({ params, searchParams }) {
  const symbol = (params?.symbol || '').toUpperCase();
  // preserve demo=1 etc. if present
  const qs = new URLSearchParams(searchParams || {});
  const queryString = qs.toString();

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{symbol} · Price</h1>
          <Link href="/" className="text-sm underline opacity-80 hover:opacity-100">
            ← Back to feed
          </Link>
        </div>

        <PriceChart symbol={symbol} queryString={queryString} />

        <p className="text-xs opacity-70">
          Data shown is daily close. If you visited the site with <code>?demo=1</code>,
          the same flag is passed through here.
        </p>
      </div>
    </main>
  );
}
