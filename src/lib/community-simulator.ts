import { DEMO_CARDS, CARD_THEMES } from "@/lib/cards-data";
import { Card, Rarity, CommunityState, SimulatedUser, ActivityEvent } from "@/types";

// ---------------------------------------------------------------------------
// Seeded PRNG (Mulberry32)
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Name pool (40 Japanese names)
// ---------------------------------------------------------------------------
const NAME_POOL: string[] = [
  "ユウキ", "ハルカ", "リョウ", "サクラ", "カイト",
  "ミサキ", "ソウタ", "アカリ", "レン", "ヒナタ",
  "タクミ", "ココロ", "ハヤト", "メイ", "ユウト",
  "アオイ", "ケンタ", "ノア", "ショウ", "ミユ",
  "コウキ", "ヒカリ", "ダイチ", "ナナ", "リク",
  "マオ", "ソラ", "ユイ", "シュン", "カナデ",
  "アキラ", "ミホ", "ツバサ", "サキ", "ルイ",
  "エマ", "カズキ", "リナ", "トモヤ", "アヤネ",
];

// ---------------------------------------------------------------------------
// Avatar colors (10 pastels)
// ---------------------------------------------------------------------------
const AVATAR_COLORS: string[] = [
  "#F9A8D4", "#A7F3D0", "#93C5FD", "#FDE68A", "#C4B5FD",
  "#FBCFE8", "#6EE7B7", "#7DD3FC", "#FCD34D", "#DDD6FE",
];

// ---------------------------------------------------------------------------
// localStorage helpers (mirror store.ts pattern)
// ---------------------------------------------------------------------------
const STORAGE_KEY_COMMUNITY = "dcc_community_state";
const STORAGE_KEY_ACTIVITY = "dcc_activity_log";

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

// ---------------------------------------------------------------------------
// Time-of-day multiplier (JST)
// ---------------------------------------------------------------------------
function getTimeMultiplier(): number {
  const now = new Date();
  const jstHour = (now.getUTCHours() + 9) % 24;
  // Peak hours: 12-14, 19-23
  if ((jstHour >= 12 && jstHour <= 14) || (jstHour >= 19 && jstHour <= 23)) {
    return 1.5;
  }
  return 1.0;
}

// ---------------------------------------------------------------------------
// Rarity viewer base ranges
// ---------------------------------------------------------------------------
const RARITY_VIEWER_BASE: Record<Rarity, [number, number]> = {
  common: [8, 18],
  rare: [12, 25],
  epic: [18, 35],
  legendary: [25, 50],
};

// ---------------------------------------------------------------------------
// Day seed: deterministic per calendar day
// ---------------------------------------------------------------------------
function getDaySeed(): number {
  const now = new Date();
  const dayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dayStr.length; i++) {
    hash = (hash << 5) - hash + dayStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ---------------------------------------------------------------------------
// Default community state
// ---------------------------------------------------------------------------
function createDefaultState(): CommunityState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    lastUpdated: new Date().toISOString(),
    todayDate: today,
    todayClaimCount: 0,
    trendingCardIndex: 0,
    seedOffset: 0,
    recentClaimers: [],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getOrCreateCommunityState(): CommunityState {
  const stored = getItem<CommunityState | null>(STORAGE_KEY_COMMUNITY, null);
  const today = new Date().toISOString().slice(0, 10);

  if (stored && stored.todayDate === today) {
    return stored;
  }

  // New day or no state: reset
  const seed = getDaySeed();
  const rng = mulberry32(seed);
  const state: CommunityState = {
    lastUpdated: new Date().toISOString(),
    todayDate: today,
    todayClaimCount: Math.floor(rng() * 40) + 20,
    trendingCardIndex: Math.floor(rng() * DEMO_CARDS.length),
    seedOffset: Math.floor(rng() * 10000),
    recentClaimers: generateInitialClaimers(rng),
  };
  setItem(STORAGE_KEY_COMMUNITY, state);
  return state;
}

function generateInitialClaimers(rng: () => number): SimulatedUser[] {
  const count = Math.floor(rng() * 4) + 3; // 3-6 initial claimers
  const claimers: SimulatedUser[] = [];
  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(rng() * NAME_POOL.length);
    const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
    const cardIdx = Math.floor(rng() * DEMO_CARDS.length);
    const name = NAME_POOL[nameIdx];
    claimers.push({
      name,
      initial: name.charAt(0),
      color: AVATAR_COLORS[colorIdx],
      claimedCardId: DEMO_CARDS[cardIdx].id,
      claimedAt: new Date(Date.now() - Math.floor(rng() * 3600000)).toISOString(),
    });
  }
  return claimers;
}

export function getViewerCount(card: Card): number {
  const state = getOrCreateCommunityState();
  const [min, max] = RARITY_VIEWER_BASE[card.rarity];
  const seed = getDaySeed() + state.seedOffset + card.id.charCodeAt(card.id.length - 1);
  const rng = mulberry32(seed);
  const base = Math.floor(rng() * (max - min + 1)) + min;
  const multiplier = getTimeMultiplier();
  return Math.floor(base * multiplier);
}

export function generateActivityEvent(seed: number): ActivityEvent {
  const rng = mulberry32(seed);
  const types: ActivityEvent["type"][] = ["claim", "view", "collect_complete"];
  const typeWeights = [0.5, 0.35, 0.15];
  const roll = rng();
  let type: ActivityEvent["type"] = "claim";
  let cumulative = 0;
  for (let i = 0; i < types.length; i++) {
    cumulative += typeWeights[i];
    if (roll < cumulative) {
      type = types[i];
      break;
    }
  }

  const nameIdx = Math.floor(rng() * NAME_POOL.length);
  const cardIdx = Math.floor(rng() * DEMO_CARDS.length);
  const card = DEMO_CARDS[cardIdx];

  return {
    id: `evt-${seed}-${Date.now()}`,
    type,
    userName: NAME_POOL[nameIdx],
    cardId: card.id,
    cardTitle: card.title,
    timestamp: new Date().toISOString(),
  };
}

export function getTodayClaimCount(): number {
  const state = getOrCreateCommunityState();
  // Add time-based growth throughout the day
  const now = new Date();
  const hoursPassed = now.getHours() + now.getMinutes() / 60;
  const growth = Math.floor(hoursPassed * 2.5 * getTimeMultiplier());
  return state.todayClaimCount + growth;
}

export function getActiveUserCount(): number {
  const base = 80;
  const seed = getDaySeed() + Math.floor(Date.now() / 60000); // changes every minute
  const rng = mulberry32(seed);
  const variance = Math.floor(rng() * 40) - 20;
  return Math.floor((base + variance) * getTimeMultiplier());
}

export function getTrendingCards(): Card[] {
  const state = getOrCreateCommunityState();
  const startIdx = state.trendingCardIndex;
  const trending: Card[] = [];
  for (let i = 0; i < Math.min(4, DEMO_CARDS.length); i++) {
    trending.push(DEMO_CARDS[(startIdx + i) % DEMO_CARDS.length]);
  }
  return trending;
}

export function tickSimulation(): CommunityState {
  const state = getOrCreateCommunityState();
  const seed = getDaySeed() + state.seedOffset + Date.now();
  const rng = mulberry32(seed);

  // Possibly add a new claimer
  if (rng() < 0.3 * getTimeMultiplier()) {
    const nameIdx = Math.floor(rng() * NAME_POOL.length);
    const colorIdx = Math.floor(rng() * AVATAR_COLORS.length);
    const cardIdx = Math.floor(rng() * DEMO_CARDS.length);
    const name = NAME_POOL[nameIdx];
    const newClaimer: SimulatedUser = {
      name,
      initial: name.charAt(0),
      color: AVATAR_COLORS[colorIdx],
      claimedCardId: DEMO_CARDS[cardIdx].id,
      claimedAt: new Date().toISOString(),
    };
    state.recentClaimers = [newClaimer, ...state.recentClaimers].slice(0, 10);
    state.todayClaimCount += 1;
  }

  state.lastUpdated = new Date().toISOString();
  setItem(STORAGE_KEY_COMMUNITY, state);

  // Also log activity event
  const event = generateActivityEvent(seed + 1);
  const activityLog = getItem<ActivityEvent[]>(STORAGE_KEY_ACTIVITY, []);
  activityLog.unshift(event);
  setItem(STORAGE_KEY_ACTIVITY, activityLog.slice(0, 50));

  return state;
}

export function getActivityLog(): ActivityEvent[] {
  return getItem<ActivityEvent[]>(STORAGE_KEY_ACTIVITY, []);
}

export { NAME_POOL, AVATAR_COLORS };
