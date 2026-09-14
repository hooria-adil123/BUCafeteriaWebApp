"use client";

import { useEffect, useState } from "react";
import { LoadingState, Notice } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

type Student = { id: number; name: string; email: string; role: string; status: string; lastLoginAt: string | null };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then(async (response) => {
        const data = (await response.json()) as { students?: Student[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load students.");
        setStudents(data.students ?? []);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <Notice kind="error">{error}</Notice>;

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Student contacts</h1>
      <p className="mt-2 text-ocean">Operational student metadata for order processing. Passwords and tokens are never shown.</p>
      <div className="mt-6 overflow-auto rounded-3xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-ice text-left text-xs uppercase tracking-wide text-ocean">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Last login</th></tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-sky">
                <td className="p-3 font-bold">{student.name}</td>
                <td className="p-3">{student.email}</td>
                <td className="p-3">Student</td>
                <td className="p-3">{student.status}</td>
                <td className="p-3">{student.lastLoginAt ? formatDateTime(student.lastLoginAt) : "Not recorded"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}