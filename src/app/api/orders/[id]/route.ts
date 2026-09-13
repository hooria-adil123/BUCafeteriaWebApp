import { requireUser } from "@/lib/auth";
import { getOrderWithItems } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser();
  if (error || !user) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const { id } = await params;
  const order = await getOrderWithItems(Number(id));
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  if (user.role === "student" && order.studentId !== user.id) {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  if (user.role === "supplier") {
    return Response.json(
      { error: "You don’t have permission to access this page." },
      { status: 403 },
    );
  }
  const student = order.student
    ? {
        id: order.student.id,
        name: order.student.name,
        email: order.student.email,
        enrollmentId: order.student.enrollmentId,
        role: order.student.role,
      }
    : null;
  return Response.json({ order: { ...order, student } });
}
