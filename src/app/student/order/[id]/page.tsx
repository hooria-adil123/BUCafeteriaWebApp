import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, ORDER_COOKIE, readSignedOrderCookie } from "@/lib/auth";
import { getOrderWithItems } from "@/lib/data";
import { Notice } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { LiveOrderView } from "@/components/live-order";

export const dynamic = "force-dynamic";

export default async function StudentOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const { confirmed } = await searchParams;
  const orderId = Number(id);
  const databaseOrder = await getOrderWithItems(orderId);
  const cachedOrder = readSignedOrderCookie((await cookies()).get(ORDER_COOKIE)?.value ?? "");
  const order =
    databaseOrder ??
    (cachedOrder && cachedOrder.id === orderId && cachedOrder.studentId === user.id ? cachedOrder : null);
  if (!order || order.studentId !== user.id) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {confirmed ? (
        <div className="mb-5 no-print">
          <Notice kind="success">
            Order {order.orderNumber} confirmed. Save or print your pickup slip.
          </Notice>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <h1 className="font-display text-4xl text-navy">{order.orderNumber}</h1>
        <div className="flex gap-2">
          <Link href="/student/orders" className="btn-ghost">
            All orders
          </Link>
          <PrintButton />
        </div>
      </div>

      <LiveOrderView
        initial={{
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalPkr: order.totalPkr,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt.toISOString(),
          acceptedAt: order.acceptedAt?.toISOString() ?? null,
          preparingAt: order.preparingAt?.toISOString() ?? null,
          readyAt: order.readyAt?.toISOString() ?? null,
          pickedUpAt: order.pickedUpAt?.toISOString() ?? null,
          student: order.student
            ? { name: order.student.name, enrollmentId: order.student.enrollmentId }
            : undefined,
          slot: order.slot ? { label: order.slot.label } : undefined,
          items: order.items,
        }}
        studentName={user.name}
        enrollmentId={user.enrollmentId}
      />
    </main>
  );
}
