"use client";

import { useState } from "react";
import { LUGGAGE_CAPACITY } from "@/lib/store";

const SIZES = [20, 24, 28, 30] as const;

export default function LuggageCalc() {
  const [size, setSize] = useState<20 | 24 | 28 | 30>(24);
  const [weight, setWeight] = useState(5); // kg
  const [volume, setVolume] = useState(30); // L

  const cap = LUGGAGE_CAPACITY[size];
  const wp = Math.min(100, (weight / cap.kg) * 100);
  const vp = Math.min(100, (volume / cap.liters) * 100);

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm text-ink-500">行李容量</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">
        行李箱容量計算
      </h1>

      <div className="card mt-8 p-8 space-y-6">
        <div>
          <label className="label">行李箱尺寸</label>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-xl py-3 text-sm transition ${
                  size === s ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                }`}
              >
                {s} 吋
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-500">
            容量約 {cap.liters} L · 航空重量上限約 {cap.kg} kg
          </p>
        </div>

        <div>
          <label className="label">目前重量 (kg)</label>
          <input type="number" className="input" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          <Bar pct={wp} warn={wp > 90} />
          <p className="mt-1 text-xs text-ink-500">{weight} / {cap.kg} kg</p>
        </div>

        <div>
          <label className="label">目前體積 (L)</label>
          <input type="number" className="input" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
          <Bar pct={vp} warn={vp > 90} />
          <p className="mt-1 text-xs text-ink-500">{volume} / {cap.liters} L · 剩餘 {Math.max(0, cap.liters - volume)} L</p>
        </div>

        {(wp > 100 || vp > 100) && (
          <div className="rounded-xl border border-sakura-500/40 bg-sakura-50 p-4 text-sm text-sakura-500">
            ⚠ 已超出行李箱限制，建議升級尺寸或減少採購。
          </div>
        )}
      </div>
    </div>
  );
}

function Bar({ pct, warn }: { pct: number; warn?: boolean }) {
  return (
    <div className="mt-3 h-2 rounded-full bg-ink-100">
      <div
        className={`h-2 rounded-full transition-all ${warn ? "bg-sakura-500" : "bg-ink-900"}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}
