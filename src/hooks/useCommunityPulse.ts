"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/types";
import {
  getActiveUserCount,
  getTodayClaimCount,
  getTrendingCards,
  tickSimulation,
} from "@/lib/community-simulator";

interface CommunityPulse {
  activeUserCount: number;
  todayClaimCount: number;
  trendingCards: Card[];
}

export function useCommunityPulse(): CommunityPulse {
  const [activeUserCount, setActiveUserCount] = useState(() => getActiveUserCount());
  const [todayClaimCount, setTodayClaimCount] = useState(() => getTodayClaimCount());
  const [trendingCards, setTrendingCards] = useState<Card[]>(() => getTrendingCards());

  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    // Update active user count every 5s with random walk ±3, clamped 15-50
    const userCountInterval = setInterval(() => {
      setActiveUserCount((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(15, Math.min(50, prev + delta));
      });
    }, 5000);

    // Increment today's claim count every 15s by 1-3
    const claimCountInterval = setInterval(() => {
      setTodayClaimCount((prev) => {
        const increment = Math.floor(Math.random() * 3) + 1; // 1-3
        return prev + increment;
      });
    }, 15000);

    // Tick simulation every 20s
    const tickInterval = setInterval(() => {
      tickSimulation();
    }, 20000);

    // Update trending cards every 30s
    const trendingInterval = setInterval(() => {
      setTrendingCards(getTrendingCards());
    }, 30000);

    intervalsRef.current = [
      userCountInterval,
      claimCountInterval,
      tickInterval,
      trendingInterval,
    ];

    return () => {
      intervalsRef.current.forEach((id) => clearInterval(id));
      intervalsRef.current = [];
    };
  }, []);

  return { activeUserCount, todayClaimCount, trendingCards };
}
