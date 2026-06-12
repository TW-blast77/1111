import Link from "next/link";

const features = [
  { icon: "🔗", title: "貼連結 → 攻略", desc: "小紅書 / FB / Google 連結貼上，AI 一鍵結構化。", badge: "NEW" },
  { icon: "🗺", title: "真實 Google Maps", desc: "解析出的每個地點直接嵌入 Google Maps，可加自訂地點。" },
  { icon: "🧾", title: "購物清單管理", desc: "分類整理藥妝、電器、零食、美妝、服飾。" },
  { icon: "💰", title: "退稅試算", desc: "依日本最新消費稅規則自動算出退稅金額。" },
  { icon: "📊", title: "預算控制", desc: "TWD / JPY / USD 即時換算，預算分配一目了然。" },
  { icon: "🧳", title: "行李容量計算", desc: "輸入行李箱尺寸，預測是否超重超容。" },
];

export default function Home() {
  return (
    <div className="space-y-24">
      <section className="pt-10 md:pt-20 text-center">
        <p className="mb-4 text-sm font-medium text-sakura-500 tracking-widest">JAPAN TRIP · 2026</p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-ink-900 leading-tight">
          去日本前，<br className="md:hidden" />先把購物規劃好
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-ink-500 leading-relaxed">
          建立你的日本購物清單、預算與行李規劃。<br />
          要買什麼、多少錢、哪裡買、行李放不放得下 — 出發前就先搞定。
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/guides/new" className="btn-primary">貼連結，AI 生成攻略 →</Link>
          <Link href="/dashboard" className="btn-ghost">建立旅行計畫</Link>
        </div>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-500">
          <span className="rounded-full bg-sakura-500 text-white px-1.5 py-0.5 text-[10px] font-semibold tracking-wider">NEW</span>
          支援小紅書、Facebook、Google Maps、Instagram 連結
        </div>

        <div className="mx-auto mt-20 max-w-4xl">
          <div className="card p-10 md:p-14 text-left">
            <div className="grid grid-cols-3 gap-6 text-center">
              <Stat label="支援目的地" value="7" suffix="座城市" />
              <Stat label="商店資料" value="10+" suffix="家連鎖" />
              <Stat label="AI 模組" value="5" suffix="種推薦" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-ink-900">
          你需要的所有功能，一次到位
        </h2>
        <p className="mt-2 text-ink-500">為日本旅行族設計的極簡規劃工具集。</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-7 hover:shadow-lg transition-shadow relative">
              {"badge" in f && f.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-sakura-500 text-white px-2 py-0.5 text-[10px] font-semibold tracking-wider">
                  {f.badge}
                </span>
              )}
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-10 md:p-16 text-center bg-gradient-to-b from-white to-ink-50">
        <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-ink-900">
          準備好出發了嗎？
        </h2>
        <p className="mt-3 text-ink-500">建立你的第一個旅行計畫，只需要 30 秒。</p>
        <Link href="/trips/new" className="btn-primary mt-8">建立旅行計畫</Link>
      </section>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-semibold text-ink-900">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-ink-400">{suffix}</div>
      <div className="mt-2 text-sm text-ink-500">{label}</div>
    </div>
  );
}
