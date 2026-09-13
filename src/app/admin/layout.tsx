import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/shells";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?portal=admin");
  if (!["staff", "manager", "admin"].includes(user.role)) redirect("/unauthorized");

  return (
    <div className="min-h-screen bg-ice md:flex">
      <AdminSidebar role={user.role} name={user.name} />
      <div className="flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
