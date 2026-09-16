"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PickupSlotPicker } from "@/components/orders";
import { EmptyState, LoadingState, Notice } from "@/components/ui";
import { formatPkr } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth";
import type { MenuItem } from "@/db/schema";

type Slot = {
  id: number;
  label: string;
  booked: number;
  capacity: number;
  remaining: number;
  full: boolean;
  active: boolean;
};

type CartRow = { id: number; quantity: number; menuItem: MenuItem };

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartRow[]>([]);
  const [total, setTotal] = useState(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [payment, setPayment] = useState<"cash" | "wallet">("cash");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [orderPlacementOpen, setOrderPlacementOpen] = useState(false);
  const [orderPlacementWindow, setOrderPlacementWindow] = useState("8:30 AM – 5:20 PM");

  useEffect(() => {
    fetch("/api/checkout")
      .then((r) => r.json())
      .then((d) => {
        setCart(d.cart ?? []);
        setTotal(d.total ?? 0);
        setSlots(d.slots ?? []);
        setUser(d.user ?? null);
        setOrderPlacementOpen(d.orderPlacementOpen ?? false);
        setOrderPlacementWindow(d.orderPlacementWindow ?? "8:30 AM – 5:20 PM");
      })
      .finally(() => setLoading(false));
  }, []);

  async function confirm() {
    setError("");
    if (!orderPlacementOpen) {
      setError(`The cafeteria has been closed. Orders can only be placed between ${orderPlacementWindow}.`);
      return;
    }
    if (!slotId) {
      setError("Please select a pickup time.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pickupSlotId: slotId, paymentMethod: payment }),
    });
    const data = (await res.json()) as { error?: string; order?: { id: number } };
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Checkout failed.");
      return;
    }
    router.push(`/student/order/${data.order!.id}?confirmed=1`);
    router.refresh();
  }

  if (loading) return <LoadingState label="Preparing checkout…" />;

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          title="Your cart is empty."
          action={
            <Link href="/student/menu" className="btn-primary">
              Go to menu
            </Link>
          }
        />
      </main>
    );
  }

  const selected = slots.find((s) => s.id === slotId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-4xl text-navy">Checkout</h1>
      <p className="mt-2 text-ocean">Menu → Cart → Pickup time → Payment → Confirmation</p>

      {!orderPlacementOpen ? (
        <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold">The cafeteria has been closed</h3>
              <p className="mt-1 text-sm text-rose-800">
                Orders can only be placed and accepted between <strong>{orderPlacementWindow}</strong>.
                Order placement is currently closed.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mt-6 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl">1. Student information</h2>
        <p className="mt-2">{user?.name}</p>
        <p className="text-sm text-ocean">{user?.enrollmentId} · {user?.email}</p>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl">2. Ordered items</h2>
        <ul className="mt-3 space-y-2">
          {cart.map((row) => (
            <li key={row.id} className="flex justify-between text-sm">
              <span>
                {row.quantity}× {row.menuItem.name}
              </span>
              <span>{formatPkr(row.menuItem.pricePkr * row.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg font-bold">Total {formatPkr(total)}</p>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl">3. Pickup time</h2>
        <p className="mt-1 text-sm text-ocean">
          Orders are accepted daily between {orderPlacementWindow}. Full slots are disabled to prevent rush-hour overload.
        </p>
        <div className="mt-4">
          <PickupSlotPicker slots={slots} value={slotId} onChange={setSlotId} />
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl">4. Payment method</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`rounded-2xl border p-4 text-left ${payment === "cash" ? "border-ocean bg-ice" : "border-sky"}`}
            onClick={() => setPayment("cash")}
          >
            <p className="font-bold">Cash at cafeteria</p>
            <p className="text-sm text-ocean">Pay when you collect your slip order.</p>
          </button>
          <button
            type="button"
            className={`rounded-2xl border p-4 text-left ${payment === "wallet" ? "border-ocean bg-ice" : "border-sky"}`}
            onClick={() => setPayment("wallet")}
          >
            <p className="font-bold">University wallet</p>
            <p className="text-sm text-ocean">Balance {formatPkr(user?.walletBalance ?? 0)}</p>
          </button>
        </div>
      </section>

      {error ? (
        <div className="mt-4">
          <Notice kind="error">{error}</Notice>
        </div>
      ) : null}

      <button
        className={`mt-6 w-full ${
          orderPlacementOpen && !busy
            ? "btn-primary"
            : "rounded-full bg-slate-200 py-3.5 px-6 font-bold text-slate-500 cursor-not-allowed opacity-80"
        }`}
        disabled={busy || !orderPlacementOpen}
        type="button"
        onClick={confirm}
      >
        {busy
          ? "Confirming…"
          : !orderPlacementOpen
          ? `The cafeteria has been closed (Open ${orderPlacementWindow})`
          : `Confirm order${selected ? ` · pickup ${selected.label}` : ""}`}
      </button>
    </main>
  );
}
