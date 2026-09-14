import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userActivity, users } from "@/db/schema";
import {
  checkPassword,
  clearLoginFailures,
  createSession,
  getLoginKey,
  isLoginRateLimited,
  recordLoginFailure,
  withSessionCookie,
} from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { fallbackUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as {
    portal?: string;
    requestedRole?: string;
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const loginKey = getLoginKey(request, email);
  if (isLoginRateLimited(loginKey)) {
    return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
  }
  if (!email || !password) {
    recordLoginFailure(loginKey);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  let user = null as typeof users.$inferSelect | null;

  if (body.portal === "student" || body.portal === "supplier" || body.portal === "admin") {
    let rows: (typeof users.$inferSelect)[] = [];
    try {
      rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    } catch {
      // Database offline, check fallback
    }

    user = rows[0] ?? null;
    if (!user) {
      user = fallbackUsers.find((u) => u.email.toLowerCase() === email) ?? null;
    }
  } else {
    user = null;
  }

  const isCorrectPassword = user ? await checkPassword(password, user.passwordHash) : false;

  const requestedRole = body.portal === "admin" ? body.requestedRole : body.portal;
  const validAdminRole = ["staff", "manager", "admin"].includes(requestedRole ?? "");
  const roleMatchesPortal = body.portal === "admin"
    ? validAdminRole && user?.role === requestedRole
    : user?.role === requestedRole;

  if (!user || !isCorrectPassword || !roleMatchesPortal) {
    recordLoginFailure(loginKey);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  clearLoginFailures(loginKey);
  try {
    await db
      .insert(userActivity)
      .values({ userId: user.id, lastLoginAt: new Date() })
      .onConflictDoUpdate({ target: userActivity.userId, set: { lastLoginAt: new Date() } });
  } catch {
    // Authentication remains valid if activity tracking is temporarily unavailable.
  }
  const sessionId = await createSession(user.id);
  const { passwordHash: _pw, ...safe } = user;
  void _pw;
  return withSessionCookie(NextResponse.json({ user: safe }), sessionId);
}
