"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Swords,
  BarChart3,
  Coins,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { getUser, getCoins } from "@/lib/store";
import { GROUPS } from "@/lib/groups-data";
import {
  getGroupActivities,
  GroupActivityData,
  calculateTerritoryPercentages,
  generateTerritoryShifts,
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

function PodiumSlot({ rank, territory, delay }: { rank: 1|2|3; territory: TerritoryData; delay: number }) {
  const color = getGroupColor(territory.groupId);
  const podiumHeight = rank === 1 ? 140 : rank === 2 ? 110 : 85;
  const iconSize = rank === 1 ? "h-10 w-10" : "h-8 w-8";
  const fontSize = rank === 1 ? "text-[28px]" : "text-[22px]";
  const nameSize = rank === 1 ? "text-[14px]" : "text-[12px]";
  const width = rank === 1 ? "w-[110px]" : "w-[90px]";
  const medalGradient = rank === 1
    ? "from-amber-400 to-yellow-300"
    : rank === 2 ? "from-gray-300 to-gray-400"
    : "from-amber-700 to-amber-600";

  return (
    <motion.div className={`flex flex-col items-center ${width}`}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}>
      {rank === 1 && (
        <motion.div className="mb-1"
          animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Crown className="h-6 w-6 text-amber-400 drop-shadow-lg" fill="currentColor" />
        </motion.div>
      )}
      <div className={`${iconSize} rounded-full flex items-center justify-center mb-2 border-2`}
        style={{ borderColor: color, background: `${color}30`,
          boxShadow: rank === 1 ? `0 0 20px ${color}40` : `0 0 10px ${color}20` }}>
        <span className="text-[11px] font-black text-white">
          {getGroupShortName(territory.groupId).charAt(0)}
        </span>
      </div>
      <span className={`${nameSize} font-bold text-white mb-1`}>
        {getGroupShortName(territory.groupId)}
      </span>
      <motion.span className={`${fontSize} font-black tabular-nums`} style={{ color }}
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.3, type: "spring" }}>
        {territory.percentage}%
      </motion.span>
      <span className="text-[10px] text-white/30 tabular-nums">
        {territory.score.toLocaleString()} pts
      </span>
      <motion.div className="w-full mt-2 rounded-t-lg relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${color}40 0%, ${color}15 100%)`,
          borderTop: `2px solid ${color}60`, borderLeft: `1px solid ${color}20`, borderRight: `1px solid ${color}20` }}
        initial={{ height: 0 }} animate={{ height: podiumHeight }}
        transition={{ delay: delay + 0.1, duration: 0.6, ease: "easeOut" }}>
        <div className="flex justify-center pt-3">
          <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${medalGradient} flex items-center justify-center shadow-lg`}>
            <span className="text-[14px] font-black text-white drop-shadow">{rank}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ActivityPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(0);
  const [period, setPeriod] = useState<Period>("today");
  const [activities, setActivities] = useState<GroupActivityData[]>([]);
  const [territories, setTerritories] = useState<TerritoryData[]>([]);
  const [battleLog, setBattleLog] = useState<TerritoryShift[]>([]);
  const [tick, setTick] = useState(0);
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

  return (
    <div className="mx-auto min-h-screen max-w-md relative overflow-hidden"
         style={{ background: "linear-gradient(180deg, #0a0e27 0%, #0d1333 40%, #030712 100%)" }}>

      {/* Ambient orbs */}
      <div className="ambient-glow" style={{ width: 200, height: 200, top: "10%", left: "-20%",
        background: "radial-gradient(circle, rgba(236,109,129,0.15), transparent)" }} />
      <div className="ambient-glow" style={{ width: 160, height: 160, top: "30%", right: "-15%",
        background: "radial-gradient(circle, rgba(91,140,184,0.12), transparent)", animationDelay: "5s" }} />
      <div className="ambient-glow" style={{ width: 180, height: 180, bottom: "20%", left: "-10%",
        background: "radial-gradient(circle, rgba(139,113,176,0.1), transparent)", animationDelay: "10s" }} />

      <div className="relative z-10 pb-24">
        {/* Custom Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-black/20 border-b border-white/5">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="w-12" />
            <h1 className="text-[18px] font-bold text-white">ランキング</h1>
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 border border-white/10">
              <Coins className="h-3.5 w-3.5 text-gold-300" />
              <span className="text-[12px] font-bold tabular-nums text-gold-300">{coins.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* Live Indicator */}
        <div className="flex items-center justify-center gap-2 pt-4 pb-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-medium text-emerald-400/80">LIVE</span>
        </div>

        {/* Period Tabs */}
        <div className="flex justify-center gap-2 px-4 mb-6">
          {PERIOD_LABELS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`rounded-full px-5 py-1.5 text-[12px] font-bold transition-all ${
                period === p.key
                  ? "bg-white text-gray-900 shadow-lg shadow-white/10"
                  : "bg-white/8 text-white/40 border border-white/5"
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Hero Podium Section */}
        <section className="px-4 mb-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/8 to-white/3 backdrop-blur-sm p-5 pt-8">
            {/* Decorative ring */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <svg className="h-64 w-64 animate-[ringRotate_30s_linear_infinite]" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="url(#rankRing)" strokeWidth="0.5" strokeDasharray="4 8" />
                <defs>
                  <linearGradient id="rankRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f6ab00" />
                    <stop offset="50%" stopColor="#ec6d81" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Podium: 2nd | 1st | 3rd */}
            <div className="relative z-10 flex items-end justify-center gap-3 mb-4" style={{ minHeight: 180 }}>
              {sortedTerritories[1] && <PodiumSlot rank={2} territory={sortedTerritories[1]} delay={0.2} />}
              {sortedTerritories[0] && <PodiumSlot rank={1} territory={sortedTerritories[0]} delay={0.1} />}
              {sortedTerritories[2] && <PodiumSlot rank={3} territory={sortedTerritories[2]} delay={0.3} />}
            </div>

            {/* 4th place */}
            {sortedTerritories[3] && (
              <div className="flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[12px] font-bold text-white/30">4</span>
                <span className="text-[13px] font-medium text-white/50">{getGroupShortName(sortedTerritories[3].groupId)}</span>
                <span className="ml-auto text-[14px] font-bold" style={{ color: `${getGroupColor(sortedTerritories[3].groupId)}80` }}>
                  {sortedTerritories[3].percentage}%
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Ranking Cards */}
        <section className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-[14px] font-bold text-white">グループランキング</span>
          </div>
          <div className="space-y-2.5">
            {sortedTerritories.map((t, index) => {
              const color = getGroupColor(t.groupId);
              const activity = activities.find((a) => a.groupId === t.groupId);
              const isFirst = t.rank === 1;
              const trendDir = activity?.trendDirection ?? "stable";
              return (
                <motion.div key={t.groupId}
                  className="relative rounded-xl overflow-hidden border border-white/10 backdrop-blur-sm"
                  style={{
                    background: isFirst ? `linear-gradient(135deg, ${color}15 0%, rgba(255,255,255,0.05) 100%)` : "rgba(255,255,255,0.05)",
                    ...(isFirst && { boxShadow: `0 0 20px ${color}20, inset 0 0 30px ${color}05` }),
                  }}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}>
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
                  <div className="flex items-center p-3.5 pl-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                      t.rank === 1 ? "bg-gradient-to-br from-amber-400 to-yellow-300 shadow-lg shadow-amber-400/20"
                      : t.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-400"
                      : t.rank === 3 ? "bg-gradient-to-br from-amber-700 to-amber-600"
                      : "bg-white/10 border border-white/10"
                    }`}>
                      <span className={`text-[15px] font-black ${t.rank <= 3 ? "text-white drop-shadow" : "text-white/40"}`}>{t.rank}</span>
                    </div>
                    <div className="flex-1 ml-3 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-bold text-white">{getGroupShortName(t.groupId)}</span>
                        {isFirst && <Crown className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <motion.div className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
                            initial={{ width: 0 }} animate={{ width: `${t.percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }} />
                        </div>
                        <span className="text-[10px] tabular-nums text-white/30 shrink-0">{t.score.toLocaleString()} pts</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-3">
                      <span className="text-[20px] font-black tabular-nums" style={{ color }}>{t.percentage}%</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide ${
                        trendDir === "up" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        : trendDir === "down" ? "bg-red-500/20 text-red-400 border border-red-500/20"
                        : "bg-white/10 text-white/30 border border-white/5"
                      }`}>
                        {trendDir === "up" ? <span className="inline-flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" /> UP</span>
                        : trendDir === "down" ? <span className="inline-flex items-center gap-0.5"><TrendingDown className="h-2.5 w-2.5" /> DOWN</span>
                        : <span className="inline-flex items-center gap-0.5"><Minus className="h-2.5 w-2.5" /> --</span>}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Battle Log */}
        <section className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="h-4 w-4 text-red-400" />
            <span className="text-[14px] font-bold text-white">バトルログ</span>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {battleLog.map((shift, i) => {
                const color = getGroupColor(shift.attackerGroupId);
                const minutesAgo = Math.round((Date.now() - new Date(shift.timestamp).getTime()) / 60000);
                const timeLabel = minutesAgo < 1 ? "たった今" : minutesAgo < 60 ? `${minutesAgo}分前` : `${Math.floor(minutesAgo / 60)}時間前`;
                return (
                  <motion.div key={shift.id}
                    className="relative flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 backdrop-blur-sm px-3.5 py-2.5 overflow-hidden"
                    initial={{ opacity: 0, x: -30, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 30, scale: 0.95 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}>
                    <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: color }} />
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
                      <Swords className="h-3 w-3" style={{ color }} />
                    </div>
                    <p className="flex-1 min-w-0 text-[12px] text-white/60 truncate">{shift.message}</p>
                    <span className="text-[10px] text-white/20 shrink-0 tabular-nums">{timeLabel}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="px-4 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <span className="text-[14px] font-bold text-white">カテゴリ別</span>
          </div>
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto mb-3 pb-0.5">
            {CATEGORY_KEYS.map((cat) => (
              <button key={cat.key} onClick={() => setSelectedCategory(cat.key)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-bold transition-all ${
                  selectedCategory === cat.key
                    ? "bg-white text-gray-900 shadow-lg shadow-white/10"
                    : "bg-white/8 text-white/30 border border-white/5"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-3">
            {activities.map((data) => {
              const color = getGroupColor(data.groupId);
              const val = data[selectedCategory] as number;
              const maxVal = categoryMaxes[selectedCategory as string] || 1;
              const pct = (val / maxVal) * 100;
              return (
                <div key={data.groupId} className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  <span className="w-14 shrink-0 truncate text-[11px] font-medium text-white/40">{getGroupShortName(data.groupId)}</span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${color}CC, ${color})`, boxShadow: `0 0 8px ${color}40` }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }} />
                  </div>
                  <span className="w-12 shrink-0 text-right text-[11px] font-bold tabular-nums text-white/50">
                    {selectedCategory === "collectionRate" ? `${val}%` : val.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
