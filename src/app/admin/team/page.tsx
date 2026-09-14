"use client";

import { useEffect, useState } from "react";
import { LoadingState, Notice } from "@/components/ui";
import { ROLE_LABELS, formatDateTime } from "@/lib/utils";

type Member = { id: number; name: string; email: string; role: string; status: string; lastLoginAt: string | null };

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/team")
      .then(async (response) => {
        const data = (await response.json()) as { members?: Member[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load team members.");
        setMembers(data.members ?? []);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <Notice kind="error">{error}</Notice>;

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Operations team</h1>
      <p className="mt-2 text-ocean">Account metadata only. Passwords and session tokens are never displayed.</p>
      <div className="mt-6 overflow-auto rounded-3xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-ice text-left text-xs uppercase tracking-wide text-ocean">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Last login</th></tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t border-sky">
                <td className="p-3 font-bold">{member.name}</td>
                <td className="p-3">{member.email}</td>
                <td className="p-3">{ROLE_LABELS[member.role] ?? member.role}</td>
                <td className="p-3"><span className={member.status === "Online" ? "font-bold text-emerald-700" : "text-ocean"}>{member.status}</span></td>
                <td className="p-3">{member.lastLoginAt ? formatDateTime(member.lastLoginAt) : "Not recorded"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}