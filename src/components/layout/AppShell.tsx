"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { BadgeCelebration } from "@/components/ui/BadgeCelebration";
import { getBadgeQueue, popBadgeQueue, getEarnedBadges } from "@/lib/store";
import { getBadgeById } from "@/lib/badges-data";
import { Badge } from "@/types";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [celebratingBadge, setCelebratingBadge] = useState<Badge | null>(null);

  useEffect(() => {
    // Check badge queue on mount and after any state change
    const checkQueue = () => {
      const queue = getBadgeQueue();
      if (queue.length > 0) {
        const badgeId = popBadgeQueue();
        if (badgeId) {
          const badge = getBadgeById(badgeId);
          if (badge) setCelebratingBadge(badge);
        }
      }
    };
    checkQueue();
    // Also listen for focus events to catch badges earned in other flows
    window.addEventListener("focus", checkQueue);
    return () => window.removeEventListener("focus", checkQueue);
  }, []);

  const handleDismiss = () => {
    setCelebratingBadge(null);
    // Check if more badges in queue
    setTimeout(() => {
      const queue = getBadgeQueue();
      if (queue.length > 0) {
        const badgeId = popBadgeQueue();
        if (badgeId) {
          const badge = getBadgeById(badgeId);
          if (badge) setCelebratingBadge(badge);
        }
      }
    }, 500);
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F4F5F6]">
      <div className="pb-20">{children}</div>
      <BottomNav />
      <BadgeCelebration badge={celebratingBadge} onDismiss={handleDismiss} />
    </div>
  );
}
