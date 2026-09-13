import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { getCart } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user) return Response.json({ user: null });
  const cart = user.role === "student" ? await getCart(user.id) : [];
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  return Response.json({ user, cartCount });
}
