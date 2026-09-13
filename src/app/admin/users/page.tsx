"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoadingState, Modal, Notice } from "@/components/ui";
import { formatPkr, ROLE_LABELS } from "@/lib/utils";

type Row = {
  id: number;
  name: string;
  email: string;
  enrollmentId: string | null;
  role: string;
  walletBalance: number;
};

export default function UsersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    enrollmentId: "",
    password: "1234",
    role: "staff",
    walletBalance: 0,
  });

  async function load() {
    const res = await fetch("/api/users");
    if (res.status === 403) {
      router.replace("/unauthorized");
      return;
    }
    const data = (await res.json()) as { users: Row[] };
    setRows(data.users);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || "Unable to create user.");
      return;
    }
    setOpen(false);
    await load();
  }

  async function changeRole(id: number, role: string) {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    await load();
  }

  if (loading) return <LoadingState />;

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-navy">Authorized users</h1>
          <p className="text-ocean">University administrator can assign cafeteria roles.</p>
        </div>
        <button className="btn-primary" type="button" onClick={() => setOpen(true)}>
          Add user
        </button>
      </div>
      <div className="mt-6 overflow-auto rounded-3xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-ice text-left text-xs uppercase tracking-wide text-ocean">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email / ID</th>
              <th className="p-3">Role</th>
              <th className="p-3">Wallet</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-sky">
                <td className="p-3 font-bold">{row.name}</td>
                <td className="p-3">
                  {row.email}
                  <div className="text-xs text-ocean">{row.enrollmentId}</div>
                </td>
                <td className="p-3">
                  <select
                    className="input py-1"
                    value={row.role}
                    onChange={(e) => changeRole(row.id, e.target.value)}
                  >
                    {Object.keys(ROLE_LABELS).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">{formatPkr(row.walletBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="Add authorized user" onClose={() => setOpen(false)}>
        <form onSubmit={create} className="space-y-3">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input
            className="input"
            placeholder="Enrollment / staff ID"
            value={form.enrollmentId}
            onChange={(e) => setForm({ ...form, enrollmentId: e.target.value })}
          />
          <input
            className="input"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {Object.keys(ROLE_LABELS).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          {error ? <Notice kind="error">{error}</Notice> : null}
          <button className="btn-primary w-full" type="submit">
            Create user
          </button>
        </form>
      </Modal>
    </main>
  );
}
