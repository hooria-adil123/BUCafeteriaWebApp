import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listOrders } from "@/lib/data";
import { OrderCard } from "@/components/orders";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function StudentOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const orders = await listOrders({ studentId: user.id });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-4xl text-navy">My orders</h1>
      <p className="mt-2 text-ocean">Every pre-order, pickup slot and payment method in one place.</p>
      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No orders yet"
            action={
              <Link href="/student/menu" className="btn-primary">
                Order now
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              orderNumber={order.orderNumber}
              date={order.createdAt}
              items={order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
              total={order.totalPkr}
              pickup={order.slotLabel}
              payment={order.paymentMethod}
              status={order.status}
              href={`/student/order/${order.id}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
