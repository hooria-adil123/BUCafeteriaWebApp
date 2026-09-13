import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, normalizeEnrollment, withSessionCookie } from "@/lib/auth";
import { hashPassword } from "@/lib/utils";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as {
    name?: string;
    enrollmentId?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim().replace(/\s+/g, " ") ?? "";
  const enrollmentId = body.enrollmentId?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!name || !enrollmentId || !email || !password) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters." }, { status: 400 });
  }

  const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingEmail.length) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in." },
      { status: 400 },
    );
  }

  const enrollKey = normalizeEnrollment(enrollmentId);
  const existingEnroll = await db
    .select()
    .from(users)
    .where(sql`lower(replace(coalesce(${users.enrollmentId}, ''), ' ', '')) = ${enrollKey}`)
    .limit(1);
  if (existingEnroll.length) {
    return NextResponse.json(
      { error: "This enrollment ID is already registered. Please sign in." },
      { status: 400 },
    );
  }

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      enrollmentId,
      passwordHash: hashPassword(password),
      role: "student",
      walletBalance: 2000,
    })
    .returning();

  const sessionId = await createSession(user.id);
  const { passwordHash: _pw, ...safe } = user;
  void _pw;
  return withSessionCookie(NextResponse.json({ user: safe }), sessionId);
}
