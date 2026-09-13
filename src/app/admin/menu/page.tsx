"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem } from "@/db/schema";
import { ConfirmDialog, LoadingState, Modal, Notice } from "@/components/ui";
import { CATEGORIES, formatPkr } from "@/lib/utils";

export default function AdminMenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [role, setRole] = useState("");

  async function load() {
    const res = await fetch("/api/menu");
    const data = (await res.json()) as { items: MenuItem[] };
    setItems(data.items);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setRole(d.user?.role ?? "");
        if (d.user?.role !== "manager") router.replace("/unauthorized");
      });
    void load();
  }, [router]);

  async function save() {
    if (!editing) return;
    setError("");
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/menu" : `/api/menu/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        description: editing.description,
        category: editing.category,
        pricePkr: Number(editing.pricePkr),
        imageUrl: editing.imageUrl,
        available: editing.available,
        popular: editing.popular,
        stockCount: Number(editing.stockCount),
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || "Unable to save item.");
      return;
    }
    setEditing(null);
    await load();
  }

  async function toggleAvail(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available, stockCount: item.available ? 0 : Math.max(item.stockCount, 10) }),
    });
    await load();
  }

  async function remove() {
    if (!deleteId) return;
    await fetch(`/api/menu/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  }

  if (loading || (role && role !== "manager")) return <LoadingState />;

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-navy">Menu management</h1>
          <p className="text-ocean">Add, price, and mark items out of stock in real time.</p>
        </div>
        <button
          className="btn-primary"
          type="button"
          onClick={() =>
            setEditing({
              name: "",
              description: "",
              category: "Fast Food",
              pricePkr: 200,
              imageUrl: "",
              available: true,
              popular: false,
              stockCount: 20,
            })
          }
        >
          Add food item
        </button>
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
      <div className="mt-6 overflow-auto rounded-3xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-ice text-left text-xs uppercase tracking-wide text-ocean">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Availability</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-sky">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="line-clamp-1 text-xs text-ocean">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">{formatPkr(item.pricePkr)}</td>
                <td className="p-3">{item.stockCount}</td>
                <td className="p-3">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.available ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                    }`}
                    onClick={() => toggleAvail(item)}
                  >
                    {item.available ? "Available" : "Out of Stock"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button className="mr-3 font-bold text-ocean" type="button" onClick={() => setEditing(item)}>
                    Edit
                  </button>
                  <button
                    className="mr-3 font-bold text-cyan"
                    type="button"
                    onClick={async () => {
                      await fetch("/api/supplier", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "request",
                          menuItemId: item.id,
                          quantity: 30,
                          notes: `Restock ${item.name} for cafeteria service.`,
                        }),
                      });
                      setError("");
                      setMessage(`Restock request sent to the food supplier for ${item.name}.`);
                    }}
                  >
                    Restock
                  </button>
                  <button className="font-bold text-red-600" type="button" onClick={() => setDeleteId(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} title={editing?.id ? "Edit item" : "Add item"} onClose={() => setEditing(null)}>
        {editing ? (
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Name"
              value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <textarea
              className="input min-h-24"
              placeholder="Description"
              value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
            <select
              className="input"
              value={editing.category ?? "Fast Food"}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              placeholder="Price PKR"
              value={editing.pricePkr ?? 0}
              onChange={(e) => setEditing({ ...editing, pricePkr: Number(e.target.value) })}
            />
            <input
              className="input"
              type="number"
              placeholder="Stock"
              value={editing.stockCount ?? 0}
              onChange={(e) => setEditing({ ...editing, stockCount: Number(e.target.value) })}
            />
            <input
              className="input"
              placeholder="Image URL"
              value={editing.imageUrl ?? ""}
              onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={!!editing.available}
                onChange={(e) => setEditing({ ...editing, available: e.target.checked })}
              />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={!!editing.popular}
                onChange={(e) => setEditing({ ...editing, popular: e.target.checked })}
              />
              Popular
            </label>
            <button className="btn-primary w-full" type="button" onClick={save}>
              Save
            </button>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete food item?"
        body="This removes the item from the student menu."
        confirmLabel="Delete"
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
      />
    </main>
  );
}
