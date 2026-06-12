"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GuideStoreDB, Guide } from "@/lib/store";

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    setGuides(GuideStoreDB.list().sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">攻略</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">我的購物攻略</h1>
          <p className="mt-1 text-sm text-ink-500">
            從小紅書 / FB / Google 貼連結，AI 自動建立攻略 + Google Maps。
          </p>
        </div>
        <Link href="/guides/new" className="btn-primary">+ 貼連結</Link>
      </div>

      {guides.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl">🔗</div>
          <h2 className="mt-4 text-lg font-semibold text-ink-900">還沒有攻略</h2>
          <p className="mt-1 text-sm text-ink-500">貼上你看到的日本購物連結，30 秒生成攻略。</p>
          <Link href="/guides/new" className="btn-primary mt-6">立刻建立第一份攻略</Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <Link key={g.id} href={`/guides/${g.id}`} className="card overflow-hidden hover:shadow-lg transition-shadow block">
              {g.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.coverImage} alt="" className="w-full h-36 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <span className="rounded-full bg-ink-100 px-2 py-0.5">{g.area}</span>
                  {g.sourceHost && <span>{g.sourceHost}</span>}
                </div>
                <h3 className="mt-2 font-semibold text-ink-900 line-clamp-2">{g.title}</h3>
                <p className="mt-1 text-xs text-ink-500 line-clamp-2">{g.summary}</p>
                <div className="mt-3 text-xs text-ink-500">
                  {g.stores.length} 個地點 · {g.products.length} 個商品
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
