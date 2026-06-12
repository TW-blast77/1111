import { NextResponse } from "next/server";

// POST /api/guides/analyze
// body: { url?: string, text?: string }
// Returns a structured guide based on real fetched content + AI/heuristic extraction.

export const runtime = "nodejs";
export const maxDuration = 30;

interface Source {
  url: string;
  host: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  fetched: boolean;
  reason?: string;
}

const KNOWN_AREAS = [
  "新宿","澀谷","渋谷","原宿","池袋","上野","淺草","浅草","銀座","六本木",
  "秋葉原","秋叶原","中目黑","代官山","表參道","表参道","台場","台场","築地","築地市場",
  "心齋橋","心斎橋","難波","なんば","梅田","道頓堀","道顿堀","天王寺","通天閣",
  "京都","嵐山","祇園","祗园","清水寺","錦市場",
  "札幌","小樽","函館","旭川","富良野",
  "福岡","博多","天神","中洲",
  "沖繩","那霸","那覇","國際通","国际通",
  "名古屋","栄","名駅",
  "東京","大阪","北海道",
];

const STORE_KEYWORDS = [
  "Don Quijote","ドンキ","ドンキホーテ","ドン・キホーテ","唐吉訶德","唐吉軻德","驚安",
  "Matsumoto Kiyoshi","松本清","マツキヨ","マツモトキヨシ","Matsukiyo",
  "Sugi Drug","杉藥局","スギ薬局",
  "Bic Camera","ビックカメラ","ビックロ",
  "Yodobashi","ヨドバシ","Yodobashi Camera",
  "Loft","ロフト","Tokyu Hands","東急ハンズ",
  "UNIQLO","ユニクロ","GU","ジーユー","MUJI","Muji","無印良品","無印",
  "PLAZA","プラザ","Cosme Kitchen","Ainz Tulpe","ainz","アインズ",
  "唐吉訶德","Welcia","ウエルシア","Sundrug","サンドラッグ",
  "LABI","ラビ","Edion","エディオン",
  "GBL","KIDDY LAND","Pokemon Center","ポケモンセンター",
  "ABC-MART","ABCマート","ZARA","H&M","BEAMS","UNITED ARROWS",
];

async function fetchPage(url: string) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JapanTripPlannerBot/1.0)",
        "Accept-Language": "zh-TW,zh,ja,en;q=0.7",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return { html: "", status: res.status };
    const html = await res.text();
    return { html, status: 200 };
  } catch (e: unknown) {
    return { html: "", status: 0, error: String(e) };
  } finally {
    clearTimeout(t);
  }
}

function pick(html: string, re: RegExp) {
  return html.match(re)?.[1]?.trim();
}

function parseMeta(html: string) {
  return {
    title:
      pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      pick(html, /<title>([^<]+)<\/title>/i) || "",
    description:
      pick(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || "",
    image: pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || "",
    siteName: pick(html, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) || "",
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function detectArea(text: string) {
  const hits = new Set<string>();
  for (const a of KNOWN_AREAS) if (text.includes(a)) hits.add(a);
  return Array.from(hits);
}

function detectStores(text: string) {
  const hits = new Set<string>();
  for (const s of STORE_KEYWORDS) if (text.includes(s)) hits.add(s);
  return Array.from(hits);
}

function extractPrices(text: string) {
  const set = new Set<string>();
  const re = /[¥￥]\s?[\d,]{2,8}|[\d,]{2,8}\s?円|JPY\s?[\d,]{2,8}/gi;
  let m;
  while ((m = re.exec(text)) !== null) set.add(m[0]);
  return Array.from(set).slice(0, 12);
}

function getHost(url: string) {
  try { return new URL(url).host.replace(/^www\./, ""); } catch { return ""; }
}

function buildMapPoint(name: string, area?: string) {
  const q = [name, area, "Japan"].filter(Boolean).join(" ");
  return {
    name,
    area: area || "",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
    embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`,
  };
}

async function aiExtract(input: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const sys = `你是日本購物攻略結構化助手。從文字中萃取 JSON：
{ "title": string, "summary": string, "area": string,
  "stores": [{ "name": string, "area"?: string, "tip"?: string }],
  "products": [{ "name": string, "price"?: string, "store"?: string }],
  "tips": string[]
}
僅輸出 JSON 不要其他文字。`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: input.slice(0, 6000) },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const url: string = (body.url || "").trim();
  const pastedText: string = (body.text || "").trim();

  if (!url && !pastedText) {
    return NextResponse.json(
      { error: { code: "bad_request", message: "url or text required" } },
      { status: 400 }
    );
  }

  const host = url ? getHost(url) : "";
  let pageText = "";
  let meta = { title: "", description: "", image: "", siteName: "" };
  let fetched = false;
  let reason = "";

  if (url) {
    const r = await fetchPage(url);
    if (r.status === 200 && r.html) {
      meta = parseMeta(r.html);
      pageText = stripHtml(r.html).slice(0, 12000);
      fetched = true;
    } else {
      reason = r.status === 0 ? "fetch timeout/blocked" : `HTTP ${r.status}`;
    }
  }

  const corpus = [meta.title, meta.description, pageText, pastedText].filter(Boolean).join("\n");
  const areas = detectArea(corpus);
  const storeHits = detectStores(corpus);
  const prices = extractPrices(corpus);
  const primaryArea = areas[0] || "日本";

  // Try AI first; fallback to heuristic
  const ai = await aiExtract(corpus || `從 ${host} 取得攻略。`);

  const stores = (ai?.stores?.length
    ? ai.stores
    : storeHits.map((s) => ({ name: s, area: primaryArea }))
  ).slice(0, 8).map((s: { name: string; area?: string; tip?: string }) =>
    ({ ...buildMapPoint(s.name, s.area || primaryArea), tip: s.tip })
  );

  const products = (ai?.products?.length
    ? ai.products
    : prices.map((p) => ({ name: "推薦商品", price: p }))
  ).slice(0, 12);

  const tips = ai?.tips?.length ? ai.tips.slice(0, 6) : autoTips(corpus, storeHits);

  const source: Source = {
    url,
    host,
    title: meta.title || ai?.title || guessTitle(host, pastedText),
    description: meta.description || "",
    image: meta.image || "",
    siteName: meta.siteName || host,
    fetched,
    reason: reason || undefined,
  };

  return NextResponse.json({
    source,
    guide: {
      title: source.title || "日本購物攻略",
      summary:
        ai?.summary ||
        meta.description ||
        (pastedText ? pastedText.slice(0, 200) : "已從連結擷取內容，並用 AI 萃取出商店地圖、商品與重點建議。"),
      area: ai?.area || primaryArea,
      coverImage: meta.image,
      stores,
      products,
      tips,
    },
    meta: {
      ai: !!ai,
      fetched,
      areasDetected: areas,
      pricesDetected: prices,
    },
  });
}

function autoTips(text: string, stores: string[]): string[] {
  const tips: string[] = [];
  if (stores.some((s) => /Donki|ドンキ|唐吉|驚安/i.test(s)))
    tips.push("Donki 紅標商品通常為全店最低；同款建議先比松本清。");
  if (stores.some((s) => /Bic|Yodobashi|ビック|ヨドバシ/i.test(s)))
    tips.push("家電帶護照於櫃台直接 8% 退稅，再加會員 5% 點數。");
  if (stores.some((s) => /UNIQLO|ユニクロ/i.test(s)))
    tips.push("UNIQLO 日本款 HEATTECH 比海外款更輕薄。");
  if (/退稅|免稅|tax-free/i.test(text))
    tips.push("同店同日購物滿 ¥5,000 可退 10% 消費稅，準備好護照。");
  if (!tips.length) tips.push("整理出購物清單後可加入旅程，方便預算與行李控管。");
  return tips;
}

function guessTitle(host: string, text: string): string {
  if (text) return text.slice(0, 40);
  if (/xiaohongshu|xhs/i.test(host)) return "小紅書購物攻略";
  if (/facebook|fb\./i.test(host)) return "Facebook 分享攻略";
  if (/google|maps/i.test(host)) return "Google 推薦店家";
  if (/instagram|threads/i.test(host)) return "IG / Threads 分享";
  return "日本購物攻略";
}
