"use client";

import { useState, useEffect, useRef } from "react";
import { Rarity } from "@/types";

const RARITY_RANGES: Record<Rarity, [number, number]> = {
  common: [8, 18],
  rare: [12, 25],
  epic: [18, 35],
  legendary: [25, 50],
};

export function useCardViewers(cardId: string, rarity: Rarity): number {
  const [min, max] = RARITY_RANGES[rarity];

  const [viewerCount, setViewerCount] = useState(
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 3000 + Math.floor(Math.random() * 2001); // 3000-5000ms
      intervalRef.current = setTimeout(() => {
        setViewerCount((prev) => {
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2 covers ±1-3 range including 0
          const stepped = Math.floor(Math.random() * 3) + 1; // 1-3 magnitude
          const direction = Math.random() < 0.5 ? -1 : 1;
          const change = direction * stepped;
          return Math.max(min, Math.min(max, prev + change));
        });
        scheduleNext();
      }, delay) as unknown as ReturnType<typeof setInterval>;
    };

    scheduleNext();

    return () => {
      if (intervalRef.current !== null) {
        clearTimeout(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    };
  }, [cardId, rarity, min, max]);

  return viewerCount;
}
