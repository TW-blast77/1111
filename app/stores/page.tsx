import Link from "next/link";

const STORES = [
  { name: "Don Quijote", jp: "ドン・キホーテ", tag: "綜合折扣", hot: "藥妝 / 零食 / 電器", taxFree: true, hours: "多數 24h" },
  { name: "Matsumoto Kiyoshi", jp: "マツモトキヨシ", tag: "藥妝連鎖", hot: "EVE / 合利他命", taxFree: true, hours: "10:00–22:00" },
  { name: "Sugi Drug", jp: "スギ薬局", tag: "藥妝", hot: "處方藥妝", taxFree: true, hours: "10:00–22:00" },
  { name: "Bic Camera", jp: "ビックカメラ", tag: "家電量販", hot: "吹風機 / 相機", taxFree: true, hours: "10:00–22:00" },
  { name: "Yodobashi Camera", jp: "ヨドバシカメラ", tag: "家電量販", hot: "電子鍋 / 耳機", taxFree: true, hours: "9:30–22:00" },
  { name: "Loft", jp: "ロフト", tag: "雜貨", hot: "文具 / 設計小物", taxFree: true, hours: "10:30–21:00" },
  { name: "Tokyu Hands", jp: "東急ハンズ", tag: "生活雜貨", hot: "手作 / 美容", taxFree: true, hours: "10:00–21:00" },
  { name: "UNIQLO", jp: "ユニクロ", tag: "服飾", hot: "HEATTECH / Airism", taxFree: true, hours: "11:00–21:00" },
  { name: "GU", jp: "ジーユー", tag: "平價服飾", hot: "潮流基本款", taxFree: true, hours: "11:00–21:00" },
  { name: "Muji", jp: "無印良品", tag: "生活風格", hot: "文具 / 收納", taxFree: true, hours: "10:00–21:00" },
];

export default function StoresPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-500">日本商店資料庫</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">必逛日本連鎖</h1>
        <p className="mt-2 text-sm text-ink-500">藥妝、電器、雜貨、服飾，一次掌握。</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {STORES.map((s) => (
          <div key={s.name} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-ink-900">{s.name}</h3>
                <p className="text-xs text-ink-400">{s.jp}</p>
              </div>
              {s.taxFree && (
                <span className="rounded-full bg-sakura-50 px-2.5 py-1 text-xs text-sakura-500">
                  免稅
                </span>
              )}
            </div>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-400">分類</span>
                <span className="text-ink-700">{s.tag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">熱門</span>
                <span className="text-ink-700">{s.hot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">營業</span>
                <span className="text-ink-700">{s.hours}</span>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(s.name + " Japan")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost mt-5 w-full text-xs"
            >
              在 Google Maps 查看
            </a>
          </div>
        ))}
      </div>

      <div className="card p-8 text-center">
        <p className="text-ink-500 text-sm">想把這些店加入你的旅行路線？</p>
        <Link href="/dashboard" className="btn-primary mt-4">回我的旅行</Link>
      </div>
    </div>
  );
}
