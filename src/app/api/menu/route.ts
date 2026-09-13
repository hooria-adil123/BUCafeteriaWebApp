import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getMenu } from "@/lib/data";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const items = await getMenu();
  return Response.json({ items });
}

export async function POST(request: Request) {
  await ensureSeeded();
  const { user, error } = await requireUser(["manager"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    category?: string;
    pricePkr?: number;
    imageUrl?: string;
    available?: boolean;
    popular?: boolean;
    stockCount?: number;
  };

  if (!body.name || !body.description || !body.category || !body.pricePkr) {
    return Response.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const [item] = await db
    .insert(menuItems)
    .values({
      name: body.name.trim(),
      description: body.description.trim(),
      category: body.category,
      pricePkr: Number(body.pricePkr),
      imageUrl: body.imageUrl?.trim() || "/images/hero-cafeteria.jpg",
      available: body.available ?? true,
      popular: body.popular ?? false,
      stockCount: Number(body.stockCount ?? 20),
    })
    .returning();

  return Response.json({ item });
}
