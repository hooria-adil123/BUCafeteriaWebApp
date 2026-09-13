"use client";

import Link from "next/link";
import {
  formatDateTime,
  formatPkr,
  formatTime,
  ORDER_FLOW,
  STATUS_DESCRIPTIONS,
  STATUS_LABELS,
  statusIndex,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui";

export function OrderCard({
  orderNumber,
  date,
  items,
  total,
  pickup,
  payment,
  status,
  href,
}: {
  orderNumber: string;
  date: Date | string;
  items: string;
  total: number;
  pickup: string;
  payment: string;
  status: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl text-navy">{orderNumber}</p>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 text-sm text-ocean">{formatDateTime(date)}</p>
      <p className="mt-3 text-navy">{items}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-ocean">
        <span>Pickup {pickup}</span>
        <span>{payment === "wallet" ? "University wallet" : "Cash at cafeteria"}</span>
        <span>{formatPkr(total)}</span>
      </div>
    </Link>
  );
}

type OrderStatusTimes = Partial<Record<(typeof ORDER_FLOW)[number], Date | string | null>>;

export function OrderTracker({
  status,
  statusTimes,
}: {
  status: string;
  statusTimes?: OrderStatusTimes;
}) {
  const current = statusIndex(status);
  const currentStatus = ORDER_FLOW[current];
  return (
    <section className="rounded-3xl bg-white p-5" aria-label="Live order tracking">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-ocean">Live tracking</p>
        <span className="inline-flex items-center gap-2 text-xs font-bold text-ocean">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan" aria-hidden="true" />
          Updates automatically
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-2" role="list" aria-label="Order stages">
        {ORDER_FLOW.map((step, i) => {
          const done = i <= current;
          const active = i === current;
          return (
            <div key={step} className="flex flex-1 flex-col items-center text-center" role="listitem">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                  active
                    ? "bg-ocean text-white ring-4 ring-cyan/20"
                    : done
                      ? "bg-ocean text-white"
                      : "bg-ice text-ocean"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {i + 1}
              </div>
              <p className={`mt-2 text-[11px] font-bold ${done ? "text-navy" : "text-ocean/60"}`}>
                {STATUS_LABELS[step]}
              </p>
              <p className={`mt-1 text-[10px] ${done ? "text-ocean" : "text-ocean/45"}`}>
                {statusTimes?.[step]
                  ? formatTime(statusTimes[step]!)
                  : done
                    ? "Recorded"
                    : "Waiting"}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ice">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ocean to-cyan transition-all"
          style={{ width: `${((current + 1) / ORDER_FLOW.length) * 100}%` }}
        />
      </div>
      <div className="mt-4 rounded-2xl bg-ice/60 px-4 py-3">
        <p className="text-sm font-bold text-navy">{STATUS_LABELS[currentStatus]}</p>
        <p className="mt-1 text-sm text-ocean">{STATUS_DESCRIPTIONS[currentStatus]}</p>
      </div>
    </section>
  );
}

export function PickupSlotPicker({
  slots,
  value,
  onChange,
}: {
  slots: Array<{
    id: number;
    label: string;
    booked: number;
    capacity: number;
    remaining: number;
    full: boolean;
    active: boolean;
  }>;
  value: number | null;
  onChange: (id: number) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slots
        .filter((s) => s.active)
        .map((slot) => {
          const selected = value === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={slot.full}
              onClick={() => onChange(slot.id)}
              className={`rounded-2xl border p-4 text-left ${
                slot.full
                  ? "cursor-not-allowed border-red-200 bg-red-50 text-red-700"
                  : selected
                    ? "border-ocean bg-ice"
                    : "border-sky bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-navy">{slot.label}</p>
                {slot.full ? (
                  <span className="text-xs font-bold uppercase">Full</span>
                ) : (
                  <span className="text-xs font-bold text-ocean">
                    {slot.booked}/{slot.capacity} orders
                  </span>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky/50">
                <div
                  className={`h-full ${slot.full ? "bg-red-500" : "bg-cyan"}`}
                  style={{ width: `${Math.min(100, (slot.booked / slot.capacity) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-medium">
                {slot.full
                  ? "This pickup slot is full. Please select another time."
                  : `${slot.remaining} spots remaining`}
              </p>
            </button>
          );
        })}
    </div>
  );
}

export function OrderSlip({
  orderNumber,
  studentName,
  enrollmentId,
  items,
  total,
  pickup,
  payment,
  status,
  date,
}: {
  orderNumber: string;
  studentName: string;
  enrollmentId?: string | null;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  total: number;
  pickup: string;
  payment: string;
  status: string;
  date: Date | string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border-2 border-dashed border-ocean bg-white p-6 text-navy shadow-sm">
      <div className="flex items-center gap-3 border-b border-sky pb-4">
        <img src="/images/bu-logo.png" alt="BU" className="h-14 w-14 rounded-full object-contain" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ocean">Bahria University</p>
          <p className="font-display text-xl">Cafeteria Pickup Slip</p>
        </div>
      </div>
      <p className="mt-4 font-display text-3xl">{orderNumber}</p>
      <p className="text-sm text-ocean">{formatDateTime(date)}</p>
      <div className="mt-4 space-y-1 text-sm">
        <p>
          <b>Student:</b> {studentName}
        </p>
        {enrollmentId ? (
          <p>
            <b>Enrollment:</b> {enrollmentId}
          </p>
        ) : null}
        <p>
          <b>Pickup:</b> {pickup}
        </p>
        <p>
          <b>Payment:</b> {payment === "wallet" ? "University wallet" : "Cash at cafeteria"}
        </p>
        <p>
          <b>Status:</b> {STATUS_LABELS[status] ?? status}
        </p>
      </div>
      <div className="mt-4 border-t border-sky pt-3">
        {items.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span>
              {item.quantity}× {item.name}
            </span>
            <span>{formatPkr(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPkr(total)}</span>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-1">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="h-8 w-1.5 bg-navy" style={{ opacity: i % 3 === 0 ? 1 : 0.35 }} />
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-ocean">Show this slip at the cafeteria counter.</p>
    </div>
  );
}
