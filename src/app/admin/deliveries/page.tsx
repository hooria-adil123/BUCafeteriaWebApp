"use client";

import { useEffect, useState } from "react";
import { LoadingState, Notice } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

type Delivery = { id: number; itemName: string; quantity: number; note: string | null; createdAt: string };
type RequestRow = { id: number; itemName: string; quantity: number; status: string; createdAt: string; requester: string };

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/supplier")
      .then(async (response) => {
        const data = (await response.json()) as { logs?: Delivery[]; requests?: RequestRow[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load delivery operations.");
        setDeliveries(data.logs ?? []);
        setRequests(data.requests ?? []);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <Notice kind="error">{error}</Notice>;

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Supplier deliveries</h1>
      <p className="mt-2 text-ocean">Product items, quantities, request dates, and delivery timestamps for administration.</p>
      <section className="mt-6 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl text-navy">Delivery log</h2>
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-sm"><thead className="bg-ice text-left text-xs uppercase tracking-wide text-ocean"><tr><th className="p-3">Item</th><th className="p-3">Quantity</th><th className="p-3">Delivered</th><th className="p-3">Note</th></tr></thead><tbody>{deliveries.map((delivery) => <tr key={delivery.id} className="border-t border-sky"><td className="p-3 font-bold">{delivery.itemName}</td><td className="p-3">{delivery.quantity}</td><td className="p-3">{formatDateTime(delivery.createdAt)}</td><td className="p-3">{delivery.note ?? "-"}</td></tr>)}</tbody></table>
        </div>
      </section>
      <section className="mt-6 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl text-navy">Restock requests</h2>
        <div className="mt-4 space-y-2">{requests.map((request) => <div key={request.id} className="flex flex-wrap justify-between gap-2 border-b border-sky py-3 text-sm"><span className="font-bold">{request.itemName} · {request.quantity}</span><span>{request.status} · requested by {request.requester} · {formatDateTime(request.createdAt)}</span></div>)}</div>
      </section>
    </main>
  );
}