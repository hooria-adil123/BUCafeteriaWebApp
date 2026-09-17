import Link from "next/link";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { menuItems, orders, pickupSlots } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { formatPkr, getCafeteriaStatus } from "@/lib/utils";
import { FoodCard } from "@/components/food";
import { OrderTracker } from "@/components/orders";
import { DashboardCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const status = getCafeteriaStatus(new Date());

  let currentRows: { order: typeof orders.$inferSelect; slot: typeof pickupSlots.$inferSelect }[] = [];
  let popular: (typeof menuItems.$inferSelect)[] = [];
  let available: (typeof menuItems.$inferSelect)[] = [];

  try {
    const { FALLBACK_MENU } = await import("@/lib/store");
    currentRows = await db
      .select({ order: orders, slot: pickupSlots })
      .from(orders)
      .innerJoin(pickupSlots, eq(orders.pickupSlotId, pickupSlots.id))
      .where(and(eq(orders.studentId, user.id), ne(orders.status, "picked_up")))
      .orderBy(desc(orders.createdAt))
      .limit(1);
    const dbPopular = await db.select().from(menuItems).where(eq(menuItems.popular, true)).limit(4);
    const dbAvailable = await db.select().from(menuItems).where(eq(menuItems.available, true)).limit(8);
    popular = dbPopular.length > 0 ? dbPopular : FALLBACK_MENU.filter((m) => m.popular).slice(0, 4);
    available = dbAvailable.length > 0 ? dbAvailable : FALLBACK_MENU.filter((m) => m.available).slice(0, 8);
  } catch {
    const { FALLBACK_MENU, fallbackOrders } = await import("@/lib/store");
    popular = FALLBACK_MENU.filter((m) => m.popular).slice(0, 4);
    available = FALLBACK_MENU.filter((m) => m.available).slice(0, 8);
    const fbCurrent = fallbackOrders.find((o) => o.studentId === user.id && o.status !== "picked_up");
    if (fbCurrent && fbCurrent.slot) {
      currentRows = [{ order: fbCurrent, slot: fbCurrent.slot }];
    }
  }
  const current = currentRows[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-3xl bg-gradient-to-r from-navy to-ocean p-6 text-white md:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-sky">Student portal</p>
        <h1 className="mt-2 font-display text-4xl">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="mt-2 text-ice">
          Enrollment {user.enrollmentId} · Wallet {formatPkr(user.walletBalance)}
        </p>
        <Link href="/student/menu" className="btn-primary mt-6 bg-cyan text-navy">
          Order now
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DashboardCard label="Wallet balance" value={formatPkr(user.walletBalance)} hint="Simulated university wallet" />
        <DashboardCard
          label="Upcoming pickup"
          value={current ? current.slot.label : "None"}
          hint={current ? `Order ${current.order.orderNumber}` : "Place an order to reserve a slot"}
        />
        <DashboardCard
          label="Order hours"
          value="8:30 AM – 5:30 PM"
          hint={status.isOpen ? "🟢 Open for orders · Mon–Sat" : "🔴 Closed for orders · Mon–Sat"}
          accent={status.isOpen}
        />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-3xl text-navy">Current order</h2>
        {current ? (
          <div className="mt-4">
            <OrderTracker status={current.order.status} />
            <Link href={`/student/order/${current.order.id}`} className="btn-primary mt-4">
              Track order {current.order.orderNumber}
            </Link>
          </div>
        ) : (
          <p className="mt-3 rounded-3xl bg-white p-6 text-ocean">
            No active order. Browse today’s menu and pick a rush-hour slot in a few taps.
          </p>
        )}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-3xl text-navy">Popular food</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
        <Link href="/student/menu" className="btn-ghost mt-6 inline-flex">
          See full menu
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl text-navy">Today’s available food</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {available.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
