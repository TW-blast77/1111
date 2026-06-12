# Japan Trip Shopping Planner — PRD / 系統架構 / Schema / API

> 日本旅行購物規劃助手。極簡無印風、Apple × Notion 質感。MVP 版本以前端 + localStorage 跑得動，後續可無痛接 Supabase。

---

## 1. 專案架構

```
.
├── app/
│   ├── layout.tsx, page.tsx          # Home + global shell
│   ├── globals.css                    # Tailwind base
│   ├── dashboard/page.tsx             # 我的旅行
│   ├── trips/
│   │   ├── new/page.tsx               # 建立旅行
│   │   └── [id]/page.tsx              # 旅行詳情（清單 + 預算 + 退稅 + 行李）
│   ├── stores/page.tsx                # 商店資料庫
│   ├── tools/
│   │   ├── tax/page.tsx               # 退稅試算器
│   │   └── luggage/page.tsx           # 行李容量計算
│   ├── api/
│   │   ├── health/route.ts            # GET /api/health
│   │   └── ai/recommend/route.ts      # POST /api/ai/recommend
│   ├── robots.ts, sitemap.ts          # SEO
├── components/                        # Nav, Footer
├── lib/store.ts                       # localStorage / domain models
├── supabase/schema.sql                # Postgres schema + RLS
├── docs/PRD.md                        # 本文件
├── tailwind.config.ts, postcss.config.js
├── next.config.js, tsconfig.json
└── vercel.json
```

## 2. 頁面 / Sitemap

```
/                       首頁（Hero + 功能介紹 + CTA）
/dashboard              我的旅行卡片牆
/trips/new              新建旅行表單
/trips/[id]             旅行詳情（清單 / 預算進度 / 退稅 / 行李）
/stores                 日本商店資料庫（10 家連鎖）
/tools/tax              日本退稅試算器
/tools/luggage          行李箱容量計算
/api/health             健康檢查
/api/ai/recommend       AI 商品推薦（POST）
```

### User Flow

1. 訪客進首頁 → 點「開始規劃」→ `/dashboard`
2. 空 state 引導 → `/trips/new` 填表 → 自動跳 `/trips/[id]`
3. 旅行詳情可即時新增商品；同時看到預算/重量/退稅儀表
4. 工具區獨立可用（不需要建立旅行）

## 3. Database Schema / ERD

完整 SQL 在 `supabase/schema.sql`，包含：

| Table | 說明 |
|---|---|
| profiles | 使用者資料延伸 auth.users |
| trips | 旅行計畫 |
| shopping_lists | 清單分組（一旅行可多清單） |
| shopping_items | 商品（含分類/品牌/價格/重量/體積） |
| stores | 日本商店資料 |
| tax_rules | 稅率設定檔（可隨時更新） |
| budgets | 預算（一旅行一筆） |
| luggage | 行李配置 |
| favorites | 收藏（商品/商店/路線） |
| ai_recommendations | AI 推薦紀錄 |
| itineraries | 每日購物行程 |
| shared_links | 公開分享 token |

RLS 已開啟，所有 user-owned 表用 `auth.uid()` 控制。

### ERD (text)

```
auth.users 1—1 profiles
auth.users 1—N trips 1—N shopping_lists 1—N shopping_items N—1 stores
trips 1—1 budgets
trips 1—N luggage
trips 1—N itineraries
trips 1—N shared_links
auth.users 1—N favorites
auth.users 1—N ai_recommendations N—1 trips
```

## 4. API 文件

REST via Next.js Route Handler。MVP 已提供：

- `GET /api/health` → `{ ok, ts }`
- `POST /api/ai/recommend` body: `{ age, gender, budget, destination, season? }` → `{ picks: [{ name, category, price, reason }] }`

擴充規劃（接 Supabase 後）：

| Method | Path | 說明 |
|---|---|---|
| GET | /api/trips | 列出當前 user 的旅行 |
| POST | /api/trips | 建立旅行 |
| GET | /api/trips/:id | 旅行詳情 |
| PUT | /api/trips/:id | 更新旅行 |
| DELETE | /api/trips/:id | 刪除旅行 |
| GET | /api/trips/:id/items | 取得清單 |
| POST | /api/trips/:id/items | 新增商品 |
| PUT | /api/items/:id | 更新商品 |
| DELETE | /api/items/:id | 刪除商品 |
| POST | /api/ai/budget | AI 預算分析 |
| POST | /api/ai/luggage | AI 行李分析 |
| POST | /api/ai/itinerary | AI 行程規劃 |
| POST | /api/share/:tripId | 產生公開連結 |
| GET | /api/share/:token | 讀公開連結 |
| GET | /api/stores | 商店列表 |
| GET | /api/tax/rules | 稅率規則 |

錯誤格式：`{ error: { code, message } }`，HTTP 400/401/403/404/422/500。

## 5. UI / Design System

- 色彩：`ink-50 → ink-900` 灰階主色；`sakura-*` 為強調色
- 字體：Hiragino Sans, Noto Sans JP/TC, system-ui
- 元件：`.card / .btn-primary / .btn-ghost / .input / .label`
- 動效：`fade-in` 進場、hover shadow 升起
- RWD：mobile 1 欄 → tablet 2 欄 → desktop 3 欄

### Component Tree

```
RootLayout
├── Nav
├── main
│   ├── (Home) Hero · Features · CTA
│   ├── (Dashboard) TripCard[]
│   ├── (Trip Detail) SummaryCard × 3 · Category Breakdown · AddItemForm · Item[]
│   ├── (Tools) Tax / Luggage 計算器
│   └── (Stores) StoreCard[]
└── Footer
```

## 6. SEO

- Metadata API 在 `app/layout.tsx` 設定 OG / locale
- `app/sitemap.ts`、`app/robots.ts` 自動產出
- 中文語意化 heading，Lighthouse 友善

## 7. 安全性

- Supabase Auth + RLS（schema 已含 policy）
- Next.js Route Handler 預設 CSRF-safe（same-site）
- 表單 input 全做 type/min validation
- 對外 API 建議加上 rate limit（Vercel Edge Middleware / Upstash Redis）

## 8. AI 功能設計

| 模組 | Endpoint | Prompt 結構 |
|---|---|---|
| 購物推薦 | /api/ai/recommend | system: 日本購物達人；user: age/gender/budget/dest |
| 預算分析 | /api/ai/budget | items 列表 + 預算 → 建議刪減 |
| 行李分析 | /api/ai/luggage | items 重量/體積 → 警示與建議 |
| 行程規劃 | /api/ai/itinerary | dest/days/items → 每日商店路線 |
| 伴手禮推薦 | /api/ai/souvenir | 對象 / 預算 → 推薦清單 |

實作：以 `OPENAI_API_KEY` 串接 `chat.completions`，模型 `gpt-4o-mini`。

## 9. 環境變數

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
NEXT_PUBLIC_GOOGLE_MAPS_KEY
```

## 10. 部署流程（Vercel）

1. Fork / Push 至 GitHub
2. Vercel → Add New Project → 匯入 repo
3. Framework 自動偵測 Next.js
4. 環境變數貼上（如未設定，MVP 仍可跑，localStorage 模式）
5. Deploy → 取得 `*.vercel.app` 網址

Supabase：

1. 建立專案 → SQL Editor 貼上 `supabase/schema.sql`
2. Auth → 啟用 Email / Google / Apple Provider
3. Storage → 建立 `public` bucket（商品圖）

## 11. MVP / 商業化 / 擴充

**MVP（本 repo 現況）**：旅行 CRUD、購物清單、預算/退稅/行李即時計算、商店資料庫、AI demo endpoint、SEO/RWD。

**商業化**：Supabase Auth + RLS、Stripe Pro 訂閱、OpenAI 真實串接、Google Maps 路線、多語系（i18n routing）、PDF/CSV 匯出。

**未來擴充**：
- 日本即時匯率（Fixer / Open Exchange Rates）
- 藥妝比價爬蟲
- Donki 優惠券系統
- 退稅新制即時更新
- 行李超重 AI 預測
- 季節限定商品追蹤
- 東京/大阪商圏購物地圖
- 代購利潤計算器
- 必買即時排行榜
- 社群開箱與分享動態
