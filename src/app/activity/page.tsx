"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Crown,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { getUser, getCoins } from "@/lib/store";
import { GROUPS, getMembersByGroup } from "@/lib/groups-data";
import {
  getGroupActivities,
  generateRecentEvents,
  GroupActivityData,
} from "@/lib/activity-simulator";
import { ActivityEvent } from "@/types";

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

function getGroupName(groupId: string): string {
  return GROUPS.find((g) => g.id === groupId)?.name ?? groupId;
}

function getGroupImage(groupId: string): string | undefined {
  const members = getMembersByGroup(groupId);
  if (members.length > 0 && members[0].image) {
    return `/members/${members[0].image}`;
  }
  return undefined;
}

export default function ActivityPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(0);
  const [period, setPeriod] = useState<Period>("today");
  const [activities, setActivities] = useState<GroupActivityData[]>([]);
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([]);
  const [tick, setTick] = useState(0);

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
    setActivities(getGroupActivities(period));
    setRecentEvents(generateRecentEvents());
    setCoins(getCoins());
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData, tick]);

  // Periodic live update every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Max score for bar scaling
  const maxScore = useMemo(
    () => Math.max(...activities.map((a) => a.totalScore), 1),
    [activities]
  );

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
        <h1 className="text-lg font-bold text-white">盛り上がりランキング</h1>
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
          <span className="text-xs text-yellow-400">🪙</span>
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

      {/* Ranking bars */}
      <section className="px-4">
        <AnimatePresence mode="popLayout">
          {activities.map((data, index) => {
            const color = getGroupColor(data.groupId);
            const name = getGroupName(data.groupId);
            const image = getGroupImage(data.groupId);
            const isFirst = index === 0;
            const barWidth = (data.totalScore / maxScore) * 100;
            const TrendIcon =
              data.trendDirection === "up"
                ? TrendingUp
                : data.trendDirection === "down"
                  ? TrendingDown
                  : Minus;

            return (
              <motion.div
                key={data.groupId}
                layout
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  delay: index * 0.1,
                }}
                className={`relative mb-3 overflow-hidden rounded-2xl border ${
                  isFirst
                    ? "border-yellow-500/40 bg-white/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {/* Background member image */}
                {image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                )}

                <div className="relative p-4">
                  {/* Rank + group info */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          isFirst
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-white/15 text-white"
                        }`}
                      >
                        {isFirst ? (
                          <Crown className="h-4 w-4" />
                        ) : (
                          `${index + 1}`
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{name}</span>
                          {isFirst && (
                            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                              今一番アツい！
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/50">
                          <TrendIcon className="h-3 w-3" />
                          <span>
                            {data.activeCollectors}人がアクティブ
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {data.totalScore.toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-white/40">
                        pt
                      </span>
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 12px ${color}80, 0 0 24px ${color}40`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                    />
                    {/* Glow pulse overlay */}
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full opacity-50"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${barWidth}%`,
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        width: {
                          duration: 0.8,
                          delay: index * 0.1,
                          ease: "easeOut",
                        },
                        opacity: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }}
                    />
                  </div>

                  {/* Mini stats */}
                  <div className="mt-2 flex gap-3 text-[11px] text-white/50">
                    <span>ガチャ{data.gachaDraws.toLocaleString()}回</span>
                    <span>カード{data.cardPurchases.toLocaleString()}枚</span>
                    <span>達成率{data.collectionRate}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>

      {/* Category breakdown */}
      <section className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-bold text-white/80">カテゴリ別</h2>
        <div className="space-y-4">
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
                <div className="space-y-2">
                  {activities.map((data) => {
                    const color = getGroupColor(data.groupId);
                    const val = data[cat.key] as number;
                    const pct = (val / maxVal) * 100;
                    return (
                      <div key={data.groupId} className="flex items-center gap-2">
                        <span className="w-20 shrink-0 truncate text-[11px] text-white/50">
                          {getGroupName(data.groupId)}
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
                        <span className="w-12 shrink-0 text-right text-[11px] text-white/50">
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

      {/* 24-hour heatmap */}
      <section className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-bold text-white/80">
          時間帯別アクティビティ
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-3">
          {/* Hour labels */}
          <div className="mb-1 flex">
            <div className="w-20 shrink-0" />
            <div className="flex flex-1 justify-between text-[9px] text-white/30">
              {[0, 6, 12, 18].map((h) => (
                <span key={h} style={{ width: "25%" }}>
                  {h}時
                </span>
              ))}
            </div>
          </div>

          {/* Grid rows */}
          {activities.map((data) => {
            const color = getGroupColor(data.groupId);
            const maxH = Math.max(...data.hourlyActivity, 1);
            const currentHour = new Date().getHours();
            // Adjust to JST-ish: we use the raw hourlyActivity array index as JST hour
            const jstHour =
              (currentHour + (new Date().getTimezoneOffset() / 60) + 9) % 24;

            return (
              <div key={data.groupId} className="mb-1.5 flex items-center">
                <span className="w-20 shrink-0 truncate text-[10px] text-white/50">
                  {getGroupName(data.groupId)}
                </span>
                <div className="flex flex-1 gap-[2px]">
                  {data.hourlyActivity.map((val, h) => {
                    const intensity = Math.max(0.08, val / maxH);
                    const isCurrentHour = h === Math.round(jstHour);
                    return (
                      <div
                        key={h}
                        className="aspect-square flex-1 rounded-[3px]"
                        style={{
                          backgroundColor: color,
                          opacity: intensity,
                          outline: isCurrentHour
                            ? `1.5px solid ${color}`
                            : "none",
                          outlineOffset: "1px",
                        }}
                        title={`${h}時: ${val}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent activity ticker */}
      <section className="mt-6 px-4 pb-8">
        <h2 className="mb-3 text-sm font-bold text-white/80">
          最近のアクティビティ
        </h2>
        <div className="space-y-2">
          {recentEvents.map((evt, i) => {
            const group = GROUPS.find((g) =>
              evt.detail.includes(g.name)
            );
            const color = group?.accentColor ?? "#60A5FA";
            const minutesAgo = Math.round(
              (Date.now() - new Date(evt.timestamp).getTime()) / 60000
            );
            const timeLabel =
              minutesAgo < 1
                ? "たった今"
                : minutesAgo < 60
                  ? `${minutesAgo}分前`
                  : `${Math.floor(minutesAgo / 60)}時間前`;

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
              >
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1">
                  <p className="text-[12px] leading-relaxed text-white/70">
                    {evt.detail}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/30">
                    {timeLabel}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
