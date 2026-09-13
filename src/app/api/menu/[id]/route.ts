import { eq } from "drizzle-orm";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(["manager", "admin"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  if (user.role === "admin") {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const patch: Partial<typeof menuItems.$inferInsert> = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.description === "string") patch.description = body.description;
  if (typeof body.category === "string") patch.category = body.category;
  if (typeof body.pricePkr === "number") patch.pricePkr = body.pricePkr;
  if (typeof body.imageUrl === "string") patch.imageUrl = body.imageUrl;
  if (typeof body.available === "boolean") patch.available = body.available;
  if (typeof body.popular === "boolean") patch.popular = body.popular;
  if (typeof body.stockCount === "number") {
    patch.stockCount = body.stockCount;
    if (body.stockCount <= 0) patch.available = false;
    if (body.stockCount > 0 && body.available !== false) patch.available = true;
  }

  const [item] = await db
    .update(menuItems)
    .set(patch)
    .where(eq(menuItems.id, Number(id)))
    .returning();
  if (!item) return Response.json({ error: "Item not found." }, { status: 404 });
  return Response.json({ item });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(["manager"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const { id } = await params;
  await db.delete(menuItems).where(eq(menuItems.id, Number(id)));
  return Response.json({ ok: true });
}
