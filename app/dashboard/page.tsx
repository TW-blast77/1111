"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TripStore, Trip } from "@/lib/store";

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    setTrips(TripStore.list().sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">我的旅行</h1>
        </div>
        <Link href="/trips/new" className="btn-primary">+ 新增旅行</Link>
      </div>

      {trips.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl">🗾</div>
          <h2 className="mt-4 text-lg font-semibold text-ink-900">還沒有旅行計畫</h2>
          <p className="mt-1 text-sm text-ink-500">建立第一個旅程，開始規劃你的日本購物吧。</p>
          <Link href="/trips/new" className="btn-primary mt-6">建立旅行計畫</Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const days = Math.max(
    1,
    Math.round(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="card p-6 hover:shadow-lg transition-shadow block"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-400">
            {trip.destination}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink-900">{trip.name}</h3>
        </div>
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-600">
          {days} 天
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-ink-400">出發</div>
          <div className="text-ink-800">{trip.startDate}</div>
        </div>
        <div>
          <div className="text-xs text-ink-400">回程</div>
          <div className="text-ink-800">{trip.endDate}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-ink-400">預算</div>
          <div className="text-ink-800">
            {trip.currency} {trip.budget.toLocaleString()}
          </div>
        </div>
      </div>
    </Link>
  );
}
