"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, ShoppingBag, LayoutGrid, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/gacha", label: "ガチャ", icon: Sparkles },
  { href: "/shop", label: "ショップ", icon: ShoppingBag },
  { href: "/collection", label: "コレクション", icon: LayoutGrid },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-dark-strong fixed inset-x-0 bottom-0 z-50 pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-1 py-3.5 text-[11px] tracking-wide transition-all ${
                isActive
                  ? "font-bold text-primary-400"
                  : "font-medium text-white/30 active:text-white/50"
              }`}
            >
              {isActive && <span className="nav-indicator" />}
              <Icon
                className={`h-[22px] w-[22px] ${
                  isActive ? "stroke-[2.5]" : "stroke-[1.5]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
