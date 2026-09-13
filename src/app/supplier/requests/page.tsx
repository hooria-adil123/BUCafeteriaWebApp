"use client";

import { useEffect, useState } from "react";
import { LoadingState, Notice, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

type RequestRow = {
  id: number;
  itemName: string;
  requester: string;
  quantity: number;
  status: string;
  notes: string | null;
  createdAt: string;
};

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/supplier");
    const data = (await res.json()) as { requests: RequestRow[] };
    setRows(data.requests);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function update(id: number, status: string) {
    await fetch("/api/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-request", requestId: id, status }),
    });
    setMessage(status === "received" ? "Stock updated on the student menu." : "Request updated.");
    await load();
  }

  if (loading) return <LoadingState />;

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Restock requests</h1>
      <p className="mt-2 text-ocean">Created by the cafeteria manager when items sell out.</p>
      {message ? (
        <div className="mt-4">
          <Notice kind="success">{message}</Notice>
        </div>
      ) : null}
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-3xl bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-2xl">{row.itemName}</p>
                <p className="text-sm text-ocean">
                  Qty {row.quantity} · Requested by {row.requester} · {formatDateTime(row.createdAt)}
                </p>
                {row.notes ? <p className="mt-2 text-sm">{row.notes}</p> : null}
              </div>
              <span className="rounded-full bg-ice px-3 py-1 text-xs font-bold uppercase text-navy">
                {row.status}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              {row.status === "pending" ? (
                <button className="btn-primary" type="button" onClick={() => update(row.id, "shipped")}>
                  Mark shipped
                </button>
              ) : null}
              {row.status === "shipped" ? (
                <button className="btn-primary" type="button" onClick={() => update(row.id, "received")}>
                  Confirm received & restock
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
