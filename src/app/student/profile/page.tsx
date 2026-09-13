"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoadingState, Notice } from "@/components/ui";
import { formatPkr } from "@/lib/utils";

type User = {
  name: string;
  email: string;
  enrollmentId: string | null;
  walletBalance: number;
  role: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setName(d.user?.name ?? "");
        setEmail(d.user?.email ?? "");
      });
  }, []);

  if (!user) return <LoadingState />;

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, currentPassword, newPassword }),
    });
    const data = (await res.json()) as { error?: string; user?: User };
    if (!res.ok) {
      setError(data.error || "Unable to update profile.");
      return;
    }
    setUser(data.user ?? user);
    setMessage("Profile updated.");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-display text-4xl text-navy">Student profile</h1>
      <div className="mt-6 rounded-3xl bg-white p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-ocean">Enrollment</p>
        <p className="font-display text-2xl">{user.enrollmentId}</p>
        <p className="mt-4 text-ocean">University wallet</p>
        <p className="text-2xl font-bold text-navy">{formatPkr(user.walletBalance)}</p>
        <form onSubmit={save} className="mt-6 space-y-3">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input"
            type="password"
            placeholder="Current password (only to change password)"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {error ? <Notice kind="error">{error}</Notice> : null}
          {message ? <Notice kind="success">{message}</Notice> : null}
          <button className="btn-primary w-full" type="submit">
            Save profile
          </button>
        </form>
      </div>
    </main>
  );
}
