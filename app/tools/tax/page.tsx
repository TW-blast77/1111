"use client";

import { useState } from "react";
import { JP_TAX_RATE, TAX_FREE_THRESHOLD } from "@/lib/store";

export default function TaxCalc() {
  const [amount, setAmount] = useState(10000);

  const preTax = Math.round(amount / (1 + JP_TAX_RATE));
  const tax = amount - preTax;
  const refund = amount >= TAX_FREE_THRESHOLD ? tax : 0;
  const afterRefund = amount - refund;

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm text-ink-500">退稅試算</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">
        日本退稅試算器
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        日本目前消費稅 10%。同店單日同類滿 ¥5,000 可申請免稅。
      </p>

      <div className="card mt-8 p-8 space-y-6">
        <div>
          <label className="label">商品金額（含稅 / JPY）</label>
          <input
            type="number"
            className="input text-2xl py-4"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <Stat label="稅前價格" value={`¥${preTax.toLocaleString()}`} />
          <Stat label="稅額 (10%)" value={`¥${tax.toLocaleString()}`} />
          <Stat
            label="退稅金額"
            value={`¥${refund.toLocaleString()}`}
            hint={amount < TAX_FREE_THRESHOLD ? "尚未達 ¥5,000 門檻" : "符合退稅"}
          />
          <Stat label="退稅後實付" value={`¥${afterRefund.toLocaleString()}`} highlight />
        </div>
      </div>

      <div className="mt-6 text-xs text-ink-400 leading-relaxed">
        * 規則簡化版。實際以日本國稅廳公告為準，部分商品（耗品 / 一般物品）有不同包裝規定。
      </div>
    </div>
  );
}

function Stat({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "bg-ink-900 text-white border-ink-900" : "bg-ink-50 border-ink-200"}`}>
      <div className={`text-xs uppercase tracking-wider ${highlight ? "text-white/60" : "text-ink-400"}`}>{label}</div>
      <div className="mt-1.5 text-xl font-semibold">{value}</div>
      {hint && <div className={`mt-1 text-xs ${highlight ? "text-white/70" : "text-ink-500"}`}>{hint}</div>}
    </div>
  );
}
