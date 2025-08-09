"use client";

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function StatusPill() {
  const { data } = useSWR("/api/status", fetcher, { refreshInterval: 60000 });
  const xaiLabel = data?.xai?.ok ? `xAI ✅ model=${data?.xai?.model}` : "xAI ❌";
  const ls = data?.liveSearch;
  const lsText = ls?.enabled
    ? `LS: ${ls?.mode} (${(ls?.sources || []).join(",")}; max ${ls?.max})`
    : "LS: off";
  return (
    <div className="tag">
      <span>Sources:</span>
      <span className="ml-1">Reddit {data?.reddit?.ok ? "✅" : "❌"} · News {data?.news?.ok ? "✅" : "❌"} · {xaiLabel} · {lsText}</span>
    </div>
  );
}





