"use client";

import { useEffect, useState } from "react";
import { LoadingState, Notice } from "@/components/ui";

type Item = { id: number; name: string; category: string; stockCount: number; available: boolean };

export default function InventoryPage() {
  const [menu, setMenu] = useState<Item[]>([]);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/supplier");
    const data = (await res.json()) as { menu: Item[] };
    setMenu(data.menu);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function deliver(id: number) {
    setError("");
    setMessage("");
    const quantity = Number(qty[id] ?? 10);
    const res = await fetch("/api/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deliver", menuItemId: id, quantity, notes: "Supplier delivery" }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || "Delivery failed.");
      return;
    }
    setMessage("Delivery logged. Student menu availability will update immediately.");
    await load();
  }

  if (loading) return <LoadingState />;

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Inventory</h1>
      <p className="mt-2 text-ocean">Log deliveries to restock the cafeteria and restore availability.</p>
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
      <div className="mt-6 overflow-auto rounded-3xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-ice text-left text-xs uppercase tracking-wide text-ocean">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Category</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Deliver</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item) => (
              <tr key={item.id} className="border-t border-sky">
                <td className="p-3 font-bold">{item.name}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">{item.stockCount}</td>
                <td className="p-3">{item.available ? "Available" : "Out of Stock"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <input
                      className="input w-20 py-1"
                      type="number"
                      min={1}
                      value={qty[item.id] ?? 10}
                      onChange={(e) => setQty({ ...qty, [item.id]: Number(e.target.value) })}
                    />
                    <button className="btn-primary py-1 text-sm" type="button" onClick={() => deliver(item.id)}>
                      Deliver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
