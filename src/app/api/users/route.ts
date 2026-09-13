import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { hashPassword } from "@/lib/utils";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const { user, error } = await requireUser(["admin"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  let rows: (typeof users.$inferSelect)[] = [];
  try {
    rows = await db.select().from(users);
  } catch {
    const { fallbackUsers } = await import("@/lib/store");
    rows = fallbackUsers;
  }
  return Response.json({
    users: rows.map(({ passwordHash: _pw, ...rest }) => {
      void _pw;
      return rest;
    }),
  });
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(["admin"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    enrollmentId?: string;
    password?: string;
    role?: string;
    walletBalance?: number;
  };
  if (!body.name || !body.email || !body.password || !body.role) {
    return Response.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  const [created] = await db
    .insert(users)
    .values({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      enrollmentId: body.enrollmentId?.trim() ? body.enrollmentId.trim() : null,
      passwordHash: hashPassword(body.password),
      role: body.role,
      walletBalance: Number(body.walletBalance ?? (body.role === "student" ? 2000 : 0)),
    })
    .returning();
  const { passwordHash: _pw, ...safe } = created;
  void _pw;
  return Response.json({ user: safe });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireUser(["admin"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const body = (await request.json()) as {
    id?: number;
    role?: string;
    walletBalance?: number;
    name?: string;
  };
  if (!body.id) return Response.json({ error: "User id required." }, { status: 400 });
  const patch: Partial<typeof users.$inferInsert> = {};
  if (typeof body.role === "string") patch.role = body.role;
  if (typeof body.walletBalance === "number") patch.walletBalance = body.walletBalance;
  if (typeof body.name === "string") patch.name = body.name;
  const [updated] = await db.update(users).set(patch).where(eq(users.id, body.id)).returning();
  const { passwordHash: _pw, ...safe } = updated;
  void _pw;
  return Response.json({ user: safe });
}
