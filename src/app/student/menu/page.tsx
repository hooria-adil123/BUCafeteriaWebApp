"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem } from "@/db/schema";
import { FoodCard, CategoryFilter } from "@/components/food";
import { LoadingState, Notice } from "@/components/ui";
import { CATEGORIES } from "@/lib/utils";

export default function MenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [windowLabel, setWindowLabel] = useState("8:30 AM – 5:30 PM");

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d: { items: MenuItem[] }) => setItems(d.items))
      .finally(() => setLoading(false));

    fetch("/api/test-hours")
      .then((r) => r.json())
      .then((d) => {
        setIsOpen(d.isOpen ?? true);
        setWindowLabel(d.window ?? "8:30 AM – 5:30 PM");
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (availableOnly && (!item.available || item.stockCount <= 0)) return false;
      if (query && !`${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [items, category, availableOnly, query]);

  async function add(item: MenuItem) {
    setBusyId(item.id);
    setError("");
    setMessage("");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuItemId: item.id, quantity: 1 }),
    });
    const data = (await res.json()) as { error?: string };
    setBusyId(null);
    if (!res.ok) {
      setError(data.error || "This item is currently unavailable.");
      return;
    }
    setMessage(`${item.name} added to cart.`);
    router.refresh();
  }

  if (loading) return <LoadingState label="Loading menu…" />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-navy">Cafeteria menu</h1>
          <p className="mt-2 text-ocean">Prices in PKR · availability updates as items sell out.</p>
        </div>
        <div
          className={`rounded-2xl border px-3.5 py-1.5 text-xs font-bold ${
            isOpen
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {isOpen
            ? `🟢 Orders Open (${windowLabel})`
            : `🔴 Cafeteria Closed (Hours: ${windowLabel})`}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          className="input md:max-w-sm"
          placeholder="Search biryani, burger, chai…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm font-bold text-navy">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Available only
        </label>
      </div>

      <div className="mt-4">
        <CategoryFilter
          categories={["All", ...CATEGORIES]}
          value={category}
          onChange={setCategory}
        />
      </div>

      {error ? (
        <div className="mt-4">
          <Notice kind="error">{error}</Notice>
        </div>
      ) : null}
      {message ? (
        <div className="mt-4">
          <Notice kind="success">{message}</Notice>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <FoodCard key={item.id} item={item} onAdd={add} busy={busyId === item.id} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-ocean">No items match your filters.</p>
      ) : null}
    </main>
  );
}
