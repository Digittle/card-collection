import { ActivityEvent } from "@/types";
import { GROUPS } from "@/lib/groups-data";

// ===== Seeded random (same pattern as ActivityFeed) =====
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ===== Group activity data =====
export interface GroupActivityData {
  groupId: string;
  totalScore: number;
  gachaDraws: number;
  cardPurchases: number;
  collectionRate: number;
  communityPosts: number;
  activeCollectors: number;
  trendDirection: "up" | "down" | "stable";
  hourlyActivity: number[]; // 24 values
}

// Base popularity weights (Snow Man > SixTONES > Naniwa > Travis Japan)
const GROUP_POPULARITY: Record<string, number> = {
  snowman: 1.0,
  sixtones: 0.82,
  naniwa: 0.7,
  travisjapan: 0.6,
};

// Time-of-day multiplier for JST hours
function hourMultiplier(hour: number): number {
  // Peak: 12-14 lunch, 19-23 evening
  if (hour >= 12 && hour <= 13) return 1.4;
  if (hour >= 19 && hour <= 22) return 1.6;
  if (hour === 23) return 1.2;
  if (hour >= 7 && hour <= 11) return 0.9;
  if (hour >= 14 && hour <= 18) return 1.0;
  // Late night / early morning
  return 0.3;
}

function getJSTHour(): number {
  const now = new Date();
  const utcHour = now.getUTCHours();
  return (utcHour + 9) % 24;
}

export function getGroupActivities(
  period: "today" | "week" | "all"
): GroupActivityData[] {
  const now = Date.now();
  const dayStart = Math.floor(now / (1000 * 60 * 60 * 24));
  const hourSeed = Math.floor(now / (1000 * 60 * 60));

  // Period multiplier for scale
  const periodMultiplier = period === "today" ? 1 : period === "week" ? 7 : 30;

  const currentJSTHour = getJSTHour();

  const results: GroupActivityData[] = GROUPS.map((group) => {
    const pop = GROUP_POPULARITY[group.id] ?? 0.5;
    const baseSeed = dayStart * 31 + group.id.length * 7;
    const rand = seededRandom(baseSeed + hourSeed);

    // Base values scaled by popularity and period
    const baseGacha = Math.round(
      (150 + rand() * 100) * pop * periodMultiplier
    );
    const basePurchases = Math.round(
      (80 + rand() * 60) * pop * periodMultiplier
    );
    const baseCollection = Math.round(40 + rand() * 35 + pop * 15);
    const basePosts = Math.round(
      (30 + rand() * 40) * pop * periodMultiplier
    );
    const baseCollectors = Math.round((50 + rand() * 30) * pop);

    // Apply current hour multiplier to inject time-of-day feel
    const timeFactor = hourMultiplier(currentJSTHour);
    const gachaDraws = Math.round(baseGacha * timeFactor);
    const cardPurchases = Math.round(basePurchases * timeFactor);
    const collectionRate = Math.min(
      99,
      Math.round(baseCollection + rand() * 5)
    );
    const communityPosts = Math.round(basePosts * timeFactor);
    const activeCollectors = Math.round(baseCollectors * timeFactor);

    const totalScore =
      gachaDraws * 3 + cardPurchases * 2 + communityPosts * 4 + collectionRate * 10;

    // Trend direction based on random with slight bias toward "up" for top groups
    const trendVal = rand();
    const trendDirection: "up" | "down" | "stable" =
      trendVal < 0.35 + pop * 0.1
        ? "up"
        : trendVal < 0.7
          ? "stable"
          : "down";

    // Hourly activity: 24 values simulating activity per hour
    const hourlyActivity: number[] = [];
    const hourlyRand = seededRandom(dayStart * 17 + group.id.length * 3);
    for (let h = 0; h < 24; h++) {
      const hMult = hourMultiplier(h);
      const noise = 0.7 + hourlyRand() * 0.6;
      hourlyActivity.push(
        Math.round(pop * hMult * noise * 100)
      );
    }

    return {
      groupId: group.id,
      totalScore,
      gachaDraws,
      cardPurchases,
      collectionRate,
      communityPosts,
      activeCollectors,
      trendDirection,
      hourlyActivity,
    };
  });

  // Sort by totalScore descending
  results.sort((a, b) => b.totalScore - a.totalScore);
  return results;
}

// ===== Recent events generator =====
const FAKE_NAMES = [
  "あかり", "ゆうき", "さくら", "はると", "みさき",
  "れん", "ひなた", "こころ", "そうた", "あおい",
  "まりん", "りく",
];

const EVENT_TEMPLATES: {
  type: ActivityEvent["type"];
  template: (name: string, groupName: string) => string;
}[] = [
  { type: "gacha", template: (n, g) => `${n}さんが${g}のガチャを引きました` },
  { type: "gacha", template: (n, g) => `${n}さんが${g}の10連ガチャに挑戦！` },
  { type: "tanmou", template: (n, g) => `${n}さんが${g}のカードを購入しました` },
  { type: "complete", template: (n, g) => `${n}さんが${g}のシリーズをコンプリート！` },
  { type: "gacha", template: (n, g) => `${n}さんが${g}のレジェンドカードをGET！` },
  { type: "tanmou", template: (n, g) => `${n}さんが${g}推しに変更しました` },
];

export function generateRecentEvents(): ActivityEvent[] {
  const hourSeed = Math.floor(Date.now() / (1000 * 60 * 60));
  const rand = seededRandom(hourSeed * 13 + 42);
  const events: ActivityEvent[] = [];

  for (let i = 0; i < 8; i++) {
    const name = FAKE_NAMES[Math.floor(rand() * FAKE_NAMES.length)];
    const group = GROUPS[Math.floor(rand() * GROUPS.length)];
    const tmpl = EVENT_TEMPLATES[Math.floor(rand() * EVENT_TEMPLATES.length)];

    // Generate a timestamp within the last few hours
    const minutesAgo = Math.floor(rand() * 180);
    const ts = new Date(Date.now() - minutesAgo * 60 * 1000);

    events.push({
      id: `evt-${i}`,
      type: tmpl.type,
      userName: name,
      detail: tmpl.template(name, group.name),
      timestamp: ts.toISOString(),
    });
  }

  return events;
}
