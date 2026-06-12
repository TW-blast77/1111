import { NextResponse } from "next/server";

// POST /api/ai/recommend
// body: { age, gender, budget, destination, season? }
// returns: { picks: [{ name, category, price, reason }] }
//
// Demo implementation: returns curated picks; swap to OpenAI in prod.
// To enable real AI, set OPENAI_API_KEY and call chat.completions.

const CURATED: Record<string, Array<{ name: string; category: string; price: number; reason: string }>> = {
  default: [
    { name: "EVE QUICK 止痛藥", category: "藥妝", price: 1480, reason: "便宜好用，回國後值得囤貨。" },
    { name: "合利他命 EX Plus", category: "藥妝", price: 2680, reason: "上班族解疲勞首選。" },
    { name: "白色戀人 18 入", category: "零食", price: 1296, reason: "送禮體面、保存期長。" },
    { name: "Panasonic EH-NA0J 吹風機", category: "電器", price: 28000, reason: "退稅後比台灣便宜近 4 成。" },
    { name: "UNIQLO HEATTECH 內衣", category: "服飾", price: 990, reason: "冬天必備、日本款最新版。" },
  ],
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const picks = CURATED.default;
  return NextResponse.json({
    input: body,
    picks,
    note: "Demo response. Wire OPENAI_API_KEY for live recommendations.",
  });
}
