"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/zones", label: "Zones", icon: "🗺️" },
  { href: "/products", label: "Products", icon: "📦" },
  { href: "/orders", label: "Orders", icon: "🛒" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-3xl mx-auto grid grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                "flex flex-col items-center justify-center h-16 text-[11px] font-medium transition-colors " +
                (active ? "text-primary" : "text-slate-500")
              }
            >
              <span className={"text-xl leading-none " + (active ? "scale-110" : "")}>
                {it.icon}
              </span>
              <span className="mt-1">{it.label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center h-16 text-[11px] font-medium text-slate-500"
        >
          <span className="text-xl leading-none">🚪</span>
          <span className="mt-1">Logout</span>
        </button>
      </div>
    </nav>
  );
}
