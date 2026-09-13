import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { nextStatus, ORDER_FLOW } from "@/lib/utils";
import { fallbackOrders, savePersistedData } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(["staff", "manager"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  let current: typeof orders.$inferSelect | undefined;
  try {
    [current] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(id)))
      .limit(1);
  } catch {
    current = fallbackOrders.find((item) => item.id === Number(id));
  }
  if (!current) current = fallbackOrders.find((item) => item.id === Number(id));
  if (!current) return Response.json({ error: "Order not found." }, { status: 404 });

  const target = body.status || nextStatus(current.status);
  const expected = nextStatus(current.status);
  if (!target || !expected || !ORDER_FLOW.includes(target as (typeof ORDER_FLOW)[number]) || target !== expected) {
    return Response.json({ error: "Orders must move through each stage in sequence." }, { status: 400 });
  }

  const now = new Date();
  const patch: Partial<typeof orders.$inferInsert> = { status: target };
  if (target === "accepted") patch.acceptedAt = now;
  if (target === "preparing") patch.preparingAt = now;
  if (target === "ready") patch.readyAt = now;
  if (target === "picked_up") patch.pickedUpAt = now;

  let order: typeof current;
  try {
    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, current.id))
      .returning();
    order = updated;
  } catch {
    const fallback = fallbackOrders.find((item) => item.id === current.id);
    if (!fallback) return Response.json({ error: "Order not found." }, { status: 404 });
    Object.assign(fallback, patch);
    savePersistedData();
    order = fallback;
  }
  return Response.json({ order });
}
