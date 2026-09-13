import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { hashPassword, newId } from "@/lib/utils";
import { fallbackSessions, getFallbackUserBySession } from "@/lib/store";

export const SESSION_COOKIE = "bu_session";
const WEEK = 60 * 60 * 24 * 7;

export type AuthUser = Omit<User, "passwordHash">;

function publicUser(user: User): AuthUser {
  const { passwordHash: _pw, ...rest } = user;
  void _pw;
  return rest;
}

export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: WEEK,
  };
}

export async function createSession(userId: number) {
  const id = newId();
  const expiresAt = new Date(Date.now() + WEEK * 1000);
  try {
    await db.insert(sessions).values({ id, userId, expiresAt });
  } catch (err) {
    console.warn("Database not available for session insert:", (err as Error).message);
  }
  fallbackSessions.set(id, { userId, expiresAt });
  return id;
}

export function withSessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set(SESSION_COOKIE, sessionId, sessionCookieOptions());
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await db.delete(sessions).where(eq(sessions.id, token));
    } catch {
      // ignore
    }
    fallbackSessions.delete(token);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const rows = await db
      .select({ user: users, session: sessions })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, token))
      .limit(1);
    const row = rows[0];
    if (row) {
      if (row.session.expiresAt.getTime() < Date.now()) {
        try {
          await db.delete(sessions).where(eq(sessions.id, token));
        } catch {
          // ignore
        }
        return null;
      }
      return publicUser(row.user);
    }
  } catch {
    // Database offline, check fallback
  }

  const fallback = getFallbackUserBySession(token);
  return fallback ? publicUser(fallback) : null;
}

export async function requireUser(roles?: string[]) {
  const user = await getCurrentUser();
  if (!user) return { user: null as AuthUser | null, error: "unauthenticated" as const };
  if (roles && !roles.includes(user.role)) {
    return { user, error: "unauthorized" as const };
  }
  return { user, error: null };
}

export function checkPassword(password: string, hash: string) {
  return hashPassword(password) === hash;
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeEnrollment(value: string) {
  return value.trim().replace(/\s+/g, "").toLowerCase();
}
