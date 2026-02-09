"use client";

import { ChevronLeft, Coins } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  coins?: number;
}

export function Header({ title, showBack = false, rightAction, coins }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="glass-strong sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="flex w-12 items-center">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex h-12 w-12 items-center justify-center rounded-full text-gray-500 transition-colors hover:text-gray-900 active:bg-black/5"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
        </div>
        {/* 20px Bold per typography guidelines */}
        <h1 className="text-[18px] font-bold text-gray-900">{title}</h1>
        <div className="flex items-center justify-end gap-2">
          {coins !== undefined && (
            <div className="rounded-full bg-gold-400/10 px-2.5 py-1 flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-[12px] font-bold tabular-nums text-gold-300">{coins}</span>
            </div>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
}
