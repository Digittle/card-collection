// ===== Rarity System based on "Sacred Distance" (聖別された距離) =====
// Higher rarity = closer distance = more precious
export type Rarity = "normal" | "rare" | "sr" | "ur" | "legend";

export interface RarityConfig {
  label: string;
  labelEn: string;
  stars: number;
  color: string;
  glowColor: string;
  probability: number;
  distanceLabel: string;
  shopPrice: number;
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  normal: {
    label: "ノーマル",
    labelEn: "N",
    stars: 1,
    color: "#94A3B8",
    glowColor: "#94A3B8",
    probability: 0.50,
    distanceLabel: "遠景",
    shopPrice: 100,
  },
  rare: {
    label: "レア",
    labelEn: "R",
    stars: 2,
    color: "#3B82F6",
    glowColor: "#60A5FA",
    probability: 0.30,
    distanceLabel: "パフォーマンス",
    shopPrice: 300,
  },
  sr: {
    label: "Sレア",
    labelEn: "SR",
    stars: 3,
    color: "#A855F7",
    glowColor: "#C084FC",
    probability: 0.15,
    distanceLabel: "ソロショット",
    shopPrice: 800,
  },
  ur: {
    label: "Uレア",
    labelEn: "UR",
    stars: 4,
    color: "#F59E0B",
    glowColor: "#FBBF24",
    probability: 0.04,
    distanceLabel: "ファンサ",
    shopPrice: 2000,
  },
  legend: {
    label: "レジェンド",
    labelEn: "LG",
    stars: 5,
    color: "#EF4444",
    glowColor: "#F87171",
    probability: 0.01,
    distanceLabel: "伝説の瞬間",
    shopPrice: 5000,
  },
};

export const RARITY_ORDER: Rarity[] = ["normal", "rare", "sr", "ur", "legend"];

export const INITIAL_COINS = 100000;
export const GACHA_COST_SINGLE = 300;
export const GACHA_COST_TEN = 2700;

// ===== Group & Member =====
export interface Group {
  id: string;
  name: string;
  nameEn: string;
  debutYear: number;
  description: string;
  accentColor: string;
}

export interface Member {
  id: string;
  groupId: string;
  name: string;
  nameEn: string;
  color: string;
  colorName: string;
  image?: string; // path to member image in /members/
}

// ===== Card =====
export interface Card {
  id: string;
  memberId: string;
  groupId: string;
  memberName: string;
  groupName: string;
  memberColor: string;
  memberImage?: string;
  title: string;
  description: string;
  series: string;
  rarity: Rarity;
  cardNumber: number;
  totalInSeries: number;
}

export interface OwnedCard extends Card {
  obtainedAt: string;
  isNew: boolean;
  memo?: string;
  attachedImages?: string[]; // base64 data URLs
}

// ===== User =====
export interface User {
  id: string;
  displayName: string;
  tanmouMemberId: string | null;
  tanmouGroupId: string | null;
  createdAt: string;
}

// ===== Community Simulation =====
export interface ActivityEvent {
  id: string;
  type: "gacha" | "tanmou" | "complete";
  userName: string;
  detail: string;
  timestamp: string;
}
