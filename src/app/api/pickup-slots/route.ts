import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pickupSlots } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getSlotsWithUsage } from "@/lib/data";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const { user, error } = await requireUser();
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const slots = await getSlotsWithUsage();
  return Response.json({ slots });
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(["manager"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const body = (await request.json()) as {
    label?: string;
    capacity?: number;
    sortOrder?: number;
  };
  if (!body.label) {
    return Response.json({ error: "Pickup time is required." }, { status: 400 });
  }
  const [slot] = await db
    .insert(pickupSlots)
    .values({
      label: body.label.trim(),
      capacity: Number(body.capacity ?? 10),
      sortOrder: Number(body.sortOrder ?? 99),
      active: true,
    })
    .returning();
  return Response.json({ slot });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireUser(["manager"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const body = (await request.json()) as {
    id?: number;
    label?: string;
    capacity?: number;
    active?: boolean;
    sortOrder?: number;
  };
  if (!body.id) return Response.json({ error: "Slot id required." }, { status: 400 });
  const patch: Partial<typeof pickupSlots.$inferInsert> = {};
  if (typeof body.label === "string") patch.label = body.label;
  if (typeof body.capacity === "number") patch.capacity = body.capacity;
  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.sortOrder === "number") patch.sortOrder = body.sortOrder;
  const [slot] = await db
    .update(pickupSlots)
    .set(patch)
    .where(eq(pickupSlots.id, body.id))
    .returning();
  return Response.json({ slot });
}
