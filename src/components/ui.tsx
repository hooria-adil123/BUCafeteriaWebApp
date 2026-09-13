"use client";

import { cn, STATUS_LABELS } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    placed: "bg-ice text-ocean",
    accepted: "bg-sky text-navy",
    preparing: "bg-cyan/20 text-ocean",
    ready: "bg-emerald-100 text-emerald-800",
    picked_up: "bg-navy text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        styles[status] ?? "bg-ice text-navy",
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function DashboardCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl p-5 shadow-sm",
        accent ? "bg-gradient-to-br from-navy to-ocean text-white" : "bg-white",
      )}
    >
      <p className={cn("text-xs font-bold uppercase tracking-widest", accent ? "text-sky" : "text-ocean")}>
        {label}
      </p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {hint ? <p className={cn("mt-1 text-sm", accent ? "text-ice" : "text-ocean/80")}>{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-cyan bg-white px-6 py-14 text-center">
      <p className="font-display text-2xl text-navy">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-md text-ocean">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky border-t-ocean" />
      <p className="text-sm font-semibold text-ocean">{label}</p>
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl text-navy">{title}</h3>
          <button className="text-ocean" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-ocean">{body}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-ghost" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary" type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const styles = {
    info: "bg-ice text-navy border-sky",
    error: "bg-red-50 text-red-700 border-red-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return <div className={cn("rounded-2xl border px-4 py-3 text-sm font-medium", styles[kind])}>{children}</div>;
}
