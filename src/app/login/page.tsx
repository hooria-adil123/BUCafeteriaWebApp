"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { UniversityCrest } from "@/components/crest";
import { Notice } from "@/components/ui";

type Portal = "student" | "admin" | "supplier";
type AdminSection = "staff" | "manager" | "admin";

function destination(role?: string) {
  if (role === "student") return "/student/dashboard";
  if (role === "supplier") return "/supplier/dashboard";
  return "/admin/dashboard";
}

function LoginForm() {
  const params = useSearchParams();
  const requestedPortal = params.get("portal");
  const [portal, setPortal] = useState<Portal>(
    requestedPortal === "supplier" || requestedPortal === "admin" ? requestedPortal : "student",
  );
  const [adminSection, setAdminSection] = useState<AdminSection>("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portal,
          requestedRole: portal === "admin" ? adminSection : undefined,
          email,
          password,
        }),
      });
      const data = (await response.json()) as { error?: string; user?: { role: string } };
      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }
      window.location.assign(destination(data.user?.role));
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#03045e_0%,#0077b6_55%,#90e0ef_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
        <div className="text-white">
          <UniversityCrest height={260} />
          <h1 className="mt-6 font-display text-4xl">Bahria University Cafeteria</h1>
          <p className="mt-3 max-w-md text-ice">Sign in with the email and password for your own registered account.</p>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-ice p-1">
            {(["student", "admin", "supplier"] as Portal[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPortal(item)}
                className={`rounded-xl py-2 text-sm font-bold capitalize transition-colors ${portal === item ? "bg-navy text-white shadow-sm" : "text-ocean hover:text-navy"}`}
              >
                {item === "admin" ? "Admin" : item === "supplier" ? "Food Supplier" : item}
              </button>
            ))}
          </div>
          {portal === "admin" ? (
            <div className="mt-5 rounded-2xl border border-ocean/10 bg-ice/60 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-navy">Admin portal</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["staff", "manager", "admin"] as AdminSection[]).map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setAdminSection(section)}
                    className={`rounded-xl border px-2 py-2 text-xs font-bold transition-colors ${adminSection === section ? "border-navy bg-navy text-white" : "border-ocean/20 bg-white text-navy hover:border-navy/40"}`}
                  >
                    {section === "admin" ? "Administration" : section === "manager" ? "Manager" : "Staff"}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <h2 className="mt-6 font-display text-2xl text-navy">
            {portal === "admin" ? `${adminSection === "admin" ? "Administration" : adminSection === "manager" ? "Manager" : "Staff"} login` : `${portal === "supplier" ? "Food supplier" : "Student"} login`}
          </h2>
          <p className="mt-1 text-xs text-ocean">Use the unique credentials you created during registration.</p>
          <div className="mt-5 space-y-3">
            <label className="block text-sm font-bold text-navy">
              Email
              <input className="input mt-1 w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </label>
            <label className="block text-sm font-bold text-navy">
              Password
              <div className="relative mt-1">
                <input className="input w-full pr-10" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 px-1 py-0.5 text-xs font-semibold text-ocean" title={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          </div>
          {error ? <div className="mt-4"><Notice kind="error">{error}</Notice></div> : null}
          <button className="btn-primary mt-6 w-full" disabled={busy} type="submit">{busy ? "Signing in..." : "Sign in"}</button>
          <p className="mt-4 text-center text-sm text-ocean">New here? <Link href="/register" className="font-bold text-navy hover:underline">Create an account</Link></p>
          <p className="mt-3 text-center text-sm"><Link href="/" className="text-ocean hover:text-navy">Back to home</Link></p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-navy" />}><LoginForm /></Suspense>;
}
