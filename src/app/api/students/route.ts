import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, userActivity, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { fallbackSessions, fallbackUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser(["staff", "manager", "admin"]);
  if (error || !user) return Response.json({ error: "You don’t have permission to access this page." }, { status: 403 });

  let rows: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    statusSession: string | null;
    lastLoginAt: Date | null;
  }>;
  try {
    rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        statusSession: sessions.id,
        lastLoginAt: userActivity.lastLoginAt,
      })
      .from(users)
      .leftJoin(sessions, and(eq(sessions.userId, users.id), gt(sessions.expiresAt, new Date())))
      .leftJoin(userActivity, eq(userActivity.userId, users.id))
      .where(eq(users.role, "student"));
  } catch {
    return Response.json({
      students: fallbackUsers.filter((student) => student.role === "student").map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        status: Array.from(fallbackSessions.values()).some((session) => session.userId === student.id) ? "Online" : "Offline",
        lastLoginAt: null,
      })),
    });
  }

  const seen = new Set<number>();
  return Response.json({
    students: rows.filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    }).map(({ statusSession, ...student }) => ({
      ...student,
      status: statusSession ? "Online" : "Offline",
    })),
  });
}