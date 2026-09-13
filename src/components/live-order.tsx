"use client";

import { useEffect, useState } from "react";
import { OrderSlip, OrderTracker } from "@/components/orders";

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

  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch(`/api/orders/${order.id}`);
      if (!res.ok) return;
      const data = (await res.json()) as Payload;
      if (data.order) setOrder(data.order);
    }, 3000);
    return () => clearInterval(t);
  }, [order.id]);

  return (
    <>
      <div className="mt-6 no-print">
        <OrderTracker status={order.status} />
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
