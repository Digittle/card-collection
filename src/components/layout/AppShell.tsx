"use client";

import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F4F5F6]">
      <div className="pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}
