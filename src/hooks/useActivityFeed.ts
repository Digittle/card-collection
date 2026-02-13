"use client";

import { useState, useEffect, useRef } from "react";
import { DEMO_CARDS } from "@/lib/cards-data";
import { CARD_THEMES } from "@/lib/cards-data";
import { NAME_POOL, AVATAR_COLORS } from "@/lib/community-simulator";

interface ActivityFeedItem {
  id: string;
  message: string;
  timestamp: string;
  cardId: string;
  userName: string;
  userColor: string;
  userInitial: string;
}

const ACTIVITY_LOG_KEY = "dcc_activity_feed";

function getStoredItems(): ActivityFeedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeItems(items: ActivityFeedItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(items.slice(0, 50)));
}

function generateItem(): ActivityFeedItem {
  const name = NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const card = DEMO_CARDS[Math.floor(Math.random() * DEMO_CARDS.length)];
  const isComplete = Math.random() < 0.1;

  let message: string;
  if (isComplete) {
    const theme = CARD_THEMES.find((t) => t.id === card.themeId);
    const themeName = theme ? theme.name : card.series;
    message = `${name}さんが${themeName}をコンプリートしました！`;
  } else {
    message = `${name}さんが「${card.title}」を取得しました`;
  }

  return {
    id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    timestamp: new Date().toISOString(),
    cardId: card.id,
    userName: name,
    userColor: color,
    userInitial: name.charAt(0),
  };
}

export function useActivityFeed(options?: {
  maxItems?: number;
  intervalRange?: [number, number];
}): {
  items: ActivityFeedItem[];
  latestItem: ActivityFeedItem | null;
} {
  const maxItems = options?.maxItems ?? 20;
  const intervalRange = options?.intervalRange ?? [3000, 8000];

  const [items, setItems] = useState<ActivityFeedItem[]>(() => getStoredItems().slice(0, maxItems));
  const [latestItem, setLatestItem] = useState<ActivityFeedItem | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleNext = () => {
      const [minDelay, maxDelay] = intervalRange;
      const delay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay + 1));

      timeoutRef.current = setTimeout(() => {
        const newItem = generateItem();

        setItems((prev) => {
          const updated = [newItem, ...prev].slice(0, maxItems);
          storeItems(updated);
          return updated;
        });
        setLatestItem(newItem);

        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [maxItems, intervalRange]);

  return { items, latestItem };
}

export type { ActivityFeedItem };
