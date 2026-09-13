"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { UniversityCrest } from "@/components/crest";
import { Notice } from "@/components/ui";

type Portal = "student" | "admin" | "supplier";

function destination(role?: string) {
  if (role === "student") return "/student/dashboard";
  if (role === "supplier") return "/supplier/dashboard";
  return "/admin/dashboard";
}

const ADMIN_PRESETS = [
  {
    role: "staff",
    label: "Bilal Raza",
    email: "staff@cafeteria.com",
    password: "12345",
    desc: "Kitchen board & orders",
  },
  {
    role: "staff1",
    label: "Nayel",
    email: "staff1@cafeteria.com",
    password: "12345",
    desc: "Staff member",
  },
  {
    role: "staff2",
    label: "Wahaj",
    email: "staff2@cafeteria.com",
    password: "123456",
    desc: "Staff member",
  },
  {
    role: "staff3",
    label: "Rehan",
    email: "staff3@cafeteria.com",
    password: "1234567",
    desc: "Staff member",
  },
  {
    role: "staff4",
    label: "Ali",
    email: "staff4@cafeteria.com",
    password: "12345678",
    desc: "Staff member",
  },
  {
    role: "manager",
    label: "Manager",
    email: "manager@cafeteria.com",
    password: "123456",
    desc: "Menu, stock & sales",
  },
  {
    role: "admin",
    label: "Administration",
    email: "administration@cafeteria.com",
    password: "1234567",
    desc: "Full campus oversight",
  },
] as const;

const SUPPLIER_PRESETS = [
  {
    label: "Karachi Fresh Supplies",
    email: "foodsupplier@cafeteria.com",
    password: "12345678",
    desc: "Restock requests & delivery",
  },
  {
    label: "Nehal",
    email: "foodsupplier1@cafeteria.com",
    password: "lom",
    desc: "Food supplier",
  },
  {
    label: "Mudassir",
    email: "foodsupplier2@cafeteria.com",
    password: "whenus",
    desc: "Food supplier",
  },
  {
    label: "Arhum",
    email: "foodsupplier3@cafeteria.com",
    password: "pxy",
    desc: "Food supplier",
  },
] as const;

const STUDENT_PRESETS = [
  {
    name: "Hooria Adil",
    email: "hooriaa619@gmail.com",
    enrollmentId: "02-134251-019",
    password: "1234",
  },
  {
    name: "Nimra",
    email: "nimrashaikh123@gmail.com",
    enrollmentId: "02-134251-089",
    password: "abcd",
  },
  {
    name: "Amal Faraz",
    email: "amalfaraz890@gmail.com",
    enrollmentId: "02-134251-007",
    password: "xyz",
  },
] as const;

function LoginForm() {
  const params = useSearchParams();
  const initial = (params.get("portal") as Portal) || "student";
  const [portal, setPortal] = useState<Portal>(
    ["student", "admin", "supplier"].includes(initial) ? initial : "student",
  );

  // Form states
  const [name, setName] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Load remembered credentials for a specific portal
  function loadPortalCredentials(p: Portal) {
    setError("");
    if (p === "student") {
      try {
        const saved = localStorage.getItem("bu_remembered_student");
        if (saved) {
          const parsed = JSON.parse(saved);
          setName(parsed.name || "Hooria Adil");
          setEnrollmentId(parsed.enrollmentId || "02-134251-019");
          setEmail(parsed.email || "hooriaa619@gmail.com");
          setPassword(parsed.password || "1234");
          return;
        }
      } catch {
        // ignore
      }
      setName("Hooria Adil");
      setEnrollmentId("02-134251-019");
      setEmail("hooriaa619@gmail.com");
      setPassword("1234");
    } else if (p === "admin") {
      try {
        const saved = localStorage.getItem("bu_remembered_admin");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.email && parsed.password) {
            setEmail(parsed.email);
            setPassword(parsed.password);
            return;
          }
        }
      } catch {
        // ignore
      }
      // Default to staff
      setEmail(ADMIN_PRESETS[0].email);
      setPassword(ADMIN_PRESETS[0].password);
    } else if (p === "supplier") {
      try {
        const saved = localStorage.getItem("bu_remembered_supplier");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.email && parsed.password) {
            setEmail(parsed.email);
            setPassword(parsed.password);
            return;
          }
        }
      } catch {
        // ignore
      }
      // Default to food supplier
      setEmail(SUPPLIER_PRESETS[0].email);
      setPassword(SUPPLIER_PRESETS[0].password);
    }
  }

  // Pre-seed storage on first visit so credentials remain saved across all portals
  useEffect(() => {
    try {
      if (!localStorage.getItem("bu_remembered_student")) {
        localStorage.setItem(
          "bu_remembered_student",
          JSON.stringify({
            name: "Hooria Adil",
            email: "hooriaa619@gmail.com",
            enrollmentId: "02-134251-019",
            password: "1234",
          }),
        );
      }
      if (!localStorage.getItem("bu_remembered_admin")) {
        localStorage.setItem(
          "bu_remembered_admin",
          JSON.stringify({ email: ADMIN_PRESETS[0].email, password: ADMIN_PRESETS[0].password }),
        );
      }
      if (!localStorage.getItem("bu_remembered_supplier")) {
        localStorage.setItem(
          "bu_remembered_supplier",
          JSON.stringify({ email: SUPPLIER_PRESETS[0].email, password: SUPPLIER_PRESETS[0].password }),
        );
      }
    } catch {
      // ignore
    }
    loadPortalCredentials(portal);
  }, []);

  function handlePortalChange(nextPortal: Portal) {
    setPortal(nextPortal);
    loadPortalCredentials(nextPortal);
  }

  function applyAdminPreset(preset: (typeof ADMIN_PRESETS)[number]) {
    setEmail(preset.email);
    setPassword(preset.password);
    setError("");
    if (rememberMe) {
      try {
        localStorage.setItem(
          "bu_remembered_admin",
          JSON.stringify({ email: preset.email, password: preset.password }),
        );
      } catch {
        // ignore
      }
    }
  }

  function applySupplierPreset(preset: (typeof SUPPLIER_PRESETS)[number]) {
    setEmail(preset.email);
    setPassword(preset.password);
    setError("");
    if (rememberMe) {
      try {
        localStorage.setItem(
          "bu_remembered_supplier",
          JSON.stringify({ email: preset.email, password: preset.password }),
        );
      } catch {
        // ignore
      }
    }
  }

  function applyStudentPreset(preset: (typeof STUDENT_PRESETS)[number]) {
    setName(preset.name);
    setEmail(preset.email);
    setEnrollmentId(preset.enrollmentId);
    setPassword(preset.password);
    setError("");
    if (rememberMe) {
      try {
        localStorage.setItem("bu_remembered_student", JSON.stringify(preset));
      } catch {
        // ignore
      }
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    // Save credentials to localStorage if rememberMe is checked
    if (rememberMe) {
      try {
        if (portal === "student") {
          localStorage.setItem(
            "bu_remembered_student",
            JSON.stringify({ name, email, enrollmentId, password }),
          );
        } else if (portal === "admin") {
          localStorage.setItem(
            "bu_remembered_admin",
            JSON.stringify({ email, password }),
          );
        } else if (portal === "supplier") {
          localStorage.setItem(
            "bu_remembered_supplier",
            JSON.stringify({ email, password }),
          );
        }
      } catch {
        // ignore storage errors
      }
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal, name, enrollmentId, email, password }),
      });
      const data = (await res.json()) as { error?: string; user?: { role: string } };
      if (!res.ok) {
        setError(data.error || "Unable to sign in. Please check your details.");
        setBusy(false);
        return;
      }
      window.location.assign(destination(data.user?.role));
    } catch {
      setError("Unable to sign in right now. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#03045e_0%,#0077b6_55%,#90e0ef_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
        <div className="text-white">
          <UniversityCrest height={260} />
          <h1 className="mt-6 font-display text-4xl">Bahria University Cafeteria</h1>
          <p className="mt-3 max-w-md text-ice">
            Fast, connected ordering and management for the Karachi campus cafeteria. Sign in to
            your role-specific portal below.
          </p>

        </div>

        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-ice p-1">
            {(["student", "admin", "supplier"] as Portal[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePortalChange(p)}
                className={`rounded-xl py-2 text-sm font-bold capitalize transition-colors ${
                  portal === p ? "bg-navy text-white shadow-sm" : "text-ocean hover:text-navy"
                }`}
              >
                {p === "admin" ? "Admin" : p === "supplier" ? "Food Supplier" : "Student"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="font-display text-2xl text-navy">
              {portal === "student"
                ? "Student login"
                : portal === "admin"
                  ? "Management & Staff login"
                  : "Food Supplier login"}
            </h2>
            <p className="mt-1 text-xs text-ocean">
              {portal === "student"
                ? "Students sign in with their registered name, email, and password."
                : portal === "admin"
                  ? "Select an official role below or enter your registered credentials."
                  : "Supplier portal to review restock requests and record fresh ingredient deliveries."}
            </p>
          </div>

          {/* Quick preset selector chips for Admin */}
          {portal === "admin" ? (
            <div className="mt-4 rounded-2xl bg-ice/60 p-3 border border-ocean/10">
              <span className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                Quick Role Selector (Auto-fill)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {ADMIN_PRESETS.map((item) => {
                  const isSelected = email === item.email;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => applyAdminPreset(item)}
                      className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-navy text-white border-navy shadow"
                          : "bg-white text-navy border-ocean/20 hover:border-navy/40"
                      }`}
                    >
                      <span className="font-bold">{item.label}</span>
                      <span className={`text-[10px] mt-0.5 ${isSelected ? "text-cyan" : "text-ocean"}`}>
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Quick preset selector for Supplier */}
          {portal === "supplier" ? (
            <div className="mt-4 rounded-2xl bg-ice/60 p-3 border border-ocean/10">
              <span className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                Quick Role Selector (Auto-fill)
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SUPPLIER_PRESETS.map((item) => (
                  <button
                    key={item.email}
                    type="button"
                    onClick={() => applySupplierPreset(item)}
                    className={`flex min-h-16 flex-col items-center justify-center rounded-xl border p-2 text-xs font-semibold transition-all ${
                      email === item.email
                        ? "border-navy bg-navy text-white shadow"
                        : "border-ocean/20 bg-white text-navy hover:border-navy/40"
                    }`}
                  >
                    <span className="font-bold">{item.label}</span>
                    <span className={`mt-0.5 text-[10px] ${email === item.email ? "text-cyan" : "text-ocean"}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {portal === "student" ? (
            <div className="mt-4 rounded-2xl border border-ocean/10 bg-ice/60 p-3">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-navy">
                Student credential
              </span>
              <div className="grid grid-cols-2 gap-2">
                {STUDENT_PRESETS.map((item) => {
                  const isSelected = email === item.email;
                  return (
                    <button
                      key={item.email}
                      type="button"
                      onClick={() => applyStudentPreset(item)}
                      className={`rounded-xl border p-2 text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-navy bg-navy text-white shadow"
                          : "border-ocean/20 bg-white text-navy hover:border-navy/40"
                      }`}
                    >
                      <span className="block font-bold">{item.name}</span>
                      <span className={`mt-0.5 block text-[10px] ${isSelected ? "text-cyan" : "text-ocean"}`}>
                        {item.email}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {portal === "student" ? (
              <>
                <label className="block text-sm font-bold text-navy">
                  Full name
                  <input
                    className="input mt-1 w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your registered name"
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="block text-sm font-bold text-navy">
                  Email
                  <input
                    className="input mt-1 w-full"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="block text-sm font-bold text-navy">
                  Enrollment ID
                  <input
                    className="input mt-1 w-full"
                    value={enrollmentId}
                    onChange={(e) => setEnrollmentId(e.target.value)}
                    placeholder="e.g. 02-134251-019"
                    autoComplete="username"
                  />
                </label>
              </>
            ) : (
              <label className="block text-sm font-bold text-navy">
                Email
                <input
                  className="input mt-1 w-full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cafeteria.com"
                  autoComplete="email"
                  required
                />
              </label>
            )}

            <label className="block text-sm font-bold text-navy">
              Password
              <div className="relative mt-1">
                <input
                  className="input w-full pr-10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean hover:text-navy text-xs font-semibold px-1 py-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          </div>

          {error ? (
            <div className="mt-4">
              <Notice kind="error">{error}</Notice>
            </div>
          ) : null}

          <label className="mt-4 flex items-center gap-2 text-sm text-ocean cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-ocean/30 text-navy focus:ring-cyan"
            />
            <span>Remember my credentials on this device for smooth sign in</span>
          </label>

          <button className="btn-primary mt-6 w-full" disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>

          {portal === "student" ? (
            <p className="mt-4 text-center text-sm text-ocean">
              New student?{" "}
              <Link href="/register" className="font-bold text-navy hover:underline">
                Create an account
              </Link>
            </p>
          ) : null}
          <p className="mt-3 text-center text-sm">
            <Link href="/" className="text-ocean hover:text-navy">
              Back to home
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <LoginForm />
    </Suspense>
  );
}
