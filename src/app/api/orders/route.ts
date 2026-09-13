import { requireUser } from "@/lib/auth";
import { listOrders } from "@/lib/data";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeeded();
  const { user, error } = await requireUser();
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;

  if (user.role === "student") {
    const orders = await listOrders({ studentId: user.id, status });
    return Response.json({ orders });
  }
  if (["staff", "manager", "admin"].includes(user.role)) {
    const orders = await listOrders({ status });
    return Response.json({ orders });
  }
  return Response.json(
    { error: "You don’t have permission to access this page." },
    { status: 403 },
  );
}
