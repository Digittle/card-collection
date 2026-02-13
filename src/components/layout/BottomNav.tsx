"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, ShoppingBag, LayoutGrid, Clock, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/gacha", label: "ガチャ", icon: Sparkles },
  { href: "/shop", label: "ショップ", icon: ShoppingBag },
  { href: "/collection", label: "コレクション", icon: LayoutGrid },
  { href: "/history", label: "ヒストリー", icon: Clock },
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
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] tracking-wide transition-all ${
                isActive
                  ? "font-bold text-primary-500"
                  : "font-medium text-gray-400 active:text-gray-600"
              }`}
            >
              {isActive && <span className="nav-indicator" />}
              <Icon
                className={`h-[20px] w-[20px] ${
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
