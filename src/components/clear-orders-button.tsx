"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClearOrdersButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleClear() {
    if (!confirmed) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 5000);
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/orders/reset", { method: "POST" });
      setConfirmed(false);
      router.refresh();
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClear}
      disabled={busy}
      className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
        confirmed
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
      }`}
      title="Clear all my orders and restore wallet to Rs. 5,000"
    >
      {busy ? "Clearing…" : confirmed ? "Confirm: Reset history?" : "Clear my order history"}
    </button>
  );
}
