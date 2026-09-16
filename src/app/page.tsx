import Link from "next/link";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { PublicNav } from "@/components/shells";
import { HeroSlideshow } from "@/components/slideshow";
import { FoodCard } from "@/components/food";
import { Logo } from "@/components/brand";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let popular: (typeof menuItems.$inferSelect)[] = [];
  try {
    popular = await db.select().from(menuItems).where(eq(menuItems.popular, true)).limit(6);
  } catch {
    popular = [];
  }

  return (
    <main className="bg-ice">
      <PublicNav />
      <HeroSlideshow />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ocean">Three portals</p>
        <h2 className="mt-2 font-display text-4xl text-navy">Built for every cafeteria stakeholder</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              href: "/login?portal=student",
              title: "Student Portal",
              body: "Browse the menu, add to cart, pick a slot, pay by wallet or cash, and track your order.",
            },
            {
              href: "/login?portal=admin",
              title: "Admin Portal",
              body: "Role-based access for cafeteria staff, managers and the university administrator.",
            },
            {
              href: "/login?portal=supplier",
              title: "Food Supplier",
              body: "See low stock, fulfil restock requests and log deliveries for the Karachi campus cafe.",
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="card-hover rounded-3xl bg-white p-6 shadow-sm"
            >
              <h3 className="font-display text-2xl text-navy">{card.title}</h3>
              <p className="mt-3 text-ocean">{card.body}</p>
              <p className="mt-5 font-bold text-cyan">Enter portal →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-ocean">Today’s favourites</p>
              <h2 className="mt-2 font-display text-4xl text-navy">Popular cafeteria items</h2>
            </div>
            <Link href="/login?portal=student" className="btn-primary hidden sm:inline-flex">
              Order now
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-2">
        <div className="rounded-3xl bg-navy p-8 text-white">
          <h2 className="font-display text-3xl">How pre-ordering works</h2>
          <ol className="mt-6 space-y-4 text-ice">
            <li>
              <b className="text-cyan">1. Menu</b> — choose available food in PKR.
            </li>
            <li>
              <b className="text-cyan">2. Cart</b> — adjust quantities before checkout.
            </li>
            <li>
              <b className="text-cyan">3. Pickup time</b> — full rush-hour slots are blocked.
            </li>
            <li>
              <b className="text-cyan">4. Payment</b> — cash at cafeteria or university wallet.
            </li>
            <li>
              <b className="text-cyan">5. Slip + tracking</b> — collect when status is Ready.
            </li>
          </ol>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="font-display text-3xl text-navy">Cafeteria hours</h2>
          <p className="mt-3 text-ocean">Karachi Campus · Monday to Saturday</p>
          <p className="mt-6 font-display text-4xl text-ocean">8:30 AM – 5:20 PM</p>
          <p className="mt-4 text-sm text-ocean">
            Peak lunch window is 12:15–1:30 PM. Pickup slot capacity spreads orders so the counter
            never overloads.
          </p>
          <div className="mt-6 rounded-2xl bg-ice p-4 text-sm">
            <p className="font-bold text-navy">Risk controls in this system</p>
            <p className="mt-2 text-ocean">Rush-hour overload → timed pickup slots with a 10-order cap.</p>
            <p className="text-ocean">Incorrect availability → live out-of-stock + checkout re-check.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-sky bg-navy py-10 text-ice">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <Logo size={72} />
            <div>
              <p className="font-bold">Bahria University Cafeteria</p>
              <p className="text-sm text-sky">Karachi Campus · Pre-order web app</p>
            </div>
          </div>
          <p className="text-sm text-sky">Supplier is an operational partner with a dedicated portal.</p>
        </div>
      </footer>
    </main>
  );
}
