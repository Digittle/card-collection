"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Gift, BookOpen, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { SeriesBinder } from "@/components/collection-book/SeriesBinder";
import { ALL_CARDS, getCardsByGroup, getCardsBySeries, getAllSeries, getSeriesByGroup } from "@/lib/cards-data";
import { getUser, getCards, getCoins } from "@/lib/store";
import { GROUPS } from "@/lib/groups-data";

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F5F6]" />}>
      <CollectionBookInner />
    </Suspense>
  );
}

function CollectionBookInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    const groupParam = searchParams.get("group");
    if (groupParam && GROUPS.some((g) => g.id === groupParam)) {
      setSelectedGroup(groupParam);
    }
    setMounted(true);
  }, [router, searchParams]);

  const ownedCards = useMemo(() => {
    if (!mounted) return [];
    return getCards();
  }, [mounted]);

  const ownedIds = useMemo(
    () => new Set(ownedCards.map((c) => c.id)),
    [ownedCards]
  );

  const coins = useMemo(() => {
    if (!mounted) return 0;
    return getCoins();
  }, [mounted]);

  // Calculate overall progress
  const overallOwned = ownedCards.length;
  const overallTotal = ALL_CARDS.length;
  const overallPercent = overallTotal > 0 ? Math.round((overallOwned / overallTotal) * 100) : 0;

  // Get series to display based on selected group
  const seriesToShow = useMemo(() => {
    return selectedGroup === "all"
      ? getAllSeries()
      : getSeriesByGroup(selectedGroup);
  }, [selectedGroup]);

  // Calculate completed series count
  const completedSeries = useMemo(() => {
    return seriesToShow.filter(series => {
      const seriesCards = getCardsBySeries(series);
      return seriesCards.every(c => ownedIds.has(c.id));
    }).length;
  }, [seriesToShow, ownedIds]);

  // Get accent color for a series
  const getAccentColor = (series: string) => {
    const firstCard = getCardsBySeries(series)[0];
    if (!firstCard) return "#ec6d81";
    const group = GROUPS.find(g => g.id === firstCard.groupId);
    return group?.accentColor || "#ec6d81";
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  return (
    <AppShell>
      <Header title="コレクションブック" coins={coins} />

      <div className="px-4 pb-8">
        {/* Overall Progress Card */}
        <motion.div
          className="mt-4 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-500" />
              <span className="text-[15px] font-bold text-gray-900">コレクション進捗</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-gold-400" />
              <span className="text-[12px] font-bold text-gray-500">
                {completedSeries}/{seriesToShow.length} シリーズ完成
              </span>
            </div>
          </div>

          {/* Large circular progress */}
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 flex-shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke="#ec6d81" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - overallPercent / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[18px] font-bold text-gray-900">{overallPercent}%</span>
              </div>
            </div>
            <div>
              <p className="text-[24px] font-bold text-gray-900">
                {overallOwned}<span className="text-[14px] font-normal text-gray-400"> / {overallTotal}枚</span>
              </p>
              <p className="mt-1 text-[12px] text-gray-400">
                {overallOwned === overallTotal ? "全カードコンプリート！" : "ガチャやショップでカードを集めよう"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Group filter pills */}
        <div className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedGroup("all")}
            className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors"
            style={
              selectedGroup === "all"
                ? { backgroundColor: "#ec6d81", color: "#fff" }
                : { backgroundColor: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.4)" }
            }
          >
            すべて
          </button>
          {GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors"
              style={
                selectedGroup === group.id
                  ? { backgroundColor: group.accentColor, color: "#fff" }
                  : { backgroundColor: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.4)" }
              }
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Series Binders */}
        <div className="mt-5 space-y-4">
          {seriesToShow.map((series, index) => (
            <SeriesBinder
              key={series}
              seriesName={series}
              cards={getCardsBySeries(series)}
              ownedIds={ownedIds}
              accentColor={getAccentColor(series)}
              index={index}
            />
          ))}
        </div>

        {/* Empty state when no cards at all */}
        {overallOwned === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-col items-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Gift className="h-7 w-7 text-gray-400" />
            </div>
            <p className="mb-1 text-[15px] font-bold text-gray-500">カードがまだありません</p>
            <p className="mb-5 text-center text-[13px] text-gray-400">ガチャでカードを集めよう</p>
            <Link
              href="/gacha"
              className="rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
            >
              ガチャを引く
            </Link>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
