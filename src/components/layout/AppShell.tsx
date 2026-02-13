"use client";
import { BottomNav } from "./BottomNav";
import { ActivityToast } from "@/components/community/ActivityToast";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#030712]">
      <div className="pb-20">{children}</div>
      <BottomNav />
      <ActivityToast />
    </div>
  );
}
