"use client";

import { ChevronLeft, Coins } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  coins?: number;
  variant?: "default" | "transparent";
}

export function Header({
  title,
  showBack = false,
  rightAction,
  coins,
  variant = "default",
}: HeaderProps) {
  const router = useRouter();

  const bgClass =
    variant === "transparent"
      ? "absolute inset-x-0 top-0 z-40"
      : "glass-dark sticky top-0 z-40";

  return (
    <header className={bgClass}>
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="flex w-12 items-center">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex h-12 w-12 items-center justify-center rounded-full text-gray-600 transition-colors active:bg-black/5"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
        </div>
        <h1 className="text-[18px] font-bold text-gray-900">{title}</h1>
        <div className="flex items-center justify-end gap-2">
          {coins !== undefined && (
            <div className="flex items-center gap-1 rounded-full bg-gold-300/10 px-2.5 py-1">
              <Coins className="h-3.5 w-3.5 text-gold-300" />
              <span className="text-[12px] font-bold tabular-nums text-gold-400">
                {coins.toLocaleString()}
              </span>
            </div>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
}
