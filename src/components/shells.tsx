"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLink } from "@/components/brand";
import { ROLE_LABELS } from "@/lib/utils";

async function logout() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export function PublicNav() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandLink size={64} />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="hidden font-bold text-white sm:block">
            Login
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function StudentNav({
  name,
  cartCount,
}: {
  name: string;
  cartCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/student/dashboard", label: "Home" },
    { href: "/student/menu", label: "Menu" },
    { href: "/student/orders", label: "My Orders" },
    { href: "/student/cart", label: `Cart${cartCount ? ` (${cartCount})` : ""}` },
    { href: "/student/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-sky bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <BrandLink href="/student/dashboard" />
        <nav className="hidden items-center gap-5 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-bold ${pathname === l.href ? "text-cyan" : "text-ice"}`}
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            className="text-sm font-bold text-sky"
            onClick={async () => {
              await logout();
              window.location.assign("/");
            }}
          >
            Logout
          </button>
        </nav>
        <button className="md:hidden" type="button" onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
      </div>
      {open ? (
        <div className="space-y-2 border-t border-ocean px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block py-1 font-bold text-ice">
              {l.label}
            </Link>
          ))}
          <p className="text-xs text-sky">Hi, {name}</p>
          <button
            type="button"
            className="font-bold text-cyan"
            onClick={async () => {
              await logout();
              window.location.assign("/");
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </header>
  );
}

export function AdminSidebar({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  const pathname = usePathname();
  const all = [
    { href: "/admin/dashboard", label: "Dashboard", roles: ["staff", "manager", "admin"] },
    { href: "/admin/orders", label: "Orders", roles: ["staff", "manager", "admin"] },
    { href: "/admin/menu", label: "Menu", roles: ["manager"] },
    { href: "/admin/pickup-slots", label: "Pickup slots", roles: ["manager"] },
    { href: "/admin/reports", label: "Reports", roles: ["manager", "admin"] },
    { href: "/admin/users", label: "Users & roles", roles: ["admin"] },
  ];
  const links = all.filter((l) => l.roles.includes(role));

  return (
    <aside className="flex w-full flex-col bg-navy text-white md:min-h-screen md:w-72">
      <div className="border-b border-ocean p-5">
        <BrandLink href="/admin/dashboard" />
        <p className="mt-4 text-sm font-bold">{name}</p>
        <p className="text-xs text-sky">{ROLE_LABELS[role]}</p>
      </div>
      <nav className="flex flex-1 flex-wrap gap-1 p-3 md:flex-col">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-2xl px-4 py-3 text-sm font-bold ${
              pathname === l.href ? "bg-ocean text-white" : "text-ice hover:bg-ocean/40"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        className="m-4 rounded-2xl bg-ocean/30 px-4 py-3 text-left text-sm font-bold"
        onClick={async () => {
          await logout();
          window.location.assign("/login?portal=admin");
        }}
      >
        Logout
      </button>
    </aside>
  );
}

export function SupplierSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const links = [
    { href: "/supplier/dashboard", label: "Dashboard" },
    { href: "/supplier/inventory", label: "Inventory" },
    { href: "/supplier/requests", label: "Restock requests" },
  ];
  return (
    <aside className="flex w-full flex-col bg-navy text-white md:min-h-screen md:w-72">
      <div className="border-b border-ocean p-5">
        <BrandLink href="/supplier/dashboard" />
        <p className="mt-4 text-sm font-bold">{name}</p>
        <p className="text-xs text-sky">Food Supplier</p>
      </div>
      <nav className="flex flex-1 flex-wrap gap-1 p-3 md:flex-col">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-2xl px-4 py-3 text-sm font-bold ${
              pathname === l.href ? "bg-ocean text-white" : "text-ice hover:bg-ocean/40"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        className="m-4 rounded-2xl bg-ocean/30 px-4 py-3 text-left text-sm font-bold"
        onClick={async () => {
          await logout();
          window.location.assign("/login?portal=supplier");
        }}
      >
        Logout
      </button>
    </aside>
  );
}
