"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GuideStoreDB, Guide, GuideStore } from "@/lib/store";

export default function GuideDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [customQuery, setCustomQuery] = useState("");

  function load() {
    const g = GuideStoreDB.get(params.id);
    if (!g) { router.push("/guides"); return; }
    setGuide(g);
  }
  useEffect(load, [params.id]);

  const allStores = useMemo(() => guide?.stores || [], [guide]);
  const active = allStores[activeIdx];

  if (!guide) return null;

  function addCustomLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!customQuery.trim() || !guide) return;
    const q = customQuery.trim();
    const fullQ = [q, guide.area, "Japan"].filter(Boolean).join(" ");
    const s: GuideStore = {
      name: q,
      area: guide.area,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQ)}`,
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(fullQ)}&output=embed`,
    };
    const updated = { ...guide, stores: [...guide.stores, s] };
    GuideStoreDB.upsert(updated);
    setGuide(updated);
    setActiveIdx(updated.stores.length - 1);
    setCustomQuery("");
  }

  function removeStore(i: number) {
    if (!guide) return;
    const next = guide.stores.filter((_, idx) => idx !== i);
    const updated = { ...guide, stores: next };
    GuideStoreDB.upsert(updated);
    setGuide(updated);
    setActiveIdx(Math.max(0, Math.min(activeIdx, next.length - 1)));
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="card overflow-hidden">
        {guide.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={guide.coverImage} alt="" className="w-full h-48 md:h-64 object-cover" />
        )}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <span className="rounded-full bg-ink-100 px-2.5 py-1">{guide.area}</span>
            {guide.sourceHost && (
              <a
                href={guide.sourceUrl}
                target="_blank" rel="noreferrer"
                className="text-ink-500 hover:text-ink-900 underline-offset-2 hover:underline"
              >
                來源：{guide.sourceHost} ↗
              </a>
            )}
          </div>
          <h1 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight text-ink-900">
            {guide.title}
          </h1>
          <p className="mt-3 text-ink-600 leading-relaxed">{guide.summary}</p>
        </div>
      </section>

      {/* Map + Store list */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-400">Google Maps</p>
            <h2 className="text-xl font-semibold text-ink-900">商店地圖</h2>
          </div>
          <span className="text-xs text-ink-400">{allStores.length} 個地點</span>
        </div>

        {allStores.length === 0 ? (
          <div className="card mt-4 p-10 text-center text-sm text-ink-500">
            還沒解析出任何地點 — 你可以下方手動加入想去的店。
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {/* Map (large) */}
            <div className="lg:col-span-2 card overflow-hidden">
              <iframe
                key={active?.embedUrl}
                src={active?.embedUrl}
                className="w-full h-[360px] md:h-[460px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-ink-900 truncate">{active?.name}</div>
                  {active?.tip && (
                    <div className="text-xs text-ink-500 truncate">{active.tip}</div>
                  )}
                </div>
                <a
                  href={active?.mapsUrl}
                  target="_blank" rel="noreferrer"
                  className="btn-ghost text-xs whitespace-nowrap"
                >
                  在 Google Maps 開啟 ↗
                </a>
              </div>
            </div>

            {/* Store list */}
            <ul className="space-y-2">
              {allStores.map((s, i) => (
                <li key={s.name + i}>
                  <button
                    onClick={() => setActiveIdx(i)}
                    className={`w-full text-left card p-4 transition ${
                      i === activeIdx
                        ? "ring-2 ring-ink-900 shadow-lg"
                        : "hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-ink-900 truncate">{s.name}</div>
                        <div className="text-xs text-ink-500 truncate">{s.area || guide.area}</div>
                      </div>
                      <span
                        onClick={(e) => { e.stopPropagation(); removeStore(i); }}
                        className="text-xs text-ink-300 hover:text-sakura-500 cursor-pointer"
                      >
                        ×
                      </span>
                    </div>
                    {s.tip && (
                      <div className="mt-1 text-xs text-ink-500 line-clamp-2">{s.tip}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add custom location */}
        <form onSubmit={addCustomLocation} className="card mt-4 p-4 flex gap-2">
          <input
            className="input flex-1"
            placeholder="加入任何地點，例如「澀谷 Loft」「築地市場」「東京晴空塔」"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
          />
          <button className="btn-primary text-sm whitespace-nowrap">+ 加到地圖</button>
        </form>
      </section>

      {/* Products */}
      {guide.products.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-wider text-ink-400">Shopping List</p>
          <h2 className="text-xl font-semibold text-ink-900">推薦商品</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {guide.products.map((p, i) => (
              <div key={i} className="card p-5">
                <div className="text-sm font-medium text-ink-900">{p.name}</div>
                <div className="mt-1 text-xs text-ink-500">
                  {p.store && <>{p.store} · </>}
                  {p.price || ""}
                </div>
                {p.note && <div className="mt-2 text-xs text-ink-500">{p.note}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Tips */}
      {guide.tips.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-wider text-ink-400">AI Tips</p>
          <h2 className="text-xl font-semibold text-ink-900">購買建議</h2>
          <ul className="mt-4 space-y-2">
            {guide.tips.map((t, i) => (
              <li key={i} className="card p-4 flex gap-3">
                <span className="text-sakura-500">●</span>
                <span className="text-sm text-ink-700 leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          想保留這份攻略？已自動存到你的「我的攻略」。
        </p>
        <div className="flex gap-2">
          <a href="/guides" className="btn-ghost text-sm">看全部攻略</a>
          <button
            onClick={() => { if (confirm("刪除這份攻略？")) { GuideStoreDB.remove(guide.id); router.push("/guides"); } }}
            className="btn-ghost text-sm"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  );
}
