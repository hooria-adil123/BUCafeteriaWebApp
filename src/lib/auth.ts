import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type Order, type OrderItem, type PickupSlot, type User } from "@/db/schema";
import { newId, verifyPassword } from "@/lib/utils";
import { createFallbackSession, fallbackSessions, fallbackUsers, getFallbackUserBySession } from "@/lib/store";

export const SESSION_COOKIE = "bu_session";
export const ORDER_COOKIE = "bu_latest_order";
const SESSION_TTL = 60 * 15;
const FALLBACK_SESSION_SECRET = process.env.SESSION_SECRET ?? randomBytes(32).toString("hex");
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export type AuthUser = Omit<User, "passwordHash">;
export type CachedOrder = Order & {
  items: OrderItem[];
  student?: AuthUser | null;
  slot?: PickupSlot | null;
};

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
    maxAge: SESSION_TTL,
  };
}

export async function createSession(userId: number) {
  const id = newId();
  const expiresAt = new Date(Date.now() + SESSION_TTL * 1000);
  let databaseSessionCreated = false;
  try {
    await db.insert(sessions).values({ id, userId, expiresAt });
    databaseSessionCreated = true;
  } catch (err) {
    console.warn("Database not available for session insert:", (err as Error).message);
  }
  if (!databaseSessionCreated) {
    return createFallbackSession(userId, expiresAt);
  }
  fallbackSessions.set(id, { userId, expiresAt });
  return id;
}

export function withSessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set(SESSION_COOKIE, sessionId, sessionCookieOptions());
  return response;
}

export function createSignedOrderCookie(order: CachedOrder) {
  const payload = Buffer.from(JSON.stringify(order)).toString("base64url");
  const signature = createHmac("sha256", FALLBACK_SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSignedOrderCookie(token: string): CachedOrder | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", FALLBACK_SESSION_SECRET).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const order = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as CachedOrder;
    return { ...order, createdAt: new Date(order.createdAt) };
  } catch {
    return null;
  }
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
  if (fallback) return publicUser(fallback);

  return null;
}

export async function requireUser(roles?: string[]) {
  const user = await getCurrentUser();
  if (!user) return { user: null as AuthUser | null, error: "unauthenticated" as const };
  if (roles && !roles.includes(user.role)) {
    return { user, error: "unauthorized" as const };
  }
  return { user, error: null };
}

export function getLoginKey(request: Request, email: string) {
  return `${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}:${email}`;
}

export function isLoginRateLimited(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { count: 0, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  return attempt.count >= 5;
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return;
  }
  attempt.count += 1;
}

export function clearLoginFailures(key: string) {
  loginAttempts.delete(key);
}

export async function checkPassword(password: string, hash: string) {
  return verifyPassword(password, hash);
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeEnrollment(value: string) {
  return value.trim().replace(/\s+/g, "").toLowerCase();
}
