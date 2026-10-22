"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/zones", label: "Zones" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
];

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border">
      <div className="max-w-5xl w-full mx-auto flex items-center gap-6 px-6 h-16">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary-soft text-base">🚚</span>
          <span>Delivery</span>
        </Link>
        <nav className="flex gap-1 flex-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors " +
                  (active
                    ? "bg-primary-soft text-primary"
                    : "text-slate-600 hover:bg-slate-100")
                }
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="text-sm font-medium text-slate-600 hover:text-danger transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
