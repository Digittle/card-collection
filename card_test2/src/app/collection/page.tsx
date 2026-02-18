"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Gift, BookOpen, Trophy, ChevronDown } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setMounted(true);
  }, [router]);

  const user = useMemo(() => {
    if (!mounted) return null;
    return getUser();
  }, [mounted]);

  const tanmouGroupId = user?.tanmouGroupId || null;

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

  // Overall progress
  const overallOwned = ownedCards.length;
  const overallTotal = ALL_CARDS.length;
  const overallPercent = overallTotal > 0 ? Math.round((overallOwned / overallTotal) * 100) : 0;

  // All series for completed series count
  const allSeries = useMemo(() => getAllSeries(), []);
  const completedSeries = useMemo(() => {
    return allSeries.filter(series => {
      const seriesCards = getCardsBySeries(series);
      return seriesCards.every(c => ownedIds.has(c.id));
    }).length;
  }, [allSeries, ownedIds]);

  // Tanmou group and other groups
  const tanmouGroup = useMemo(() => {
    if (!tanmouGroupId) return null;
    return GROUPS.find(g => g.id === tanmouGroupId) || null;
  }, [tanmouGroupId]);

  const otherGroups = useMemo(() => {
    if (!tanmouGroupId) return GROUPS;
    return GROUPS.filter(g => g.id !== tanmouGroupId);
  }, [tanmouGroupId]);

  // Default: all groups collapsed (tanmou group is always expanded separately)
  // No auto-expand needed

  // Tanmou group data
  const tanmouSeries = useMemo(() => {
    if (!tanmouGroupId) return [];
    return getSeriesByGroup(tanmouGroupId);
  }, [tanmouGroupId]);

  const tanmouCards = useMemo(() => {
    if (!tanmouGroupId) return [];
    return getCardsByGroup(tanmouGroupId);
  }, [tanmouGroupId]);

  const tanmouOwnedCount = useMemo(() => {
    return tanmouCards.filter(c => ownedIds.has(c.id)).length;
  }, [tanmouCards, ownedIds]);

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

      <div className="pb-8">
        {/* Overall Progress Card */}
        <div className="px-4">
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
                  {completedSeries}/{allSeries.length} シリーズ完成
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
        </div>

        {/* Tanmou Group Section (always expanded) */}
        {tanmouGroup && (
          <section className="px-4 mt-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Accent bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: tanmouGroup.accentColor }} />

              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tanmouGroup.accentColor }} />
                  <span className="text-[15px] font-bold text-gray-900">{tanmouGroup.name}</span>
                  <span className="text-[11px] text-gray-400">あなたの担当</span>
                </div>
                <span className="text-[12px] font-bold text-gray-500">
                  {tanmouOwnedCount}/{tanmouCards.length}枚
                </span>
              </div>

              {/* Series binders */}
              <div className="px-4 pb-4 space-y-3">
                {tanmouSeries.map((series, index) => (
                  <SeriesBinder
                    key={series}
                    seriesName={series}
                    cards={getCardsBySeries(series)}
                    ownedIds={ownedIds}
                    accentColor={tanmouGroup.accentColor}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Other Groups (collapsible) */}
        <section className="px-4 mt-5 space-y-3">
          {otherGroups.map(group => {
            const isExpanded = expandedGroups.has(group.id);
            const groupSeries = getSeriesByGroup(group.id);
            const groupCards = getCardsByGroup(group.id);
            const ownedGroupCount = groupCards.filter(c => ownedIds.has(c.id)).length;

            return (
              <div key={group.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Clickable header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center w-full px-4 py-3.5 gap-3"
                >
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: group.accentColor }} />
                  <span className="text-[14px] font-bold text-gray-900 flex-1 text-left">{group.name}</span>
                  <span className="text-[12px] text-gray-400 mr-2">
                    {ownedGroupCount}/{groupCards.length}枚
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {/* Expandable content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                        {groupSeries.map((series, index) => (
                          <SeriesBinder
                            key={series}
                            seriesName={series}
                            cards={getCardsBySeries(series)}
                            ownedIds={ownedIds}
                            accentColor={group.accentColor}
                            index={index}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </section>

        {/* Complete reward hint */}
        <div className="px-4 mt-5">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-[13px] font-bold text-amber-700">コンプリート報酬</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-600">シリーズ完成</span>
                <span className="text-[12px] font-bold text-amber-600">+1,000 コイン</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-600">グループ全カード</span>
                <span className="text-[12px] font-bold text-amber-600">+5,000 コイン + 限定称号</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-600">全カードコンプ</span>
                <span className="text-[12px] font-bold text-amber-600">+50,000 コイン + ★特別カード</span>
              </div>
            </div>
          </div>
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
