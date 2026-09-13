import { eq } from "drizzle-orm";
import { db } from "@/db";
import { menuItems, restockRequests } from "@/db/schema";
import { DashboardCard } from "@/components/ui";
import { FALLBACK_MENU } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SupplierDashboard() {
  let menu = FALLBACK_MENU;
  let pendingCount = 1;
  try {
    const dbMenu = await db.select().from(menuItems);
    if (dbMenu.length > 0) menu = dbMenu;
    const pending = await db.select().from(restockRequests).where(eq(restockRequests.status, "pending"));
    pendingCount = pending.length;
  } catch {
    // Database offline, use fallback data
  }
  const low = menu.filter((m) => m.stockCount <= 10);

  return (
    <main>
      <h1 className="font-display text-4xl text-navy">Supplier portal</h1>
      <p className="mt-2 text-ocean">
        Karachi Fresh Supplies · keep Bahria University cafeteria stocked before the lunch rush.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <DashboardCard label="Pending requests" value={pendingCount} accent />
        <DashboardCard label="Low stock items" value={low.length} />
        <DashboardCard label="Menu items tracked" value={menu.length} />
      </div>
      <section className="mt-8 rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl">Needs attention</h2>
        <ul className="mt-4 space-y-3">
          {low.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="font-bold">{item.name}</span>
              <span className={item.stockCount === 0 ? "font-bold text-red-600" : "text-ocean"}>
                {item.stockCount === 0 ? "Out of Stock" : `${item.stockCount} left`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
