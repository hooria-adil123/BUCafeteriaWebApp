import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, menuItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/data";
import { FALLBACK_MENU, fallbackCarts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser(["student"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const items = await getCart(user.id);
  const total = items.reduce((s, i) => s + i.menuItem.pricePkr * i.quantity, 0);
  return Response.json({ items, total, walletBalance: user.walletBalance });
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(["student"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const body = (await request.json()) as { menuItemId?: number; quantity?: number };
  const menuItemId = Number(body.menuItemId);
  const quantity = Math.max(1, Number(body.quantity ?? 1));

  try {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, menuItemId)).limit(1);
    if (!item || !item.available || item.stockCount <= 0) {
      return Response.json({ error: "This item is currently unavailable." }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.menuItemId, menuItemId)))
      .limit(1);

    if (existing[0]) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      await db.insert(cartItems).values({ userId: user.id, menuItemId, quantity });
    }
  } catch {
    const item = FALLBACK_MENU.find((m) => m.id === menuItemId);
    if (!item || !item.available || item.stockCount <= 0) {
      return Response.json({ error: "This item is currently unavailable." }, { status: 400 });
    }
    const userCart = fallbackCarts.get(user.id) ?? [];
    const existing = userCart.find((c) => c.menuItem.id === menuItemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      userCart.push({ id: Date.now(), quantity, menuItem: item });
    }
    fallbackCarts.set(user.id, userCart);
  }

  const items = await getCart(user.id);
  return Response.json({ items });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireUser(["student"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const body = (await request.json()) as { id?: number; quantity?: number };
  const id = Number(body.id);
  const quantity = Number(body.quantity);

  try {
    if (quantity <= 0) {
      await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, user.id)));
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(and(eq(cartItems.id, id), eq(cartItems.userId, user.id)));
    }
  } catch {
    const userCart = fallbackCarts.get(user.id) ?? [];
    if (quantity <= 0) {
      fallbackCarts.set(user.id, userCart.filter((c) => c.id !== id));
    } else {
      const entry = userCart.find((c) => c.id === id);
      if (entry) entry.quantity = quantity;
      fallbackCarts.set(user.id, userCart);
    }
  }

  const items = await getCart(user.id);
  const total = items.reduce((s, i) => s + i.menuItem.pricePkr * i.quantity, 0);
  return Response.json({ items, total });
}

export async function DELETE(request: Request) {
  const { user, error } = await requireUser(["student"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  try {
    if (id) {
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, Number(id)), eq(cartItems.userId, user.id)));
    } else {
      await db.delete(cartItems).where(eq(cartItems.userId, user.id));
    }
  } catch {
    if (id) {
      const userCart = fallbackCarts.get(user.id) ?? [];
      fallbackCarts.set(user.id, userCart.filter((c) => c.id !== Number(id)));
    } else {
      fallbackCarts.delete(user.id);
    }
  }

  const items = await getCart(user.id);
  return Response.json({ items });
}
