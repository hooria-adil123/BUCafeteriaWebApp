"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { UniversityCrest } from "@/components/crest";
import { Notice } from "@/components/ui";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, enrollmentId, email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Unable to register.");
        setBusy(false);
        return;
      }
      window.location.assign("/student/dashboard");
    } catch {
      setError("Unable to register right now. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#03045e,#00b4d8)] px-4 py-12">
      <form onSubmit={submit} className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <UniversityCrest height={210} />
        </div>
        <h1 className="mt-6 font-display text-3xl text-navy">Student registration</h1>
        <p className="mt-2 text-sm text-ocean">
          Use your Bahria University name and enrollment ID. New wallets start with Rs. 2,000.
        </p>
        <div className="mt-5 space-y-3">
          <input
            className="input"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
          <input
            className="input"
            placeholder="Enrollment ID"
            value={enrollmentId}
            onChange={(e) => setEnrollmentId(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            className="input"
            type="email"
            placeholder="University email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        {error ? (
          <div className="mt-4">
            <Notice kind="error">{error}</Notice>
          </div>
        ) : null}
        <button className="btn-primary mt-6 w-full" disabled={busy} type="submit">
          {busy ? "Creating account…" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-ocean">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-navy">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
