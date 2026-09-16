"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusBadge, LoadingState, Notice } from "@/components/ui";
import { formatPkr, nextStatus, STATUS_LABELS } from "@/lib/utils";

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  totalPkr: number;
  paymentMethod: string;
  studentName: string;
  enrollmentId: string | null;
  slotLabel: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
};

const COLUMNS = ["placed", "accepted", "preparing", "ready", "picked_up"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [windowLabel, setWindowLabel] = useState("8:30 AM – 5:20 PM");

  const load = useCallback(async () => {
    const res = await fetch("/api/orders");
    const data = (await res.json()) as { orders?: Order[]; error?: string };
    if (!res.ok) setError(data.error || "Unable to load orders.");
    else setOrders(data.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 4000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setRole(d.user?.role ?? ""));

    fetch("/api/test-hours")
      .then((r) => r.json())
      .then((d) => {
        setIsOpen(d.isOpen ?? true);
        setWindowLabel(d.window ?? "8:30 AM – 5:20 PM");
      })
      .catch(() => {});
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Order[]> = {};
    for (const col of COLUMNS) map[col] = [];
    for (const order of orders) {
      (map[order.status] ?? (map[order.status] = [])).push(order);
    }
    return map;
  }, [orders]);

  async function advance(order: Order) {
    const status = nextStatus(order.status);
    if (!status) return;
    if (status === "accepted" && !isOpen) {
      setError(`The cafeteria has been closed. Orders can only be accepted between ${windowLabel}.`);
      return;
    }
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || "Unable to update order.");
      return;
    }
    setError("");
    await load();
  }

  const canUpdate = role === "staff" || role === "manager";

  if (loading) return <LoadingState label="Loading orders…" />;

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Incoming orders</h1>
      <p className="mt-2 text-ocean">
        Pickup time is shown first so staff can prepare for the next rush window. Orders can be placed and accepted between {windowLabel}.
      </p>

      {!isOpen ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
          <p className="font-bold">⚠️ The cafeteria has been closed</p>
          <p className="mt-1 text-sm text-rose-800">
            Orders can only be accepted between <strong>{windowLabel}</strong>. Accepting new orders is currently restricted.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Notice kind="error">{error}</Notice>
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 xl:grid-cols-5">
        {COLUMNS.map((col) => (
          <section key={col} className="rounded-3xl bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ocean">
                {STATUS_LABELS[col]}
              </h2>
              <span className="rounded-full bg-ice px-2 py-0.5 text-xs font-bold">
                {grouped[col]?.length ?? 0}
              </span>
            </div>
            <div className="space-y-3">
              {(grouped[col] ?? []).map((order) => {
                const next = nextStatus(order.status);
                const isAcceptAction = next === "accepted";
                const isBlocked = isAcceptAction && !isOpen;

                return (
                  <article key={order.id} className="rounded-2xl border border-sky p-3">
                    <p className="text-xs font-bold uppercase text-cyan">Pickup {order.slotLabel}</p>
                    <p className="font-display text-xl">{order.orderNumber}</p>
                    <p className="text-sm">
                      {order.studentName} · {order.enrollmentId}
                    </p>
                    <p className="mt-1 text-xs text-ocean">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <StatusBadge status={order.status} />
                      <span className="text-xs font-bold">{formatPkr(order.totalPkr)}</span>
                    </div>
                    {canUpdate && next ? (
                      <button
                        type="button"
                        disabled={isBlocked}
                        className={`mt-3 w-full py-2 text-sm ${
                          isBlocked
                            ? "rounded-full bg-slate-200 font-bold text-slate-500 cursor-not-allowed"
                            : "btn-primary"
                        }`}
                        onClick={() => advance(order)}
                        title={
                          isBlocked
                            ? `Cafeteria is closed. Orders can only be accepted between ${windowLabel}.`
                            : undefined
                        }
                      >
                        {isBlocked
                          ? `Closed (Accept ${windowLabel})`
                          : `Mark ${STATUS_LABELS[next]}`}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
