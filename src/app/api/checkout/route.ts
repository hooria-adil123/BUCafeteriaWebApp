import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, menuItems, orderItems, orders, pickupSlots, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getCart, getSlotsWithUsage, nextOrderNumber } from "@/lib/data";
import { startOfToday } from "@/lib/utils";
import { and, count, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { user, error } = await requireUser(["student"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    pickupSlotId?: number;
    paymentMethod?: "cash" | "wallet";
    notes?: string;
  };

  const cart = await getCart(user.id);
  if (cart.length === 0) {
    return Response.json({ error: "Your cart is empty." }, { status: 400 });
  }

  for (const row of cart) {
    if (!row.menuItem.available || row.menuItem.stockCount < row.quantity) {
      return Response.json(
        { error: `${row.menuItem.name} is currently unavailable.` },
        { status: 400 },
      );
    }
  }

  const slotId = Number(body.pickupSlotId);
  let slot: typeof pickupSlots.$inferSelect | undefined;
  try {
    const [dbSlot] = await db.select().from(pickupSlots).where(eq(pickupSlots.id, slotId)).limit(1);
    slot = dbSlot;
  } catch {
    const { FALLBACK_SLOTS } = await import("@/lib/store");
    slot = FALLBACK_SLOTS.find((s) => s.id === slotId);
  }

  if (!slot || !slot.active) {
    return Response.json({ error: "Please select a pickup time." }, { status: 400 });
  }

  let booked = 0;
  try {
    const [row] = await db
      .select({ booked: count() })
      .from(orders)
      .where(and(eq(orders.pickupSlotId, slotId), gte(orders.createdAt, startOfToday())));
    booked = Number(row?.booked ?? 0);
  } catch {
    booked = 0;
  }

  if (booked >= slot.capacity) {
    return Response.json(
      { error: "This pickup slot is full. Please select another time." },
      { status: 400 },
    );
  }

  const total = cart.reduce((s, i) => s + i.menuItem.pricePkr * i.quantity, 0);
  const paymentMethod = body.paymentMethod === "wallet" ? "wallet" : "cash";

  if (paymentMethod === "wallet") {
    let freshWallet = user.walletBalance;
    try {
      const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      if (fresh) freshWallet = fresh.walletBalance;
    } catch {
      const { fallbackUsers } = await import("@/lib/store");
      const fb = fallbackUsers.find((u) => u.id === user.id);
      if (fb) freshWallet = fb.walletBalance;
    }

    if (freshWallet < total) {
      return Response.json({ error: "Insufficient wallet balance." }, { status: 400 });
    }

    try {
      await db
        .update(users)
        .set({ walletBalance: freshWallet - total })
        .where(eq(users.id, user.id));
    } catch {
      const { fallbackUsers } = await import("@/lib/store");
      const fb = fallbackUsers.find((u) => u.id === user.id);
      if (fb) fb.walletBalance = freshWallet - total;
    }
  }

  let orderNumber = `BU-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    orderNumber = await nextOrderNumber();
  } catch {
    // fallback orderNumber
  }

  let order: typeof orders.$inferSelect | undefined;
  try {
    const [dbOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        studentId: user.id,
        pickupSlotId: slotId,
        paymentMethod,
        status: "placed",
        totalPkr: total,
        notes: body.notes?.trim() || null,
      })
      .returning();
    order = dbOrder;

    await db.insert(orderItems).values(
      cart.map((row) => ({
        orderId: order!.id,
        menuItemId: row.menuItem.id,
        name: row.menuItem.name,
        unitPrice: row.menuItem.pricePkr,
        quantity: row.quantity,
      })),
    );

    for (const row of cart) {
      const nextStock = Math.max(0, row.menuItem.stockCount - row.quantity);
      await db
        .update(menuItems)
        .set({
          stockCount: nextStock,
          available: nextStock > 0 && row.menuItem.available,
        })
        .where(eq(menuItems.id, row.menuItem.id));
    }

    await db.delete(cartItems).where(eq(cartItems.userId, user.id));
  } catch {
    const { fallbackOrders, fallbackCarts } = await import("@/lib/store");
    const nextId = fallbackOrders.length + 100;
    order = {
      id: nextId,
      orderNumber,
      studentId: user.id,
      pickupSlotId: slotId,
      paymentMethod,
      status: "placed",
      totalPkr: total,
      notes: body.notes?.trim() || null,
      createdAt: new Date(),
      acceptedAt: null,
      preparingAt: null,
      readyAt: null,
      pickedUpAt: null,
    };
    fallbackOrders.unshift({
      ...order,
      items: cart.map((row) => ({
        id: Math.floor(Math.random() * 10000),
        orderId: nextId,
        menuItemId: row.menuItem.id,
        name: row.menuItem.name,
        unitPrice: row.menuItem.pricePkr,
        quantity: row.quantity,
      })),
      slot,
    });
    fallbackCarts.delete(user.id);
  }

  return Response.json({ order, slot });
}

export async function GET() {
  const { user, error } = await requireUser(["student"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const cart = await getCart(user.id);
  const slots = await getSlotsWithUsage();
  const total = cart.reduce((s, i) => s + i.menuItem.pricePkr * i.quantity, 0);
  return Response.json({
    cart,
    total,
    slots,
    user,
  });
}
