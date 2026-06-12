"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GuideStoreDB, uid, Guide } from "@/lib/store";

export default function NewGuide() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url && !text) {
      setError("請貼上連結或文字內容");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/guides/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, text }),
      });
      if (!res.ok) throw new Error("分析失敗");
      const data = await res.json();
      const id = uid();
      const guide: Guide = {
        id,
        sourceUrl: url,
        sourceHost: data.source?.host || "",
        title: data.guide?.title || "日本購物攻略",
        summary: data.guide?.summary || "",
        area: data.guide?.area || "日本",
        coverImage: data.guide?.coverImage,
        stores: data.guide?.stores || [],
        products: data.guide?.products || [],
        tips: data.guide?.tips || [],
        createdAt: Date.now(),
      };
      GuideStoreDB.upsert(guide);
      router.push(`/guides/${id}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-sakura-50 px-2.5 py-1 text-xs font-medium text-sakura-500">
          NEW
        </span>
        <p className="text-sm text-ink-500">貼連結，AI 幫你建立購物攻略</p>
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink-900">
        貼上小紅書 / FB / Google<br />一鍵變成攻略
      </h1>
      <p className="mt-3 text-ink-500 leading-relaxed">
        我們會抓取網頁內容、AI 解析商店與商品，並即時連到真實 Google Maps。
      </p>

      <form onSubmit={analyze} className="card mt-8 p-6 md:p-8 space-y-5">
        <div>
          <label className="label">貼上連結</label>
          <input
            className="input text-base"
            placeholder="https://www.xiaohongshu.com/explore/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          <p className="mt-1.5 text-xs text-ink-400">
            支援：小紅書、Facebook、Instagram、Threads、Google Maps、部落格…等
          </p>
        </div>

        <div className="relative">
          <div className="my-1 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-400">
            <div className="flex-1 h-px bg-ink-200" />
            或同時貼上原文以提升準度（可選）
            <div className="flex-1 h-px bg-ink-200" />
          </div>
          <textarea
            className="input min-h-[120px] mt-2"
            placeholder="例如：到大阪心齋橋必逛 Donki 唐吉訶德，藥妝最便宜，¥1,480 EVE 止痛藥…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-ink-400">
            小紅書 / FB 內文有時抓不到，貼上原文可讓 AI 萃取更精確。
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-sakura-500/40 bg-sakura-50 p-3 text-sm text-sakura-500">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-400">
            {loading ? "AI 解析中… 約 5–15 秒" : "AI 會擷取商店、商品、地點"}
          </p>
          <button className="btn-primary" disabled={loading}>
            {loading ? "解析中…" : "開始解析 →"}
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-3 md:grid-cols-3 text-sm">
        <Hint icon="🔗" title="抓 OG meta">擷取網頁標題、封面、描述。</Hint>
        <Hint icon="🧠" title="AI 結構化">商店、商品、地點、價格自動分類。</Hint>
        <Hint icon="🗺" title="真實地圖">所有地點直連 Google Maps 嵌入。</Hint>
      </div>
    </div>
  );
}

function Hint({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="text-xl">{icon}</div>
      <div className="mt-2 text-sm font-semibold text-ink-900">{title}</div>
      <div className="mt-0.5 text-xs text-ink-500">{children}</div>
    </div>
  );
}
