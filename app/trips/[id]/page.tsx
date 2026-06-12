"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  TripStore, Trip, ShoppingItem, Category, uid,
  toTWD, LUGGAGE_CAPACITY, JP_TAX_RATE, TAX_FREE_THRESHOLD,
} from "@/lib/store";

const CATEGORIES: Category[] = ["藥妝", "電器", "零食", "美妝", "服飾"];
const CATEGORY_COLOR: Record<Category, string> = {
  藥妝: "bg-sakura-100 text-sakura-500",
  電器: "bg-ink-100 text-ink-700",
  零食: "bg-amber-100 text-amber-700",
  美妝: "bg-rose-100 text-rose-700",
  服飾: "bg-sky-100 text-sky-700",
};

export default function TripDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [filter, setFilter] = useState<Category | "全部">("全部");

  function refresh() {
    const t = TripStore.get(params.id);
    if (!t) { router.push("/dashboard"); return; }
    setTrip(t);
    setItems(TripStore.itemsOf(t.id));
  }

  useEffect(() => { refresh(); }, [params.id]);

  const totals = useMemo(() => {
    const totalJpy = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalWeight = items.reduce((s, i) => s + i.weight * i.quantity, 0);
    const totalVolume = items.reduce((s, i) => s + i.volume * i.quantity, 0);
    const totalTwd = Math.round(totalJpy * 0.21);
    const taxRefund = totalJpy >= TAX_FREE_THRESHOLD
      ? Math.round(totalJpy * JP_TAX_RATE / (1 + JP_TAX_RATE))
      : 0;
    const byCategory = CATEGORIES.map((c) => ({
      category: c,
      total: items.filter((i) => i.category === c).reduce((s, i) => s + i.price * i.quantity, 0),
    }));
    return { totalJpy, totalTwd, totalWeight, totalVolume, taxRefund, byCategory };
  }, [items]);

  if (!trip) return null;

  const budgetInJpy = trip.currency === "JPY"
    ? trip.budget
    : trip.currency === "TWD"
      ? Math.round(trip.budget / 0.21)
      : Math.round(trip.budget * 155);
  const budgetPct = Math.min(100, Math.round((totals.totalJpy / Math.max(1, budgetInJpy)) * 100));

  const cap = LUGGAGE_CAPACITY[trip.luggageSize];
  const weightPct = Math.min(100, Math.round((totals.totalWeight / 1000 / cap.kg) * 100));
  const volumePct = Math.min(100, Math.round((totals.totalVolume / 1000 / cap.liters) * 100));

  const shown = filter === "全部" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">{trip.destination} · {trip.travelers} 人</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">{trip.name}</h1>
          <p className="mt-1 text-sm text-ink-500">{trip.startDate} → {trip.endDate}</p>
        </div>
        <button
          onClick={() => { if (confirm("確定刪除這個旅行？")) { TripStore.remove(trip.id); router.push("/dashboard"); } }}
          className="btn-ghost text-xs"
        >
          刪除
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard title="預算進度" value={`${budgetPct}%`}>
          <Progress pct={budgetPct} />
          <p className="mt-2 text-xs text-ink-500">
            已規劃 ¥{totals.totalJpy.toLocaleString()} / ¥{budgetInJpy.toLocaleString()}
          </p>
        </SummaryCard>

        <SummaryCard title="行李重量" value={`${(totals.totalWeight / 1000).toFixed(1)} / ${cap.kg} kg`}>
          <Progress pct={weightPct} warn={weightPct > 90} />
          <p className="mt-2 text-xs text-ink-500">{trip.luggageSize} 吋行李箱</p>
        </SummaryCard>

        <SummaryCard title="退稅試算" value={`¥${totals.taxRefund.toLocaleString()}`}>
          <p className="text-xs text-ink-500">
            {totals.totalJpy >= TAX_FREE_THRESHOLD
              ? "符合退稅門檻（¥5,000+）"
              : `差 ¥${(TAX_FREE_THRESHOLD - totals.totalJpy).toLocaleString()} 達退稅門檻`}
          </p>
        </SummaryCard>
      </div>

      {/* Category breakdown */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-ink-900">分類預算分布</h3>
        <div className="mt-4 space-y-3">
          {totals.byCategory.map((c) => {
            const pct = totals.totalJpy ? Math.round((c.total / totals.totalJpy) * 100) : 0;
            return (
              <div key={c.category}>
                <div className="flex justify-between text-xs text-ink-600">
                  <span>{c.category}</span>
                  <span>¥{c.total.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-ink-100">
                  <div className="h-1.5 rounded-full bg-ink-900" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["全部", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                filter === c ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <AddItemForm tripId={trip.id} onSaved={refresh} />

      <div className="space-y-3">
        {shown.length === 0 ? (
          <div className="card p-10 text-center text-sm text-ink-500">
            還沒有商品 — 從上方加入第一個吧。
          </div>
        ) : (
          shown.map((item) => (
            <div key={item.id} className="card p-5 flex items-center gap-4">
              <span className={`rounded-full px-2.5 py-1 text-xs ${CATEGORY_COLOR[item.category]}`}>
                {item.category}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink-900 truncate">{item.name}</div>
                <div className="text-xs text-ink-500">
                  {item.brand && `${item.brand} · `}
                  ¥{item.price.toLocaleString()} × {item.quantity}
                  {item.weight ? ` · ${item.weight}g` : ""}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-ink-900">
                  ¥{(item.price * item.quantity).toLocaleString()}
                </div>
                <button
                  onClick={() => { TripStore.removeItem(item.id); refresh(); }}
                  className="mt-1 text-xs text-ink-400 hover:text-sakura-500"
                >
                  移除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, children }: { title: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="card p-6">
      <p className="text-xs uppercase tracking-wider text-ink-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Progress({ pct, warn }: { pct: number; warn?: boolean }) {
  return (
    <div className="h-1.5 rounded-full bg-ink-100">
      <div
        className={`h-1.5 rounded-full transition-all ${warn ? "bg-sakura-500" : "bg-ink-900"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function AddItemForm({ tripId, onSaved }: { tripId: string; onSaved: () => void }) {
  const [form, setForm] = useState({
    category: "藥妝" as Category,
    name: "",
    brand: "",
    price: 0,
    quantity: 1,
    weight: 0,
    volume: 0,
  });

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    TripStore.upsertItem({
      id: uid(),
      tripId,
      bought: false,
      ...form,
    });
    setForm({ category: form.category, name: "", brand: "", price: 0, quantity: 1, weight: 0, volume: 0 });
    onSaved();
  }

  return (
    <form onSubmit={add} className="card p-5 grid gap-3 md:grid-cols-12 md:items-end">
      <div className="md:col-span-2">
        <label className="label">分類</label>
        <select
          className="input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="md:col-span-3">
        <label className="label">商品</label>
        <input className="input" placeholder="EVE 止痛藥" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <label className="label">品牌</label>
        <input className="input" placeholder="SSP" value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })} />
      </div>
      <div className="md:col-span-1">
        <label className="label">¥</label>
        <input type="number" className="input" value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
      </div>
      <div className="md:col-span-1">
        <label className="label">數量</label>
        <input type="number" min={1} className="input" value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
      </div>
      <div className="md:col-span-1">
        <label className="label">g</label>
        <input type="number" className="input" value={form.weight}
          onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} />
      </div>
      <div className="md:col-span-1">
        <label className="label">cm³</label>
        <input type="number" className="input" value={form.volume}
          onChange={(e) => setForm({ ...form, volume: Number(e.target.value) })} />
      </div>
      <div className="md:col-span-1">
        <button className="btn-primary w-full">加入</button>
      </div>
    </form>
  );
}
