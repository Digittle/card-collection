"use client";

import {
  CollabProgramProgress,
  CollabContribution,
  CollabFeedItem,
  CollabBadge,
} from "@/types";

const KEYS = {
  PROGRESS: "dcc_collab_progress",
  CONTRIBUTIONS: "dcc_collab_contributions",
  FEED: "dcc_collab_feed",
  BADGES: "dcc_collab_badges",
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Progress
export function getCollabProgresses(): CollabProgramProgress[] {
  return getItem<CollabProgramProgress[]>(KEYS.PROGRESS, []);
}

export function getCollabProgress(programId: string): CollabProgramProgress | undefined {
  return getCollabProgresses().find((p) => p.programId === programId);
}

export function setCollabProgress(progress: CollabProgramProgress): void {
  const all = getCollabProgresses();
  const index = all.findIndex((p) => p.programId === progress.programId);
  if (index >= 0) {
    all[index] = progress;
  } else {
    all.push(progress);
  }
  setItem(KEYS.PROGRESS, all);
}

// Contributions
export function getCollabContributions(programId: string): CollabContribution[] {
  return getItem<CollabContribution[]>(KEYS.CONTRIBUTIONS, []).filter(
    (c) => c.programId === programId
  );
}

export function addCollabContribution(contribution: CollabContribution): void {
  const all = getItem<CollabContribution[]>(KEYS.CONTRIBUTIONS, []);
  all.push(contribution);
  setItem(KEYS.CONTRIBUTIONS, all);
}

export function addCollabContributions(contributions: CollabContribution[]): void {
  const all = getItem<CollabContribution[]>(KEYS.CONTRIBUTIONS, []);
  all.push(...contributions);
  setItem(KEYS.CONTRIBUTIONS, all);
}

// Feed
export function getCollabFeed(programId: string): CollabFeedItem[] {
  return getItem<CollabFeedItem[]>(KEYS.FEED, []).filter(
    (f) => f.programId === programId
  );
}

export function addCollabFeedItem(item: CollabFeedItem): void {
  const all = getItem<CollabFeedItem[]>(KEYS.FEED, []);
  all.push(item);
  setItem(KEYS.FEED, all);
}

export function addCollabFeedItems(items: CollabFeedItem[]): void {
  const all = getItem<CollabFeedItem[]>(KEYS.FEED, []);
  all.push(...items);
  setItem(KEYS.FEED, all);
}

// Badges
export function getCollabBadges(): CollabBadge[] {
  return getItem<CollabBadge[]>(KEYS.BADGES, []);
}

export function getCollabBadgesForProgram(programId: string): CollabBadge[] {
  return getCollabBadges().filter((b) => b.programId === programId);
}

export function addCollabBadge(badge: CollabBadge): void {
  const all = getCollabBadges();
  if (!all.find((b) => b.id === badge.id)) {
    all.push(badge);
    setItem(KEYS.BADGES, all);
  }
}

// Leaderboard computation
export function computeLeaderboard(
  programId: string,
  currentUserName: string
): { userName: string; totalPoints: number; rank: number; isCurrentUser: boolean }[] {
  const contributions = getCollabContributions(programId);
  const userTotals = new Map<string, number>();

  for (const c of contributions) {
    userTotals.set(c.userName, (userTotals.get(c.userName) || 0) + c.points);
  }

  const sorted = Array.from(userTotals.entries())
    .map(([userName, totalPoints]) => ({ userName, totalPoints }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return sorted.map((entry, i) => ({
    ...entry,
    rank: i + 1,
    isCurrentUser: entry.userName === currentUserName,
  }));
}
