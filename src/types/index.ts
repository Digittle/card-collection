export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Card {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rarity: Rarity;
  series: string;
  themeId: string;
  cardNumber: number;
  totalInSeries: number;
  price: number;
  claimedAt?: string;
}

export interface CardTheme {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  accentColor: string;
}

export interface ClaimToken {
  token: string;
  cardId: string;
  used: boolean;
  expiresAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  hasCompletedOnboarding: boolean;
  coins: number;
  hasReceivedFreeCard: boolean;
}

export interface AppState {
  user: UserProfile | null;
  cards: Card[];
  isFirstVisit: boolean;
}

export const RARITY_PRICE: Record<Rarity, number> = {
  common: 100,
  rare: 300,
  epic: 600,
  legendary: 1200,
};

export const INITIAL_COINS = 1000000;

// Rights per rarity
export const RARITY_RIGHTS: Record<Rarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 5,
};

// A single right allocation record (immutable once created)
export interface RightAllocation {
  id: string; // format: `${cardId}_${rightIndex}_${programId}`
  cardId: string;
  rightIndex: number; // 0-based, up to RARITY_RIGHTS[rarity]-1
  programId: string;
  allocatedAt: string; // ISO string
}

// A requirement slot within a program
export interface ProgramRequirement {
  id: string;
  label: string;
  rightPointsNeeded: number;
  filter?: {
    themeIds?: string[];
    rarities?: Rarity[];
    cardIds?: string[];
  };
}

export type ProgramCategory = "collection" | "challenge" | "special";

// A Program that users participate in by consuming card rights
export interface Program {
  id: string;
  title: string;
  description: string;
  iconName: string; // lucide icon name
  accentColor: string;
  category: ProgramCategory;
  requirements: ProgramRequirement[];
  rewardCoins?: number;
  isActive: boolean;
  sortOrder: number;
}

// User's progress on a specific program
export interface UserProgramProgress {
  programId: string;
  allocations: Record<string, string[]>; // requirementId -> allocation IDs
  isCompleted: boolean;
  completedAt: string | null;
  startedAt: string;
  rewardsClaimed: boolean;
}


export const RARITY_CONFIG: Record<
  Rarity,
  {
    label: string;
    glowColor: string;
    particleCount: number;
    bgGradient: string;
    textColor: string;
    borderColor: string;
    vibrate: boolean;
  }
> = {
  common: {
    label: "Common",
    glowColor: "rgba(191, 191, 191, 0.6)",
    particleCount: 0,
    bgGradient: "from-slate-100 to-slate-200",
    textColor: "text-slate-600",
    borderColor: "border-slate-300",
    vibrate: false,
  },
  rare: {
    label: "Rare",
    glowColor: "rgba(100, 129, 192, 0.6)",
    particleCount: 0,
    bgGradient: "from-blue-100 to-blue-200",
    textColor: "text-blue-600",
    borderColor: "border-blue-400",
    vibrate: false,
  },
  epic: {
    label: "Epic",
    glowColor: "rgba(176, 139, 190, 0.7)",
    particleCount: 6,
    bgGradient: "from-purple-100 to-purple-200",
    textColor: "text-purple-600",
    borderColor: "border-purple-400",
    vibrate: false,
  },
  legendary: {
    label: "Legendary",
    glowColor: "rgba(246, 171, 0, 0.8)",
    particleCount: 10,
    bgGradient: "from-amber-100 to-amber-200",
    textColor: "text-amber-600",
    borderColor: "border-amber-400",
    vibrate: true,
  },
};
