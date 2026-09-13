import { requireUser } from "@/lib/auth";
import { getDashboardStats, listOrders } from "@/lib/data";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const { user, error } = await requireUser(["manager", "admin", "staff"]);
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const stats = await getDashboardStats();
  const recent = await listOrders();
  return Response.json({ stats, recent: recent.slice(0, 12), role: user.role });
}
