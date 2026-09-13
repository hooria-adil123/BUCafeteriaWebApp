import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { nextStatus } from "@/lib/utils";

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
  const [current] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number(id)))
    .limit(1);
  if (!current) return Response.json({ error: "Order not found." }, { status: 404 });

  const target = body.status || nextStatus(current.status);
  if (!target) {
    return Response.json({ error: "Order is already completed." }, { status: 400 });
  }

  const now = new Date();
  const patch: Partial<typeof orders.$inferInsert> = { status: target };
  if (target === "accepted") patch.acceptedAt = now;
  if (target === "preparing") patch.preparingAt = now;
  if (target === "ready") patch.readyAt = now;
  if (target === "picked_up") patch.pickedUpAt = now;

  const [order] = await db
    .update(orders)
    .set(patch)
    .where(eq(orders.id, current.id))
    .returning();
  return Response.json({ order });
}
