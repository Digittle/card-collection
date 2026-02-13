"use client";

import { useCardViewers } from "@/hooks/useCardViewers";
import { Rarity } from "@/types";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface LiveViewerBadgeProps {
  cardId: string;
  rarity: Rarity;
}

export function LiveViewerBadge({ cardId, rarity }: LiveViewerBadgeProps) {
  const viewerCount = useCardViewers(cardId, rarity);

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-matcha-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-matcha-400" />
      </span>
      <span className="text-[12px] text-white/60">
        今<AnimatedCounter value={viewerCount} className="font-bold text-white/80" />人が見ています
      </span>
    </div>
  );
}
