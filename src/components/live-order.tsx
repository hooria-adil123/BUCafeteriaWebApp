"use client";

import { useEffect, useRef, useState } from "react";
import { OrderSlip, OrderTracker } from "@/components/orders";
import { formatTime } from "@/lib/utils";

type Payload = {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    totalPkr: number;
    paymentMethod: string;
    createdAt: string;
    student?: { name: string; enrollmentId: string | null };
    slot?: { label: string };
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
  };
};

export function LiveOrderView({
  initial,
  studentName,
  enrollmentId,
}: {
  initial: Payload["order"];
  studentName: string;
  enrollmentId?: string | null;
}) {
  const [order, setOrder] = useState(initial);
  const [lastUpdated, setLastUpdated] = useState(new Date(initial.createdAt));
  const [syncError, setSyncError] = useState(false);
  const orderRef = useRef(order);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const res = await fetch(`/api/orders/${orderRef.current.id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Unable to refresh order");
        const data = (await res.json()) as Payload;
        if (active && data.order) {
          setOrder(data.order);
          setLastUpdated(new Date());
          setSyncError(false);
        }
      } catch {
        if (active) setSyncError(true);
      }
    }

    void refresh();
    const t = window.setInterval(() => void refresh(), 3000);
    return () => {
      active = false;
      window.clearInterval(t);
    };
  }, []);

  return (
    <>
      <div className="mt-6 no-print">
        <OrderTracker status={order.status} />
        <p className={`mt-2 text-right text-xs ${syncError ? "text-red-700" : "text-ocean"}`} role="status">
          {syncError ? "Live update unavailable. Retrying…" : `Last checked ${formatTime(lastUpdated)}`}
        </p>
      </div>
      <div className="mt-8">
        <OrderSlip
          orderNumber={order.orderNumber}
          studentName={order.student?.name ?? studentName}
          enrollmentId={order.student?.enrollmentId ?? enrollmentId}
          items={order.items}
          total={order.totalPkr}
          pickup={order.slot?.label ?? ""}
          payment={order.paymentMethod}
          status={order.status}
          date={order.createdAt}
        />
      </div>
    </>
  );
}
