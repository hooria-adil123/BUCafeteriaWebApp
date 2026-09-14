import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/db";
import { sessions, userActivity, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { fallbackSessions, fallbackUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser(["manager", "admin"]);
  if (error || !user) return Response.json({ error: "You don’t have permission to access this page." }, { status: 403 });

  try {
    const allowedRoles = user.role === "manager" ? ["staff", "supplier"] : ["staff", "manager", "supplier"];
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        lastLoginAt: userActivity.lastLoginAt,
        sessionId: sessions.id,
      })
      .from(users)
      .leftJoin(userActivity, eq(userActivity.userId, users.id))
      .leftJoin(sessions, and(eq(sessions.userId, users.id), gt(sessions.expiresAt, new Date())))
      .where(inArray(users.role, allowedRoles))
      .orderBy(desc(userActivity.lastLoginAt));
    const seen = new Set<number>();
    return Response.json({
      members: rows.filter((row) => {
        if (seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
      }).map(({ sessionId, ...member }) => ({
        ...member,
        status: sessionId ? "Online" : "Offline",
      })),
    });
  } catch {
    const allowedRoles = user.role === "manager" ? ["staff", "supplier"] : ["staff", "manager", "supplier"];
    return Response.json({
      members: fallbackUsers.filter((member) => allowedRoles.includes(member.role)).map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        status: Array.from(fallbackSessions.values()).some((session) => session.userId === member.id) ? "Online" : "Offline",
        lastLoginAt: null,
      })),
    });
  }
}