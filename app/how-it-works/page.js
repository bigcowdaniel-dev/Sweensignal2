export const metadata = {
  title: 'How SweenSignal Works',
  description: 'What powers the signals, demo vs live, and data sources.',
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 prose prose-sm sm:prose lg:prose-lg dark:prose-invert">
      <h1>SweenSignal — How it works</h1>
      <p>
        SweenSignal tracks <strong>Sydney Sweeney</strong> mentions and maps co-mentions to tickers
        (AEO, LEVI, ULTA, VSCO, etc.), then scores association strength & sentiment to surface spikes.
      </p>

      <h2>Data sources</h2>
      <ul>
        <li>Reddit search (public endpoints)</li>
        <li>News (RSS/Google News)</li>
        <li>Optional: xAI classify / Live Search (if enabled)</li>
        <li>Prices: Stooq daily OHLC</li>
      </ul>

      <p className="opacity-80">
        API routes: <code>/api/posts</code>, <code>/api/sentiment</code>, <code>/api/price/:ticker</code>.
        Use <code>?demo=1</code> on <code>/api/posts</code> to force seeds.
      </p>

      <h2>Demo vs Live</h2>
      <ul>
        <li>Append <code>?demo=1</code> to the site URL — sets a cookie so API calls use seeded posts.</li>
        <li>Visit with <code>?demo=0</code> once to clear the cookie and return to live.</li>
      </ul>

      <h2>Citations</h2>
      <p>
        Each post includes a compact list of source links. The server normalizes a <code>citations</code> array
        (derived from <code>url</code>/<code>link</code>/<code>permalink</code> when needed) and the UI shows up to four.
      </p>
    </main>
  );
}
