"use client";

export type Currency = "TWD" | "JPY" | "USD";
export type Destination =
  | "東京" | "大阪" | "京都" | "名古屋" | "福岡" | "沖繩" | "北海道";
export type Category = "藥妝" | "電器" | "零食" | "美妝" | "服飾";

export interface Trip {
  id: string;
  name: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  budget: number;
  currency: Currency;
  travelers: number;
  luggageSize: 20 | 24 | 28 | 30;
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  tripId: string;
  category: Category;
  name: string;
  brand?: string;
  price: number;       // JPY
  quantity: number;
  weight: number;      // grams per unit
  volume: number;      // cm^3 per unit
  note?: string;
  storeId?: string;
  bought: boolean;
}

const TRIPS_KEY = "jtp.trips.v1";
const ITEMS_KEY = "jtp.items.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const TripStore = {
  list(): Trip[] {
    return read<Trip[]>(TRIPS_KEY, []);
  },
  get(id: string): Trip | undefined {
    return this.list().find((t) => t.id === id);
  },
  upsert(trip: Trip) {
    const all = this.list().filter((t) => t.id !== trip.id);
    all.push(trip);
    write(TRIPS_KEY, all);
  },
  remove(id: string) {
    write(TRIPS_KEY, this.list().filter((t) => t.id !== id));
    write(ITEMS_KEY, this.items().filter((i) => i.tripId !== id));
  },
  items(): ShoppingItem[] {
    return read<ShoppingItem[]>(ITEMS_KEY, []);
  },
  itemsOf(tripId: string): ShoppingItem[] {
    return this.items().filter((i) => i.tripId === tripId);
  },
  upsertItem(item: ShoppingItem) {
    const all = this.items().filter((i) => i.id !== item.id);
    all.push(item);
    write(ITEMS_KEY, all);
  },
  removeItem(id: string) {
    write(ITEMS_KEY, this.items().filter((i) => i.id !== id));
  },
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Currency conversion (static demo rates; replace with live API in prod)
export const RATES = { TWD: 1, JPY: 0.21, USD: 32.5 } as const; // 1 unit -> TWD
export function toTWD(amount: number, currency: Currency) {
  return Math.round(amount * RATES[currency]);
}

// Luggage capacity (liters & kg) per inch size
export const LUGGAGE_CAPACITY: Record<number, { liters: number; kg: number }> = {
  20: { liters: 40, kg: 7 },   // cabin
  24: { liters: 65, kg: 23 },
  28: { liters: 95, kg: 23 },
  30: { liters: 115, kg: 32 },
};

// Japan tax-free threshold (consumption tax 10%)
export const JP_TAX_RATE = 0.10;
export const TAX_FREE_THRESHOLD = 5000; // JPY (general + consumables combined, simplified)
