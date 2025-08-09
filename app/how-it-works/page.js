export const metadata = { title: "How it works • SweenSignal" };

export default function HowItWorksPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">How SweenSignal works</h1>
      <section className="card p-4 space-y-3">
        <h2 className="font-medium">Sources</h2>
        <ul className="list-disc list-inside text-sm text-meta">
          <li>Reddit search for “Sydney Sweeney” and retail terms</li>
          <li>Google News RSS for matching keywords</li>
          <li>Optional xAI Live Search may consult recent web/news/X sources</li>
        </ul>
      </section>
      <section className="card p-4 space-y-3">
        <h2 className="font-medium">Sentiment</h2>
        <p className="text-sm text-meta">
          Primary labels use xAI. If unavailable or invalid, VADER fallback is used
          with thresholds ±0.3. Backup ticker mapping uses simple regexes.
        </p>
      </section>
      <section className="card p-4 space-y-3">
        <h2 className="font-medium">Prices</h2>
        <p className="text-sm text-meta">Daily prices via Stooq (AEO, LEVI, ULTA, VSCO).</p>
      </section>
      <section className="card p-4 space-y-3">
        <h2 className="font-medium">Caching</h2>
        <p className="text-sm text-meta">Posts and prices cached ~60s; sentiment ~120s.</p>
      </section>
    </main>
  );
}





