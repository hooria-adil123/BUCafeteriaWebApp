"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CafeHoursMode } from "@/lib/utils";

export function HoursSimulator() {
  const router = useRouter();
  const [mode, setMode] = useState<CafeHoursMode>("auto");
  const [isOpen, setIsOpen] = useState(true);
  const [windowLabel, setWindowLabel] = useState("8:30 AM – 5:30 PM");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/test-hours")
      .then((r) => r.json())
      .then((d) => {
        setMode(d.mode ?? "auto");
        setIsOpen(d.isOpen ?? false);
        setWindowLabel(d.window ?? "8:30 AM – 5:30 PM");
      })
      .catch(() => {});
  }, []);

  async function switchMode(target: CafeHoursMode) {
    if (busy || target === mode) return;
    setBusy(true);
    try {
      const res = await fetch("/api/test-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: target }),
      });
      const data = await res.json();
      setMode(data.mode);
      setIsOpen(data.isOpen);
      router.refresh();
      // Reload page to re-render all dynamic server & client components cleanly
      window.location.reload();
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-sky bg-ice/70 px-4 py-2 text-xs backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-navy">Campus Operating Hours:</span>
          <span className="text-ocean">{windowLabel}</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold ${
              isOpen
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {isOpen ? "● Open for orders" : "● Cafeteria closed"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-ocean">Testing mode:</span>
          <button
            type="button"
            onClick={() => switchMode("auto")}
            disabled={busy}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              mode === "auto"
                ? "bg-navy text-white shadow-xs"
                : "bg-white text-navy hover:bg-sky/50"
            }`}
            title="Use real campus clock (8:30 AM – 5:30 PM PKT)"
          >
            Live Clock
          </button>
          <button
            type="button"
            onClick={() => switchMode("open")}
            disabled={busy}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              mode === "open"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white text-emerald-700 hover:bg-emerald-50"
            }`}
            title="Simulate open hours (12:00 PM)"
          >
            Simulate Open
          </button>
          <button
            type="button"
            onClick={() => switchMode("closed")}
            disabled={busy}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              mode === "closed"
                ? "bg-rose-700 text-white shadow-xs"
                : "bg-white text-rose-700 hover:bg-rose-50"
            }`}
            title="Simulate closed hours (after 5:30 PM)"
          >
            Simulate Closed
          </button>
        </div>
      </div>
    </div>
  );
}
