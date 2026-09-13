"use client";

export function PrintButton({ label = "Print slip" }: { label?: string }) {
  return (
    <button type="button" className="btn-primary no-print" onClick={() => window.print()}>
      {label}
    </button>
  );
}
