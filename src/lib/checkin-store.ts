"use client";

import { Card } from "@/types";

const STORAGE_KEYS = {
  CHECKIN_COUNT: "starto_checkin_count",
  CHECKIN_HISTORY: "starto_checkin_history",
  CHECKIN_LAST_DATE: "starto_checkin_last_date",
  CHECKIN_CARDS: "starto_checkin_cards",
} as const;

export interface CheckinEntry {
  id: string;
  date: string;
  timestamp: number;
  note?: string;
}

export interface CheckinCard extends Card {
  milestone: number;
  unlocked: boolean;
  unlockedAt?: string;
}

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

// Check-in count
export function getCheckinCount(): number {
  return getItem<number>(STORAGE_KEYS.CHECKIN_COUNT, 0);
}

export function setCheckinCount(count: number): void {
  setItem(STORAGE_KEYS.CHECKIN_COUNT, count);
}

// Check-in history
export function getCheckinHistory(): CheckinEntry[] {
  return getItem<CheckinEntry[]>(STORAGE_KEYS.CHECKIN_HISTORY, []);
}

export function addCheckinEntry(note?: string): CheckinEntry {
  const history = getCheckinHistory();
  const now = new Date();
  const entry: CheckinEntry = {
    id: `checkin_${now.getTime()}`,
    date: now.toISOString().split('T')[0],
    timestamp: now.getTime(),
    note,
  };
  
  history.unshift(entry); // Add to beginning
  setItem(STORAGE_KEYS.CHECKIN_HISTORY, history);
  
  // Increment count
  const currentCount = getCheckinCount();
  setCheckinCount(currentCount + 1);
  
  return entry;
}

// Can check in today?
export function canCheckinToday(): boolean {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = getItem<string | null>(STORAGE_KEYS.CHECKIN_LAST_DATE, null);
  return lastDate !== today;
}

export function markCheckinToday(): void {
  const today = new Date().toISOString().split('T')[0];
  setItem(STORAGE_KEYS.CHECKIN_LAST_DATE, today);
}

// Check-in reward cards
export function getCheckinCards(): CheckinCard[] {
  return getItem<CheckinCard[]>(STORAGE_KEYS.CHECKIN_CARDS, []);
}

export function setCheckinCards(cards: CheckinCard[]): void {
  setItem(STORAGE_KEYS.CHECKIN_CARDS, cards);
}

export function unlockCheckinCard(cardId: string): void {
  const cards = getCheckinCards();
  const card = cards.find(c => c.id === cardId);
  if (card && !card.unlocked) {
    card.unlocked = true;
    card.unlockedAt = new Date().toISOString();
    setCheckinCards(cards);
  }
}

// Check what milestone cards should be unlocked
export function checkMilestoneRewards(): CheckinCard[] {
  const count = getCheckinCount();
  const cards = getCheckinCards();
  const newUnlocks: CheckinCard[] = [];
  
  cards.forEach(card => {
    if (!card.unlocked && count >= card.milestone) {
      card.unlocked = true;
      card.unlockedAt = new Date().toISOString();
      newUnlocks.push(card);
    }
  });
  
  if (newUnlocks.length > 0) {
    setCheckinCards(cards);
  }
  
  return newUnlocks;
}

// Initialize milestone cards
export function initializeCheckinCards(milestoneCards: CheckinCard[]): void {
  const existing = getCheckinCards();
  if (existing.length === 0) {
    setCheckinCards(milestoneCards);
  }
}

export function getTodaysCheckinEntries(): CheckinEntry[] {
  const today = new Date().toISOString().split('T')[0];
  return getCheckinHistory().filter(entry => entry.date === today);
}

export function getCheckinStats() {
  const history = getCheckinHistory();
  const count = getCheckinCount();
  const today = new Date().toISOString().split('T')[0];
  const todaysCount = history.filter(entry => entry.date === today).length;
  
  // Calculate streak
  let streak = 0;
  const dates = [...new Set(history.map(entry => entry.date))].sort().reverse();
  
  for (let i = 0; i < dates.length; i++) {
    const date = new Date(dates[i]);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streak++;
    } else {
      break;
    }
  }
  
  return {
    totalCount: count,
    todaysCount,
    streak,
    canCheckinToday: canCheckinToday(),
  };
}