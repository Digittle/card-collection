"use client";

import { OwnedCard, Card, User, INITIAL_COINS } from "@/types";

const STORAGE_KEYS = {
  USER: "starto_user",
  CARDS: "starto_cards",
  COINS: "starto_coins",
  LAST_FREE_GACHA: "starto_last_free_gacha",
  ACTIVITY_LOG: "starto_activity_log",
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
export function getUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.USER, null);
}

export function setUser(user: User): void {
  setItem(STORAGE_KEYS.USER, user);
}

export function updateUser(updates: Partial<User>): void {
  const user = getUser();
  if (user) {
    setItem(STORAGE_KEYS.USER, { ...user, ...updates });
  }
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// Cards
export function getCards(): OwnedCard[] {
  return getItem<OwnedCard[]>(STORAGE_KEYS.CARDS, []);
}

export function addCard(card: Card): { isNew: boolean } {
  const cards = getCards();
  const existing = cards.find((c) => c.id === card.id);
  if (existing) {
    return { isNew: false };
  }
  const owned: OwnedCard = {
    ...card,
    obtainedAt: new Date().toISOString(),
    isNew: true,
  };
  cards.push(owned);
  setItem(STORAGE_KEYS.CARDS, cards);
  return { isNew: true };
}

export function addCards(newCards: Card[]): { newCount: number; dupeCount: number } {
  const cards = getCards();
  let newCount = 0;
  let dupeCount = 0;
  for (const card of newCards) {
    if (cards.find((c) => c.id === card.id)) {
      dupeCount++;
    } else {
      cards.push({
        ...card,
        obtainedAt: new Date().toISOString(),
        isNew: true,
      });
      newCount++;
    }
  }
  setItem(STORAGE_KEYS.CARDS, cards);
  return { newCount, dupeCount };
}

export function getCardById(id: string): OwnedCard | undefined {
  return getCards().find((c) => c.id === id);
}

export function ownsCard(cardId: string): boolean {
  return getCards().some((c) => c.id === cardId);
}

export function markCardSeen(cardId: string): void {
  const cards = getCards();
  const card = cards.find((c) => c.id === cardId);
  if (card) {
    card.isNew = false;
    setItem(STORAGE_KEYS.CARDS, cards);
  }
}

// Card memo & images
export function updateCardMemo(cardId: string, memo: string): void {
  const cards = getCards();
  const card = cards.find((c) => c.id === cardId);
  if (card) {
    card.memo = memo;
    setItem(STORAGE_KEYS.CARDS, cards);
  }
}

export function addCardImage(cardId: string, base64: string): void {
  const cards = getCards();
  const card = cards.find((c) => c.id === cardId);
  if (card) {
    if (!card.attachedImages) card.attachedImages = [];
    card.attachedImages.push(base64);
    setItem(STORAGE_KEYS.CARDS, cards);
  }
}

export function removeCardImage(cardId: string, index: number): void {
  const cards = getCards();
  const card = cards.find((c) => c.id === cardId);
  if (card && card.attachedImages) {
    card.attachedImages.splice(index, 1);
    setItem(STORAGE_KEYS.CARDS, cards);
  }
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

export function addCoins(amount: number): void {
  setCoins(getCoins() + amount);
}

// Free gacha
export function canDoFreeGacha(): boolean {
  const last = getItem<string | null>(STORAGE_KEYS.LAST_FREE_GACHA, null);
  if (!last) return true;
  const today = new Date().toDateString();
  return new Date(last).toDateString() !== today;
}

export function markFreeGachaUsed(): void {
  setItem(STORAGE_KEYS.LAST_FREE_GACHA, new Date().toISOString());
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

// Collection stats
export function getCollectionStats() {
  const cards = getCards();
  const groups = new Set(cards.map((c) => c.groupId));
  const members = new Set(cards.map((c) => c.memberId));
  return {
    totalCards: cards.length,
    totalGroups: groups.size,
    totalMembers: members.size,
    newCards: cards.filter((c) => c.isNew).length,
  };
}
