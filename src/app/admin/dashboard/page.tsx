import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardStats, listOrders } from "@/lib/data";
import { DashboardCard, StatusBadge } from "@/components/ui";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;
  const stats = await getDashboardStats();
  const recent = await listOrders();

  if (user.role === "staff") {
    return (
      <main>
        <h1 className="font-display text-4xl text-navy">Staff kitchen board</h1>
        <p className="mt-2 text-ocean">Prioritise upcoming pickup times during the lunch rush.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <DashboardCard label="New" value={stats.statusCounts.placed} />
          <DashboardCard label="Accepted" value={stats.statusCounts.accepted} />
          <DashboardCard label="Preparing" value={stats.statusCounts.preparing} />
          <DashboardCard label="Ready" value={stats.statusCounts.ready} />
          <DashboardCard label="Completed" value={stats.statusCounts.picked_up} accent />
        </div>
        <RushSlots slots={stats.slots} />
        <Link href="/admin/orders" className="btn-primary mt-6">
          Open order queue
        </Link>
        <Link href="/admin/students" className="btn-ghost mt-3 ml-2">
          View student contacts
        </Link>
      </main>
    );
  }

  if (user.role === "manager") {
    return (
      <main>
        <h1 className="font-display text-4xl text-navy">Cafeteria manager</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard label="Orders today" value={stats.totalOrdersToday} accent />
          <DashboardCard label="Sales today" value={formatPkr(stats.salesToday)} />
          <DashboardCard label="Pending orders" value={stats.pending} />
          <DashboardCard
            label="Peak pickup"
            value={stats.peakSlot?.label ?? "—"}
            hint={stats.peakSlot ? `${stats.peakSlot.booked}/${stats.peakSlot.capacity}` : ""}
          />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-5">
            <h2 className="font-display text-2xl">Popular food today</h2>
            <ul className="mt-4 space-y-3">
              {stats.popular.map((p) => (
                <li key={p.name} className="flex justify-between text-sm font-semibold">
                  <span>{p.name}</span>
                  <span className="text-ocean">{p.qty} sold</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-5">
            <h2 className="font-display text-2xl">Out of stock</h2>
            {stats.outOfStock.length === 0 ? (
              <p className="mt-3 text-ocean">All items available.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {stats.outOfStock.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-bold text-red-600">Out of Stock</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["/admin/menu", "Manage menu"],
            ["/admin/menu", "Manage availability"],
            ["/admin/menu", "Manage prices"],
            ["/admin/pickup-slots", "Manage pickup slots"],
            ["/admin/reports", "View reports"],
            ["/admin/orders", "View orders"],
            ["/admin/team", "View operations team"],
            ["/admin/students", "View student contacts"],
            ["/admin/deliveries", "View supplier deliveries"],
          ].map(([href, label]) => (
            <Link key={label} href={href} className="rounded-2xl bg-white px-4 py-5 font-bold text-navy shadow-sm">
              {label} →
            </Link>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">University administration</h1>
      <p className="mt-2 text-ocean">Monitor cafeteria performance for Bahria University Karachi.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Daily orders" value={stats.totalOrdersToday} accent />
        <DashboardCard label="Daily sales" value={formatPkr(stats.salesToday)} />
        <DashboardCard label="Avg processing" value={`${stats.avgMinutes} min`} />
        <DashboardCard label="Active students" value={stats.activeStudents} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-2xl">Peak cafeteria hours</h2>
          <div className="mt-4 space-y-3">
            {stats.slots
              .slice()
              .sort((a, b) => b.booked - a.booked)
              .slice(0, 6)
              .map((slot) => (
                <div key={slot.id}>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{slot.label}</span>
                    <span>
                      {slot.booked}/{slot.capacity}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-ice">
                    <div
                      className="h-full rounded-full bg-cyan"
                      style={{ width: `${Math.min(100, (slot.booked / slot.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-2xl">Most popular food</h2>
          <ul className="mt-4 space-y-3">
            {stats.popular.map((p) => (
              <li key={p.name} className="flex justify-between">
                <span>{p.name}</span>
                <span className="font-bold text-ocean">{p.qty}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ocean">
            Lifetime orders {stats.totalOrdersAll} · Lifetime sales {formatPkr(stats.totalSalesAll)}
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl">Recent cafeteria activity</h2>
        <div className="mt-4 space-y-3">
          {recent.slice(0, 6).map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-bold">{order.orderNumber}</span>
              <span>{order.studentName}</span>
              <span>{order.slotLabel}</span>
              <StatusBadge status={order.status} />
            </div>
          ))}
        </div>
        <Link href="/admin/users" className="btn-primary mt-5">
          Manage authorized users
        </Link>
      </div>
    </main>
  );
}

function RushSlots({
  slots,
}: {
  slots: Array<{ id: number; label: string; booked: number; capacity: number; full: boolean }>;
}) {
  return (
    <section className="mt-8 rounded-3xl bg-white p-5">
      <h2 className="font-display text-2xl">Rush-hour indicator</h2>
      <p className="text-sm text-ocean">Orders scheduled against each pickup slot today.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`rounded-2xl border p-3 ${slot.full ? "border-red-300 bg-red-50" : "border-sky"}`}
          >
            <p className="font-bold">{slot.label}</p>
            <p className="text-sm">
              {slot.booked}/{slot.capacity} {slot.full ? "· FULL" : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
