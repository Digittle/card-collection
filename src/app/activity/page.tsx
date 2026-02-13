"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Swords,
  Map,
  BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
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

const RADIUS = 75;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
  const [selectedCategory, setSelectedCategory] = useState<keyof GroupActivityData>("gachaDraws");

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

    const seed = period.length * 1000 + tick * 7 + 42;
    const newGrid = generateTerritoryGrid(terr, seed);

    if (prevGridRef.current.length === 100) {
      const changed = new Set<number>();
      for (let i = 0; i < 100; i++) {
        if (prevGridRef.current[i] !== newGrid[i]) {
          changed.add(i);
        }
      }
      setChangedCells(changed);
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

  // Sort territories by percentage descending
  const sortedTerritories = useMemo(
    () => [...territories].sort((a, b) => b.percentage - a.percentage),
    [territories]
  );

  const topTerritory = sortedTerritories[0];

  return (
    <AppShell>
      <Header title="ランキング" coins={coins} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 pb-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-[11px] font-medium text-green-600">リアルタイム更新中</span>
        </div>

        {/* Section 1: Hero Territory Ring */}
        <section className="px-4 mb-5">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            {/* Period tabs */}
            <div className="flex justify-center gap-2 mb-5">
              {PERIOD_LABELS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${
                    period === p.key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* SVG Donut Ring */}
            <div className="flex justify-center mb-4">
              <div className="relative h-[200px] w-[200px]">
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  {sortedTerritories.map((t, i) => {
                    const segmentLength = (t.percentage / 100) * CIRCUMFERENCE;
                    let cumulativeOffset = 0;
                    for (let j = 0; j < i; j++) {
                      cumulativeOffset += sortedTerritories[j].percentage;
                    }
                    const rotation = (cumulativeOffset / 100) * 360 - 90;
                    const gap = 3;

                    return (
                      <motion.circle
                        key={t.groupId}
                        cx={100}
                        cy={100}
                        r={RADIUS}
                        fill="none"
                        stroke={getGroupColor(t.groupId)}
                        strokeWidth={24}
                        strokeDasharray={`${Math.max(0, segmentLength - gap)} ${CIRCUMFERENCE}`}
                        strokeLinecap="butt"
                        initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                        animate={{
                          strokeDasharray: `${Math.max(0, segmentLength - gap)} ${CIRCUMFERENCE}`,
                        }}
                        transition={{
                          duration: 1.0,
                          ease: "easeOut",
                          delay: i * 0.15,
                        }}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transformOrigin: "100px 100px",
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Center text */}
                {topTerritory && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Crown className="h-4 w-4 text-amber-400 mb-0.5" />
                    <span className="text-[14px] font-bold text-gray-900">
                      {getGroupShortName(topTerritory.groupId)}
                    </span>
                    <span
                      className="text-[28px] font-bold"
                      style={{ color: getGroupColor(topTerritory.groupId) }}
                    >
                      {topTerritory.percentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Legend row */}
            <div className="flex justify-center gap-4">
              {sortedTerritories.map((t) => (
                <div key={t.groupId} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getGroupColor(t.groupId) }}
                  />
                  <span className="text-[11px] font-medium text-gray-500">
                    {getGroupShortName(t.groupId)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Group Ranking Cards */}
        <section className="px-4 mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Trophy className="h-4 w-4 text-gray-900" />
            <span className="text-[14px] font-bold text-gray-900">グループランキング</span>
          </div>

          <div className="space-y-2.5">
            {sortedTerritories.map((t, index) => {
              const color = getGroupColor(t.groupId);
              const activity = activities.find((a) => a.groupId === t.groupId);
              const isFirst = t.rank === 1;
              const trendDir = activity?.trendDirection ?? "stable";

              return (
                <motion.div
                  key={t.groupId}
                  className="rounded-2xl border bg-white shadow-sm overflow-hidden"
                  style={{
                    borderColor: isFirst ? `${color}40` : undefined,
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  {/* #1 accent bar */}
                  {isFirst && (
                    <div className="h-1 w-full" style={{ backgroundColor: color }} />
                  )}

                  <div className="flex items-center p-4">
                    {/* Rank badge */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                        t.rank === 1
                          ? "bg-amber-50 border-amber-200"
                          : t.rank === 2
                            ? "bg-gray-100 border-gray-200"
                            : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <span
                        className={`text-[16px] font-bold ${
                          t.rank === 1
                            ? "text-amber-500"
                            : t.rank === 2
                              ? "text-gray-500"
                              : "text-gray-400"
                        }`}
                      >
                        {t.rank}
                      </span>
                    </div>

                    {/* Center info */}
                    <div className="flex-1 ml-3">
                      <span className="text-[15px] font-bold text-gray-900">
                        {getGroupShortName(t.groupId)}
                      </span>
                      {isFirst && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Crown className="h-3 w-3 text-amber-500" />
                          <span className="text-[10px] font-bold text-amber-500">現在1位</span>
                        </div>
                      )}
                      <p className="text-[11px] text-gray-400">
                        {t.score.toLocaleString()} pts
                      </p>
                    </div>

                    {/* Right: percentage + trend */}
                    <div className="flex flex-col items-end">
                      <span
                        className="text-[20px] font-bold"
                        style={{ color }}
                      >
                        {t.percentage}%
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          trendDir === "up"
                            ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                            : trendDir === "down"
                              ? "bg-red-50 text-red-500 border-red-100"
                              : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}
                      >
                        {trendDir === "up" ? (
                          <span className="inline-flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" /> UP
                          </span>
                        ) : trendDir === "down" ? (
                          <span className="inline-flex items-center gap-0.5">
                            <TrendingDown className="h-3 w-3" /> DOWN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5">
                            <Minus className="h-3 w-3" /> STABLE
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Territory Map */}
        <section className="px-4 mb-5">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Map className="h-4 w-4 text-gray-900" />
              <span className="text-[14px] font-bold text-gray-900">陣地マップ</span>
            </div>

            <div className="grid grid-cols-10 gap-[2px] rounded-xl bg-gray-100 p-1.5">
              {gridCells.map((groupId, i) => {
                const color = getGroupColor(groupId);
                const isBorder = isAdjacentToDifferentGroup(i, gridCells);
                const wasChanged = changedCells.has(i);

                return (
                  <motion.div
                    key={i}
                    className="aspect-square rounded-[3px]"
                    animate={
                      wasChanged
                        ? {
                            scale: [1, 0.5, 1],
                            backgroundColor: color,
                          }
                        : {
                            backgroundColor: color,
                            scale: 1,
                          }
                    }
                    transition={
                      wasChanged
                        ? { duration: 0.3, ease: "easeInOut" }
                        : { duration: 0.5 }
                    }
                    style={{
                      opacity: isBorder ? 0.9 : 0.55,
                    }}
                  />
                );
              })}
            </div>

            {/* Legend below grid */}
            <div className="mt-2.5 flex justify-center gap-4">
              {GROUPS.map((g) => (
                <div key={g.id} className="flex items-center gap-1">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: g.accentColor }}
                  />
                  <span className="text-[10px] text-gray-400">
                    {SHORT_NAMES[g.id] ?? g.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Battle Log */}
        <section className="px-4 mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Swords className="h-4 w-4 text-gray-900" />
            <span className="text-[14px] font-bold text-gray-900">バトルログ</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
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
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${color}26` }}
                    >
                      <Swords className="h-3.5 w-3.5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-gray-700 truncate">
                        {shift.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {timeLabel}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Section 5: Category Breakdown */}
        <section className="px-4 pb-8">
          <div className="flex items-center gap-1.5 mb-3">
            <BarChart3 className="h-4 w-4 text-gray-900" />
            <span className="text-[14px] font-bold text-gray-900">カテゴリ別</span>
          </div>

          {/* Category tabs */}
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto mb-3">
            {CATEGORY_KEYS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${
                  selectedCategory === cat.key
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Selected category data */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
            {activities.map((data) => {
              const color = getGroupColor(data.groupId);
              const val = data[selectedCategory] as number;
              const maxVal = categoryMaxes[selectedCategory as string] || 1;
              const pct = (val / maxVal) * 100;

              return (
                <div key={data.groupId} className="flex items-center gap-2.5">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="w-14 shrink-0 truncate text-[11px] font-medium text-gray-500">
                    {getGroupShortName(data.groupId)}
                  </span>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-[11px] font-medium text-gray-500">
                    {selectedCategory === "collectionRate"
                      ? `${val}%`
                      : val.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </motion.div>
    </AppShell>
  );
}
