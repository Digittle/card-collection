"use client";

import { Card, UserProfile, INITIAL_COINS, RightAllocation, UserProgramProgress } from "@/types";

const STORAGE_KEYS = {
  USER: "dcc_user",
  CARDS: "dcc_cards",
  ONBOARDING: "dcc_onboarding_done",
  CLAIM_HISTORY: "dcc_claim_history",
  COINS: "dcc_coins",
  FREE_CARD: "dcc_free_card_received",
  RIGHT_ALLOCATIONS: "dcc_right_allocations",
  PROGRAM_PROGRESS: "dcc_program_progress",
  COLLAB_PROGRESS: "dcc_collab_progress",
  COLLAB_CONTRIBUTIONS: "dcc_collab_contributions",
  COLLAB_FEED: "dcc_collab_feed",
  COLLAB_BADGES: "dcc_collab_badges",
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

// User
export function getUser(): UserProfile | null {
  return getItem<UserProfile | null>(STORAGE_KEYS.USER, null);
}

export function setUser(user: UserProfile): void {
  setItem(STORAGE_KEYS.USER, user);
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// Cards
export function getCards(): Card[] {
  return getItem<Card[]>(STORAGE_KEYS.CARDS, []);
}

export function addCard(card: Card): void {
  const cards = getCards();
  if (!cards.find((c) => c.id === card.id)) {
    cards.push({ ...card, claimedAt: new Date().toISOString() });
    setItem(STORAGE_KEYS.CARDS, cards);
  }
}

export function getCardById(id: string): Card | undefined {
  return getCards().find((c) => c.id === id);
}

export function ownsCard(cardId: string): boolean {
  return getCards().some((c) => c.id === cardId);
}

// Onboarding
export function hasCompletedOnboarding(): boolean {
  return getItem<boolean>(STORAGE_KEYS.ONBOARDING, false);
}

export function completeOnboarding(): void {
  setItem(STORAGE_KEYS.ONBOARDING, true);
}

// Coins
export function getCoins(): number {
  return getItem<number>(STORAGE_KEYS.COINS, INITIAL_COINS);
}

export function setCoins(coins: number): void {
  setItem(STORAGE_KEYS.COINS, coins);
}

export function deductCoins(amount: number): boolean {
  const current = getCoins();
  if (current < amount) return false;
  setCoins(current - amount);
  return true;
}

// Free card
export function hasReceivedFreeCard(): boolean {
  return getItem<boolean>(STORAGE_KEYS.FREE_CARD, false);
}

export function setFreeCardReceived(): void {
  setItem(STORAGE_KEYS.FREE_CARD, true);
}

// Claim history (prevent duplicate claims)
export function getClaimHistory(): string[] {
  return getItem<string[]>(STORAGE_KEYS.CLAIM_HISTORY, []);
}

export function addClaimHistory(token: string): void {
  const history = getClaimHistory();
  if (!history.includes(token)) {
    history.push(token);
    setItem(STORAGE_KEYS.CLAIM_HISTORY, history);
  }
}

export function hasClaimedToken(token: string): boolean {
  return getClaimHistory().includes(token);
}

// Theme helpers
export function getOwnedCardsByTheme(themeId: string): Card[] {
  return getCards().filter((c) => c.themeId === themeId);
}

// Right Allocations
export function getAllocations(): RightAllocation[] {
  return getItem<RightAllocation[]>(STORAGE_KEYS.RIGHT_ALLOCATIONS, []);
}

export function addAllocation(allocation: RightAllocation): void {
  const allocations = getAllocations();
  allocations.push(allocation);
  setItem(STORAGE_KEYS.RIGHT_ALLOCATIONS, allocations);
}

export function getCardAllocations(cardId: string): RightAllocation[] {
  return getAllocations().filter((a) => a.cardId === cardId);
}

// Program Progress
export function getProgramProgresses(): UserProgramProgress[] {
  return getItem<UserProgramProgress[]>(STORAGE_KEYS.PROGRAM_PROGRESS, []);
}

export function getProgramProgress(programId: string): UserProgramProgress | undefined {
  return getProgramProgresses().find((p) => p.programId === programId);
}

export function setProgramProgress(progress: UserProgramProgress): void {
  const progresses = getProgramProgresses();
  const index = progresses.findIndex((p) => p.programId === progress.programId);
  if (index >= 0) {
    progresses[index] = progress;
  } else {
    progresses.push(progress);
  }
  setItem(STORAGE_KEYS.PROGRAM_PROGRESS, progresses);
}

