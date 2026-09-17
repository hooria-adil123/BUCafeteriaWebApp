"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CartItemRow } from "@/components/food";
import { EmptyState, LoadingState, Notice } from "@/components/ui";
import { formatPkr } from "@/lib/utils";
import type { MenuItem } from "@/db/schema";

type Row = { id: number; quantity: number; menuItem: MenuItem };

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [windowLabel, setWindowLabel] = useState("8:30 AM – 5:30 PM");

  async function load() {
    const res = await fetch("/api/cart");
    const data = (await res.json()) as { items: Row[]; total: number; error?: string };
    if (!res.ok) {
      setError(data.error || "Unable to load cart.");
    } else {
      setItems(data.items);
      setTotal(data.total);
    }

    try {
      const hRes = await fetch("/api/cafeteria-hours");
      const hData = await hRes.json();
      setIsOpen(hData.isOpen ?? true);
      setWindowLabel(hData.window ?? "8:30 AM – 5:30 PM");
    } catch {}

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function update(id: number, quantity: number) {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity }),
    });
    const data = (await res.json()) as { items: Row[]; total: number };
    setItems(data.items);
    setTotal(data.total);
    router.refresh();
  }

  if (loading) return <LoadingState label="Loading cart…" />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-4xl text-navy">Your cart</h1>

      {!isOpen ? (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
          <p className="font-bold">⚠️ The cafeteria has been closed</p>
          <p className="mt-1 text-sm text-rose-800">
            Orders are only placed and accepted between <strong>{windowLabel}</strong>. You can review items now, but checkout will open during operating hours.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Notice kind="error">{error}</Notice>
        </div>
      ) : null}
      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Your cart is empty."
            body="Add available items from the cafeteria menu to start a pre-order."
            action={
              <Link href="/student/menu" className="btn-primary">
                Continue shopping
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {items.map((row) => (
              <CartItemRow
                key={row.id}
                name={row.menuItem.name}
                imageUrl={row.menuItem.imageUrl}
                price={row.menuItem.pricePkr}
                quantity={row.quantity}
                available={row.menuItem.available && row.menuItem.stockCount > 0}
                onInc={() => update(row.id, row.quantity + 1)}
                onDec={() => update(row.id, row.quantity - 1)}
                onRemove={() => update(row.id, 0)}
              />
            ))}
          </div>
          <div className="mt-6 rounded-3xl bg-white p-5">
            <div className="flex items-center justify-between text-lg font-bold text-navy">
              <span>Total</span>
              <span>{formatPkr(total)}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/student/menu" className="btn-ghost">
                Continue shopping
              </Link>
              <a href="/student/checkout" className="btn-primary">
                Proceed to checkout
              </a>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
