import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser, ORDER_COOKIE } from "@/lib/auth";
import { clearOrdersForUser, clearAllOrders } from "@/lib/store";
import { db } from "@/db";
import { orders, orderItems, cartItems, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { user } = await requireUser();
  const cookieStore = await cookies();

  // If user is authenticated, clear for them; otherwise clear all
  const userId = user?.id ?? 100;

  try {
    // Database cleanup if available
    const userOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.studentId, userId));
    if (userOrders.length > 0) {
      await db.delete(orderItems).where(inArray(orderItems.orderId, userOrders.map((order) => order.id)));
    }
    await db.delete(orders).where(eq(orders.studentId, userId));
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    await db.update(users).set({ walletBalance: 5000 }).where(eq(users.id, userId));
  } catch {
    // DB offline, ignore
  }

  // Fallback memory & file store cleanup
  clearOrdersForUser(userId);
  if (user?.role === "admin" || !user) {
    clearAllOrders();
  }

  const response = NextResponse.json({
    success: true,
    message: "Your order history has been reset and wallet balance restored to Rs. 5,000.",
  });

  // Clear latest order cookie
  response.cookies.delete(ORDER_COOKIE);

  return response;
}
