"use client";

function uniqueDomains(links) {
  const out = [];
  const seen = new Set();
  for (const link of links || []) {
    try {
      const u = new URL(link.startsWith("http") ? link : `https://${link}`);
      const d = u.hostname.replace(/^www\./, "");
      if (!seen.has(d)) {
        seen.add(d);
        out.push({ domain: d, href: u.href });
      }
    } catch {
      const d = link.slice(0, 80);
      if (!seen.has(d)) {
        seen.add(d);
        out.push({ domain: d, href: null });
      }
    }
  }
  return out;
}

export default function CitationsSheet({ open, onClose, citations }) {
  if (!open) return null;
  const items = uniqueDomains(citations || []);
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30">
      <div className="card w-full md:w-[640px] max-h-[80vh] overflow-auto p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Citations</h3>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        {items.length ? (
          <ul className="text-sm">
            {items.map((it) => (
              <li key={it.domain} className="py-1">
                {it.href ? (
                  <a href={it.href} target="_blank" rel="noreferrer" className="text-blue underline">{it.domain}</a>
                ) : (
                  <span>{it.domain}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-meta">No citations available</div>
        )}
      </div>
    </div>
  );
}





