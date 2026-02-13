"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Swords,
} from "lucide-react";
import { getUser, getCoins } from "@/lib/store";
import { GROUPS } from "@/lib/groups-data";
import {
  getGroupActivities,
  GroupActivityData,
  calculateTerritoryPercentages,
  generateTerritoryGrid,
  generateTerritoryShifts,
  isAdjacentToDifferentGroup,
  TerritoryData,
  TerritoryShift,
} from "@/lib/activity-simulator";

type Period = "today" | "week" | "all";

const PERIOD_LABELS: { key: Period; label: string }[] = [
  { key: "today", label: "今日" },
  { key: "week", label: "今週" },
  { key: "all", label: "全期間" },
];

const CATEGORY_KEYS: {
  key: keyof GroupActivityData;
  label: string;
}[] = [
  { key: "gachaDraws", label: "ガチャ回数" },
  { key: "cardPurchases", label: "カード購入" },
  { key: "collectionRate", label: "コレクション達成率" },
  { key: "communityPosts", label: "コミュニティ投稿" },
];

function getGroupColor(groupId: string): string {
  return GROUPS.find((g) => g.id === groupId)?.accentColor ?? "#60A5FA";
}

const SHORT_NAMES: Record<string, string> = {
  snowman: "Snow Man",
  sixtones: "SixTONES",
  naniwa: "なにわ",
  travisjapan: "Travis",
};

function getGroupShortName(groupId: string): string {
  return SHORT_NAMES[groupId] ?? groupId;
}

export default function ActivityPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(0);
  const [period, setPeriod] = useState<Period>("today");
  const [activities, setActivities] = useState<GroupActivityData[]>([]);
  const [territories, setTerritories] = useState<TerritoryData[]>([]);
  const [gridCells, setGridCells] = useState<string[]>([]);
  const [battleLog, setBattleLog] = useState<TerritoryShift[]>([]);
  const [tick, setTick] = useState(0);
  const prevGridRef = useRef<string[]>([]);
  const [changedCells, setChangedCells] = useState<Set<number>>(new Set());

  // Auth check
  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setCoins(getCoins());
  }, [router]);

  // Load data
  const loadData = useCallback(() => {
    const acts = getGroupActivities(period);
    setActivities(acts);
    setCoins(getCoins());

    const terr = calculateTerritoryPercentages(acts);
    setTerritories(terr);

    // Use a seed based on period + tick for deterministic but evolving grid
    const seed = period.length * 1000 + tick * 7 + 42;
    const newGrid = generateTerritoryGrid(terr, seed);

    // Detect changed cells
    if (prevGridRef.current.length === 100) {
      const changed = new Set<number>();
      for (let i = 0; i < 100; i++) {
        if (prevGridRef.current[i] !== newGrid[i]) {
          changed.add(i);
        }
      }
      setChangedCells(changed);
      // Clear changed cells after animation
      if (changed.size > 0) {
        setTimeout(() => setChangedCells(new Set()), 600);
      }
    }
    prevGridRef.current = newGrid;
    setGridCells(newGrid);

    const shiftSeed = Math.floor(Date.now() / (1000 * 60 * 5)) + tick;
    setBattleLog(generateTerritoryShifts(shiftSeed));
  }, [period, tick]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic live update every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Category max values
  const categoryMaxes = useMemo(() => {
    const maxes: Record<string, number> = {};
    for (const cat of CATEGORY_KEYS) {
      maxes[cat.key] = Math.max(
        ...activities.map((a) => a[cat.key] as number),
        1
      );
    }
    return maxes;
  }, [activities]);

  // Sort territories by percentage descending for the bar
  const sortedTerritories = useMemo(
    () => [...territories].sort((a, b) => b.percentage - a.percentage),
    [territories]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-[#0F172A]/80">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">陣取りバトル</h1>
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
          <span className="text-xs text-yellow-400">&#x1FA99;</span>
          <span className="text-sm font-bold text-white">
            {coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-xs text-green-400">リアルタイム更新中</span>
      </div>

      {/* Period selector */}
      <div className="flex justify-center gap-2 px-4 pb-4">
        {PERIOD_LABELS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
              period === p.key
                ? "bg-white text-gray-900 shadow-lg"
                : "bg-white/10 text-white/60 hover:bg-white/15"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Territory Bar (Splatoon-style) */}
      <section className="px-4 pb-4">
        <div className="flex h-16 w-full overflow-hidden rounded-2xl border border-white/20">
          {sortedTerritories.map((t, idx) => {
            const color = getGroupColor(t.groupId);
            const isFirst = t.rank === 1;
            return (
              <motion.div
                key={t.groupId}
                className="relative flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: color }}
                animate={{ flex: t.percentage }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                {/* Crown for #1 */}
                {isFirst && (
                  <Crown className="absolute top-1 left-1.5 h-3.5 w-3.5 text-white/80" />
                )}
                {/* Label shown when segment is wide enough */}
                {t.percentage >= 15 && (
                  <span className="text-xs font-bold text-white drop-shadow-lg whitespace-nowrap">
                    {getGroupShortName(t.groupId)} {t.percentage}%
                  </span>
                )}
                {t.percentage >= 10 && t.percentage < 15 && (
                  <span className="text-[10px] font-bold text-white drop-shadow-lg whitespace-nowrap">
                    {t.percentage}%
                  </span>
                )}
                {/* Glowing battle line on right edge */}
                {idx < sortedTerritories.length - 1 && (
                  <motion.div
                    className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/60"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Group Legend / Scores */}
      <section className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {sortedTerritories.map((t) => {
            const color = getGroupColor(t.groupId);
            const activity = activities.find((a) => a.groupId === t.groupId);
            const isFirst = t.rank === 1;
            const TrendIcon =
              activity?.trendDirection === "up"
                ? TrendingUp
                : activity?.trendDirection === "down"
                  ? TrendingDown
                  : Minus;

            return (
              <div
                key={t.groupId}
                className={`rounded-xl border p-3 ${
                  isFirst
                    ? "border-yellow-500/30 bg-white/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-bold text-white truncate">
                    {getGroupShortName(t.groupId)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span
                      className="text-lg font-bold"
                      style={{ color }}
                    >
                      {t.percentage}%
                    </span>
                    <span className="text-[10px] text-white/40 font-medium">
                      #{t.rank}
                    </span>
                  </div>
                  <TrendIcon
                    className="h-4 w-4"
                    style={{
                      color:
                        activity?.trendDirection === "up"
                          ? "#22C55E"
                          : activity?.trendDirection === "down"
                            ? "#EF4444"
                            : "#94A3B8",
                    }}
                  />
                </div>
                {isFirst && (
                  <span className="mt-1 inline-block rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                    今一番アツい！
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Territory Grid Map */}
      <section className="px-4 pb-4">
        <h2 className="mb-3 text-sm font-bold text-white/80">陣地マップ</h2>
        <div className="grid grid-cols-10 gap-[2px] p-2 rounded-2xl bg-white/5 border border-white/10">
          {gridCells.map((groupId, i) => {
            const color = getGroupColor(groupId);
            const isBorder = isAdjacentToDifferentGroup(i, gridCells);
            const wasChanged = changedCells.has(i);

            return (
              <motion.div
                key={i}
                className="aspect-square rounded-[4px]"
                animate={
                  wasChanged
                    ? {
                        scaleY: [1, 0, 1],
                        backgroundColor: color,
                      }
                    : {
                        backgroundColor: color,
                        scaleY: 1,
                      }
                }
                transition={
                  wasChanged
                    ? { duration: 0.4, ease: "easeInOut" }
                    : { duration: 0.5 }
                }
                style={{
                  opacity: isBorder ? 1 : 0.7,
                  boxShadow: isBorder ? `0 0 4px ${color}` : "none",
                }}
              />
            );
          })}
        </div>
        {/* Grid legend */}
        <div className="mt-2 flex justify-center gap-4">
          {GROUPS.map((g) => (
            <div key={g.id} className="flex items-center gap-1">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: g.accentColor }}
              />
              <span className="text-[10px] text-white/50">
                {SHORT_NAMES[g.id] ?? g.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Battle Log */}
      <section className="px-4 pb-4">
        <h2 className="mb-3 text-sm font-bold text-white/80">バトルログ</h2>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {battleLog.map((shift, i) => {
              const color = getGroupColor(shift.attackerGroupId);
              const minutesAgo = Math.round(
                (Date.now() - new Date(shift.timestamp).getTime()) / 60000
              );
              const timeLabel =
                minutesAgo < 1
                  ? "たった今"
                  : minutesAgo < 60
                    ? `${minutesAgo}分前`
                    : `${Math.floor(minutesAgo / 60)}時間前`;

              return (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                >
                  <Swords
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color }}
                  />
                  <div className="flex-1">
                    <p className="text-[12px] leading-relaxed text-white/70">
                      {shift.message}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/30">
                      {timeLabel}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="px-4 pb-8">
        <h2 className="mb-3 text-sm font-bold text-white/80">
          カテゴリ別スコア
        </h2>
        <div className="space-y-3">
          {CATEGORY_KEYS.map((cat) => {
            const maxVal = categoryMaxes[cat.key] || 1;
            return (
              <div
                key={cat.key}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="mb-2 text-xs font-medium text-white/60">
                  {cat.label}
                </p>
                <div className="space-y-1.5">
                  {activities.map((data) => {
                    const color = getGroupColor(data.groupId);
                    const val = data[cat.key] as number;
                    const pct = (val / maxVal) * 100;
                    return (
                      <div
                        key={data.groupId}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="w-14 shrink-0 truncate text-[10px] text-white/50">
                          {getGroupShortName(data.groupId)}
                        </span>
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-[10px] text-white/50">
                          {cat.key === "collectionRate"
                            ? `${val}%`
                            : val.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
