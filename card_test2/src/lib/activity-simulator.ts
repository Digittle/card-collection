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

// ===== Territory Battle Data =====
export interface TerritoryData {
  groupId: string;
  percentage: number; // 0-100, sum of all groups = 100
  score: number;
  rank: number;
}

export interface TerritoryShift {
  id: string;
  attackerGroupId: string;
  defenderGroupId: string;
  message: string;
  timestamp: string;
}

const GROUP_SHORT_NAMES: Record<string, string> = {
  snowman: "Snow Man",
  sixtones: "SixTONES",
  naniwa: "なにわ",
  travisjapan: "Travis",
};

function getGroupDisplayName(groupId: string): string {
  return GROUPS.find((g) => g.id === groupId)?.name ?? groupId;
}

export function calculateTerritoryPercentages(
  activities: GroupActivityData[]
): TerritoryData[] {
  const totalScore = activities.reduce((sum, a) => sum + a.totalScore, 0);
  if (totalScore === 0) {
    return activities.map((a, i) => ({
      groupId: a.groupId,
      percentage: 25,
      score: 0,
      rank: i + 1,
    }));
  }

  // Calculate raw percentages
  const raw = activities.map((a) => ({
    groupId: a.groupId,
    rawPct: (a.totalScore / totalScore) * 100,
    score: a.totalScore,
  }));

  // Sort by score descending for ranking
  raw.sort((a, b) => b.score - a.score);

  // Round percentages ensuring they sum to 100
  let rounded = raw.map((r) => Math.round(r.rawPct));
  let diff = 100 - rounded.reduce((s, v) => s + v, 0);
  // Distribute remainder to largest groups first
  for (let i = 0; diff !== 0; i = (i + 1) % rounded.length) {
    if (diff > 0) { rounded[i]++; diff--; }
    else { rounded[i]--; diff++; }
  }

  // Ensure minimum 5% for each group so they're visible
  const minPct = 5;
  for (let i = 0; i < rounded.length; i++) {
    if (rounded[i] < minPct) {
      const deficit = minPct - rounded[i];
      rounded[i] = minPct;
      // Take from the largest
      const maxIdx = rounded.indexOf(Math.max(...rounded));
      rounded[maxIdx] -= deficit;
    }
  }

  return raw.map((r, i) => ({
    groupId: r.groupId,
    percentage: rounded[i],
    score: r.score,
    rank: i + 1,
  }));
}

// Corner positions for each group on a 10x10 grid
// snowman: top-left, sixtones: top-right, naniwa: bottom-left, travisjapan: bottom-right
const CORNER_POSITIONS: Record<string, [number, number]> = {
  snowman: [0, 0],
  sixtones: [0, 9],
  naniwa: [9, 0],
  travisjapan: [9, 9],
};

export function generateTerritoryGrid(
  territories: TerritoryData[],
  seed: number
): string[] {
  const SIZE = 10;
  const TOTAL = SIZE * SIZE;
  const grid: string[] = new Array(TOTAL).fill("");
  const rand = seededRandom(seed);

  // Calculate cell counts for each group
  const cellCounts: Record<string, number> = {};
  let assigned = 0;
  const sorted = [...territories].sort((a, b) => b.percentage - a.percentage);
  for (let i = 0; i < sorted.length; i++) {
    if (i === sorted.length - 1) {
      cellCounts[sorted[i].groupId] = TOTAL - assigned;
    } else {
      const count = Math.round((sorted[i].percentage / 100) * TOTAL);
      cellCounts[sorted[i].groupId] = count;
      assigned += count;
    }
  }

  // BFS flood-fill from corners
  const toIndex = (r: number, c: number) => r * SIZE + c;
  const visited = new Set<number>();

  // Initialize queues for each group starting from their corner
  const queues: Record<string, number[]> = {};
  const placed: Record<string, number> = {};

  // Determine group order: use the 4 known groups, fallback for unknowns
  const groupIds = ["snowman", "sixtones", "naniwa", "travisjapan"];
  for (const gid of groupIds) {
    const corner = CORNER_POSITIONS[gid];
    if (!corner) continue;
    const idx = toIndex(corner[0], corner[1]);
    queues[gid] = [idx];
    placed[gid] = 0;
  }

  // Round-robin BFS: each group expands one cell at a time
  let allDone = false;
  while (!allDone) {
    allDone = true;
    for (const gid of groupIds) {
      const target = cellCounts[gid] ?? 0;
      if (placed[gid] >= target) continue;
      if (queues[gid].length === 0) continue;

      allDone = false;
      // Try to place one cell for this group
      let didPlace = false;
      while (queues[gid].length > 0 && !didPlace) {
        const idx = queues[gid].shift()!;
        if (visited.has(idx)) continue;

        visited.add(idx);
        grid[idx] = gid;
        placed[gid]++;
        didPlace = true;

        // Add neighbors in shuffled order for organic feel
        const r = Math.floor(idx / SIZE);
        const c = idx % SIZE;
        const neighbors: number[] = [];
        if (r > 0) neighbors.push(toIndex(r - 1, c));
        if (r < SIZE - 1) neighbors.push(toIndex(r + 1, c));
        if (c > 0) neighbors.push(toIndex(r, c - 1));
        if (c < SIZE - 1) neighbors.push(toIndex(r, c + 1));

        // Shuffle neighbors with seeded random for organic borders
        for (let i = neighbors.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
        }

        for (const n of neighbors) {
          if (!visited.has(n)) {
            queues[gid].push(n);
          }
        }
      }
    }
  }

  // Fill any remaining empty cells with the nearest group
  for (let i = 0; i < TOTAL; i++) {
    if (grid[i] === "") {
      // Find nearest filled cell
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
      let minDist = Infinity;
      let nearest = groupIds[0];
      for (let j = 0; j < TOTAL; j++) {
        if (grid[j] === "") continue;
        const jr = Math.floor(j / SIZE);
        const jc = j % SIZE;
        const dist = Math.abs(r - jr) + Math.abs(c - jc);
        if (dist < minDist) {
          minDist = dist;
          nearest = grid[j];
        }
      }
      grid[i] = nearest;
    }
  }

  return grid;
}

// Check if a cell at index is adjacent to a cell owned by a different group
export function isAdjacentToDifferentGroup(
  index: number,
  grid: string[]
): boolean {
  const SIZE = 10;
  const r = Math.floor(index / SIZE);
  const c = index % SIZE;
  const owner = grid[index];

  const neighbors: [number, number][] = [
    [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
  ];

  for (const [nr, nc] of neighbors) {
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
      if (grid[nr * SIZE + nc] !== owner) return true;
    }
  }
  return false;
}

const BATTLE_TEMPLATES = [
  (atk: string, def: string) => `${atk}が${def}の陣地を奪った！`,
  (atk: string, _def: string) => `${atk}が勢力を拡大中！`,
  (atk: string, def: string) => `${atk}が${def}に猛攻撃！`,
  (atk: string, _def: string) => `${atk}ファンの活動が急上昇！`,
  (_atk: string, def: string) => `${def}の陣地が縮小中...`,
];

export function generateTerritoryShifts(seed: number): TerritoryShift[] {
  const rand = seededRandom(seed);
  const shifts: TerritoryShift[] = [];
  const count = 3 + Math.floor(rand() * 3); // 3-5 events

  for (let i = 0; i < count; i++) {
    const attackerIdx = Math.floor(rand() * GROUPS.length);
    let defenderIdx = Math.floor(rand() * (GROUPS.length - 1));
    if (defenderIdx >= attackerIdx) defenderIdx++;

    const attacker = GROUPS[attackerIdx];
    const defender = GROUPS[defenderIdx];
    const tmpl = BATTLE_TEMPLATES[Math.floor(rand() * BATTLE_TEMPLATES.length)];
    const minutesAgo = Math.floor(rand() * 60);

    shifts.push({
      id: `shift-${seed}-${i}`,
      attackerGroupId: attacker.id,
      defenderGroupId: defender.id,
      message: tmpl(attacker.name, defender.name),
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
    });
  }

  // Sort by most recent first
  shifts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return shifts;
}

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
