import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { SupplierSidebar } from "@/components/shells";

export const dynamic = "force-dynamic";

export default async function SupplierLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?portal=supplier");
  if (user.role !== "supplier") redirect("/unauthorized");

  return (
    <div className="min-h-screen bg-ice md:flex">
      <SupplierSidebar name={user.name} />
      <div className="flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
