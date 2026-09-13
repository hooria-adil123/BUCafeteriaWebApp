import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { checkPassword, requireUser } from "@/lib/auth";
import { hashPassword } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const { user, error } = await requireUser();
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  const [full] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!full) return Response.json({ error: "User not found." }, { status: 404 });

  const patch: Partial<typeof users.$inferInsert> = {};
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.email === "string" && body.email.trim()) {
    patch.email = body.email.trim().toLowerCase();
  }
  if (body.newPassword) {
    if (!body.currentPassword || !checkPassword(body.currentPassword, full.passwordHash)) {
      return Response.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    patch.passwordHash = hashPassword(body.newPassword);
  }
  const [updated] = await db.update(users).set(patch).where(eq(users.id, user.id)).returning();
  const { passwordHash: _pw, ...safe } = updated;
  void _pw;
  return Response.json({ user: safe });
}
