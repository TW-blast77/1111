"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TripStore, uid, Destination, Currency } from "@/lib/store";

const DESTINATIONS: Destination[] = ["東京", "大阪", "京都", "名古屋", "福岡", "沖繩", "北海道"];
const CURRENCIES: Currency[] = ["TWD", "JPY", "USD"];
const SIZES = [20, 24, 28, 30] as const;

export default function NewTrip() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    destination: "東京" as Destination,
    startDate: "",
    endDate: "",
    budget: 50000,
    currency: "TWD" as Currency,
    travelers: 1,
    luggageSize: 24 as 20 | 24 | 28 | 30,
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return;
    const id = uid();
    TripStore.upsert({ ...form, id, createdAt: Date.now() });
    router.push(`/trips/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-ink-500">建立旅行計畫</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">
        說說你的下趟旅程
      </h1>

      <form onSubmit={onSubmit} className="card mt-8 p-8 space-y-5">
        <Field label="旅行名稱">
          <input
            className="input"
            placeholder="例如：東京購物 5 日"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>

        <Field label="目的地">
          <select
            className="input"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value as Destination })}
          >
            {DESTINATIONS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="出發日期">
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </Field>
          <Field label="回程日期">
            <input
              type="date"
              className="input"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="預算">
              <input
                type="number"
                min={0}
                className="input"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="幣別">
            <select
              className="input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
            >
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="同行人數">
            <input
              type="number"
              min={1}
              className="input"
              value={form.travelers}
              onChange={(e) => setForm({ ...form, travelers: Number(e.target.value) })}
            />
          </Field>
          <Field label="行李箱尺寸">
            <select
              className="input"
              value={form.luggageSize}
              onChange={(e) => setForm({ ...form, luggageSize: Number(e.target.value) as 20 | 24 | 28 | 30 })}
            >
              {SIZES.map((s) => <option key={s} value={s}>{s} 吋</option>)}
            </select>
          </Field>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button type="submit" className="btn-primary">建立旅行</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
