// app/api/diag/xai/route.js
export const dynamic = 'force-dynamic';

const XAI_KEY = process.env.XAI_API_KEY || '';
const XAI_MODEL = process.env.XAI_MODEL || 'grok-4';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') ||
    'Sydney Sweeney finance stocks ($AEO OR $LEVI OR $ULTA OR VSCO OR Aerie OR Levi OR Ulta OR "Victoria\'s Secret")';
  const days = Number(searchParams.get('days') || 3);
  const max  = Math.min(Math.max(Number(searchParams.get('max') || 10), 5), 50);

  if (!XAI_KEY) {
    return new Response(JSON.stringify({
      ok: false,
      step: 'missing_env',
      message: 'XAI_API_KEY is not set on this deployment.',
    }, null, 2), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }

  const fromDate = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);

  const body = {
    model: XAI_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system',
        content:
          'Return only JSON: { "posts": [ { "id": string, "ts": string, "url": string, "text": string } ] }' },
      { role: 'user',
        content: `Find recent X posts: ${query}` }
    ],
    search_parameters: {
      mode: 'on',
      from_date: fromDate,
      max_search_results: max,
      return_citations: true,
      sources: [{ type: 'x', post_favorite_count: 1 }]
    }
  };

  let httpStatus = 0, rawText = '';
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    httpStatus = res.status;
    rawText = await res.text();

    if (!res.ok) {
      return new Response(JSON.stringify({
        ok: false,
        step: 'xai_http_error',
        status: httpStatus,
        body: rawText.slice(0, 4000),
      }, null, 2), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    let parsed; try { parsed = JSON.parse(rawText); } catch(e) {}
    const content = parsed?.choices?.[0]?.message?.content || '';
    let json; try { json = JSON.parse(content); } catch(e) {}

    return new Response(JSON.stringify({
      ok: true,
      status: httpStatus,
      posts_found: Array.isArray(json?.posts) ? json.posts.length : 0,
      sample: (json?.posts || []).slice(0, 3),
    }, null, 2), { headers: { 'Content-Type': 'application/json' }});
  } catch (e) {
    return new Response(JSON.stringify({
      ok: false,
      step: 'fetch_failed',
      message: String(e?.message || e),
      status: httpStatus,
      body: rawText.slice(0, 4000),
    }, null, 2), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}
