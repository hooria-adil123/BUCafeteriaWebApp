"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoadingState, Notice } from "@/components/ui";

type Slot = {
  id: number;
  label: string;
  capacity: number;
  booked: number;
  remaining: number;
  full: boolean;
  active: boolean;
  sortOrder: number;
};

export default function PickupSlotsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [label, setLabel] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/pickup-slots");
    const data = (await res.json()) as { slots: Slot[] };
    setSlots(data.slots);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.role !== "manager") router.replace("/unauthorized");
      });
    void load();
  }, [router]);

  async function add(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/pickup-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, capacity, sortOrder: slots.length + 1 }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || "Unable to add slot.");
      return;
    }
    setLabel("");
    await load();
  }

  async function patch(id: number, body: Partial<Slot>) {
    await fetch("/api/pickup-slots", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    await load();
  }

  if (loading) return <LoadingState />;

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Pickup slot capacity</h1>
      <p className="mt-2 max-w-2xl text-ocean">
        Risk control for rush-hour overload: each window accepts a maximum number of pre-orders.
        Students cannot select a full slot.
      </p>
      {error ? (
        <div className="mt-4">
          <Notice kind="error">{error}</Notice>
        </div>
      ) : null}
      <form onSubmit={add} className="mt-6 flex flex-wrap gap-3 rounded-3xl bg-white p-4">
        <input
          className="input max-w-xs"
          placeholder="e.g. 5:00 PM"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className="input max-w-32"
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
        <button className="btn-primary" type="submit">
          Add slot
        </button>
      </form>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {slots.map((slot) => (
          <article key={slot.id} className="rounded-3xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">{slot.label}</h2>
              <span className={`text-xs font-bold ${slot.full ? "text-red-600" : "text-ocean"}`}>
                {slot.booked}/{slot.capacity} {slot.full ? "FULL" : ""}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-ice">
              <div
                className={`h-full rounded-full ${slot.full ? "bg-red-500" : "bg-cyan"}`}
                style={{ width: `${Math.min(100, (slot.booked / slot.capacity) * 100)}%` }}
              />
            </div>
            <label className="mt-4 block text-sm font-bold">
              Capacity
              <input
                className="input mt-1"
                type="number"
                value={slot.capacity}
                onChange={(e) => patch(slot.id, { capacity: Number(e.target.value) })}
              />
            </label>
            <button
              type="button"
              className="btn-ghost mt-3"
              onClick={() => patch(slot.id, { active: !slot.active })}
            >
              {slot.active ? "Disable slot" : "Enable slot"}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
