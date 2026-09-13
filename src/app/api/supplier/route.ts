import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { inventoryLogs, menuItems, restockRequests, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { FALLBACK_MENU } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const { user, error } = await requireUser(["supplier", "manager", "admin"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }

  try {
    const menu = await db.select().from(menuItems);
    const requests = await db
      .select({
        request: restockRequests,
        itemName: menuItems.name,
        requester: users.name,
      })
      .from(restockRequests)
      .innerJoin(menuItems, eq(restockRequests.menuItemId, menuItems.id))
      .innerJoin(users, eq(restockRequests.requestedBy, users.id))
      .orderBy(desc(restockRequests.createdAt));

    const logs = await db
      .select({
        log: inventoryLogs,
        itemName: menuItems.name,
      })
      .from(inventoryLogs)
      .innerJoin(menuItems, eq(inventoryLogs.menuItemId, menuItems.id))
      .orderBy(desc(inventoryLogs.createdAt));

    return Response.json({
      menu: menu.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        stockCount: m.stockCount,
        available: m.available,
      })),
      requests: requests.map((r) => ({ ...r.request, itemName: r.itemName, requester: r.requester })),
      logs: logs.map((l) => ({ ...l.log, itemName: l.itemName })),
    });
  } catch {
    return Response.json({
      menu: FALLBACK_MENU.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        stockCount: m.stockCount,
        available: m.available,
      })),
      requests: [
        {
          id: 1,
          menuItemId: 2,
          itemName: "Spaghetti",
          quantity: 40,
          status: "pending",
          requester: "Nadia Sheikh",
          notes: "Spaghetti sold out during lunch rush. Please deliver before 11 AM tomorrow.",
          createdAt: new Date().toISOString(),
        },
      ],
      logs: [
        {
          id: 1,
          menuItemId: 16,
          itemName: "Chai",
          quantity: 50,
          note: "Weekly tea supplies delivered.",
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }
}

export async function POST(request: Request) {
  await ensureSeeded();
  const { user, error } = await requireUser(["manager", "supplier"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    action?: string;
    menuItemId?: number;
    quantity?: number;
    notes?: string;
    requestId?: number;
    status?: string;
  };

  if (body.action === "request" && user.role === "manager") {
    const [row] = await db
      .insert(restockRequests)
      .values({
        menuItemId: Number(body.menuItemId),
        quantity: Number(body.quantity ?? 20),
        notes: body.notes ?? null,
        requestedBy: user.id,
        status: "pending",
      })
      .returning();
    return Response.json({ request: row });
  }

  if (body.action === "update-request" && user.role === "supplier") {
    const status = body.status ?? "shipped";
    const [row] = await db
      .update(restockRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(restockRequests.id, Number(body.requestId)))
      .returning();

    if (status === "received" || status === "shipped") {
      const [item] = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, row.menuItemId))
        .limit(1);
      if (item && status === "received") {
        const nextStock = item.stockCount + row.quantity;
        await db
          .update(menuItems)
          .set({ stockCount: nextStock, available: nextStock > 0 })
          .where(eq(menuItems.id, item.id));
        await db.insert(inventoryLogs).values({
          menuItemId: item.id,
          supplierId: user.id,
          quantity: row.quantity,
          note: `Fulfilled restock request #${row.id}`,
        });
      }
    }
    return Response.json({ request: row });
  }

  if (body.action === "deliver" && user.role === "supplier") {
    const qty = Number(body.quantity ?? 0);
    const menuItemId = Number(body.menuItemId);
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, menuItemId)).limit(1);
    if (!item) return Response.json({ error: "Item not found." }, { status: 404 });
    const nextStock = item.stockCount + qty;
    await db
      .update(menuItems)
      .set({ stockCount: nextStock, available: nextStock > 0 })
      .where(eq(menuItems.id, item.id));
    const [log] = await db
      .insert(inventoryLogs)
      .values({
        menuItemId: item.id,
        supplierId: user.id,
        quantity: qty,
        note: body.notes ?? "Direct delivery",
      })
      .returning();
    return Response.json({ log, stockCount: nextStock });
  }

  return Response.json({ error: "Unsupported action." }, { status: 400 });
}
