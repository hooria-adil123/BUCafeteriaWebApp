import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, normalizeEnrollment, withSessionCookie } from "@/lib/auth";
import { hashPassword } from "@/lib/utils";
import { ensureSeeded } from "@/db/seed";
import { addFallbackUser, fallbackUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as {
    role?: string;
    name?: string;
    enrollmentId?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim().replace(/\s+/g, " ") ?? "";
  const enrollmentId = body.enrollmentId?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role = body.role ?? "student";

  if (!name || !email || !password || !["student", "staff", "manager", "admin", "supplier"].includes(role)) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (role === "student" && !enrollmentId) {
    return NextResponse.json({ error: "Enrollment ID is required for student accounts." }, { status: 400 });
  }
  if (password.length < 10) {
    return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });
  }

  let emailTaken = fallbackUsers.some((user) => user.email.toLowerCase() === email);
  try {
    const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    emailTaken ||= existingEmail.length > 0;
  } catch {
    // Use the persisted fallback store when the database is unavailable.
  }
  if (emailTaken) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in." },
      { status: 400 },
    );
  }

  const enrollKey = normalizeEnrollment(enrollmentId);
  let enrollmentTaken = Boolean(
    enrollKey &&
      fallbackUsers.some((user) => normalizeEnrollment(user.enrollmentId || "") === enrollKey),
  );
  if (enrollKey) {
    try {
      const existingEnroll = await db
        .select()
        .from(users)
        .where(sql`lower(replace(coalesce(${users.enrollmentId}, ''), ' ', '')) = ${enrollKey}`)
        .limit(1);
      enrollmentTaken ||= existingEnroll.length > 0;
    } catch {
      // Use the persisted fallback store when the database is unavailable.
    }
  }
  if (enrollmentTaken) {
    return NextResponse.json(
      { error: "This enrollment ID is already registered. Please sign in." },
      { status: 400 },
    );
  }

  const userData = {
    name,
    email,
    enrollmentId: enrollmentId || null,
    passwordHash: await hashPassword(password),
    role,
    walletBalance: role === "student" ? 5000 : 0,
  } as const;
  let user: typeof users.$inferSelect;
  try {
    [user] = await db.insert(users).values(userData).returning();
  } catch {
    user = addFallbackUser(userData);
  }

  const sessionId = await createSession(user.id);
  const { passwordHash: _pw, ...safe } = user;
  void _pw;
  return withSessionCookie(NextResponse.json({ user: safe }), sessionId);
}
