import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardStats, listOrders } from "@/lib/data";
import { DashboardCard, StatusBadge } from "@/components/ui";
import { formatDateTime, formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!["manager", "admin"].includes(user.role)) redirect("/unauthorized");
  const stats = await getDashboardStats();
  const orders = await listOrders();

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Cafeteria reports</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Orders today" value={stats.totalOrdersToday} accent />
        <DashboardCard label="Sales today" value={formatPkr(stats.salesToday)} />
        <DashboardCard label="Avg processing" value={`${stats.avgMinutes} min`} />
        <DashboardCard label="Pending restocks" value={stats.restockPending} />
      </div>
      <div className="mt-6 overflow-auto rounded-3xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-ice text-left text-xs uppercase tracking-wide text-ocean">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Student</th>
              <th className="p-3">Pickup</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">When</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-sky">
                <td className="p-3 font-bold">{order.orderNumber}</td>
                <td className="p-3">{order.studentName}</td>
                <td className="p-3">{order.slotLabel}</td>
                <td className="p-3 capitalize">{order.paymentMethod}</td>
                <td className="p-3">{formatPkr(order.totalPkr)}</td>
                <td className="p-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="p-3">{formatDateTime(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
