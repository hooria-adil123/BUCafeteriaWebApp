import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/data";
import { StudentNav } from "@/components/shells";
import { HoursSimulator } from "@/components/hours-simulator";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?portal=student");
  if (user.role !== "student") redirect("/unauthorized");
  const cart = await getCart(user.id);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="min-h-screen bg-ice">
      <StudentNav name={user.name} cartCount={cartCount} />
      <HoursSimulator />
      {children}
    </div>
  );
}
