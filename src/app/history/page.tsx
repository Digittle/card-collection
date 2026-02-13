"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { OwnedCard, RARITY_CONFIG } from "@/types";
import { getUser, getCards } from "@/lib/store";

// --- Helpers ---

function formatDateJP(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function groupByDate(cards: OwnedCard[]): Map<string, OwnedCard[]> {
  const sorted = [...cards].sort(
    (a, b) => new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime()
  );
  const groups = new Map<string, OwnedCard[]>();
  for (const card of sorted) {
    const key = new Date(card.obtainedAt).toDateString();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(card);
  }
  return groups;
}

function calculateStreak(cards: OwnedCard[]): number {
  if (cards.length === 0) return 0;
  const dates = [...new Set(cards.map((c) => new Date(c.obtainedAt).toDateString()))];
  const sorted = dates.map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  const today = new Date();
  const mostRecent = sorted[0];
  const daysSince = Math.round(
    (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince > 1) return 0;
  return streak;
}

type FilterTab = "all" | "photo" | "memo";

// --- Animated Counter ---

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.6,
      ease: "easeOut",
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, motionVal, rounded]);

  return <span className={className}>{display}</span>;
}

// --- Components ---

function StatPill({
  emoji,
  value,
  label,
  highlight,
}: {
  emoji: string;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-[100px] shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.06] px-4 py-3">
      <div className="flex items-center gap-1.5">
        <span className="text-[16px]">{emoji}</span>
        <AnimatedNumber
          value={value}
          className={`text-[20px] font-bold ${highlight ? "text-amber-400" : "text-white"}`}
        />
      </div>
      <p className="mt-0.5 text-[11px] text-white/40">{label}</p>
    </div>
  );
}

function DateSeparator({ date, index }: { date: string; index: number }) {
  return (
    <div className="my-6 flex items-center gap-3 px-2">
      <motion.div
        className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        style={{ originX: 1 }}
      />
      <span className="whitespace-nowrap text-[12px] font-bold text-white/30">
        {formatDateJP(date)}
      </span>
      <motion.div
        className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        style={{ originX: 0 }}
      />
    </div>
  );
}

function MemoryCard({
  card,
  index,
}: {
  card: OwnedCard;
  index: number;
}) {
  const config = RARITY_CONFIG[card.rarity];
  const hasAttachedImage = card.attachedImages && card.attachedImages.length > 0;
  const imageCount = card.attachedImages?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Link href={`/card/${card.id}`}>
        <div
          className={`card-glow-${card.rarity} overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04]`}
        >
          {/* Hero photo area */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {/* Ambient glow */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `${card.memberColor}14` }}
            />
            {hasAttachedImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={card.attachedImages![0]}
                alt="思い出写真"
                className="h-full w-full object-cover"
              />
            ) : card.memberImage ? (
              <Image
                src={card.memberImage}
                alt={card.memberName}
                fill
                className="object-cover object-top"
                sizes="(max-width: 448px) 100vw, 448px"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${card.memberColor}40 0%, ${card.memberColor}90 100%)`,
                }}
              />
            )}
            {/* Photo count badge */}
            {imageCount > 1 && (
              <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[12px] font-bold text-white backdrop-blur-sm">
                📸 {imageCount}枚
              </div>
            )}
          </div>

          {/* Card info row */}
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Card thumbnail */}
            <div
              className={`card-glow-${card.rarity} relative h-[67px] w-[48px] shrink-0 overflow-hidden rounded-xl`}
              style={{
                background: `linear-gradient(135deg, ${card.memberColor}40 0%, ${card.memberColor}90 100%)`,
              }}
            >
              {card.memberImage && (
                <Image
                  src={card.memberImage}
                  alt={card.memberName}
                  fill
                  className="object-cover object-top"
                  sizes="48px"
                />
              )}
              <div className="card-holo-overlay absolute inset-0" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-white">
                {card.title}
              </p>
              <p className="mt-0.5 text-[12px] text-white/50">
                {card.memberName}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[12px]" style={{ color: config.color }}>
                  {"★".repeat(config.stars)}
                </span>
                <span className="text-[11px] text-white/30">
                  {formatDateJP(card.obtainedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Memo preview */}
          {card.memo && (
            <div className="border-t border-white/[0.06] px-4 py-3">
              <p className="line-clamp-3 text-[14px] leading-relaxed text-white/60">
                {card.memo}
              </p>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function QuickCardGrid({
  cards,
  startIndex,
}: {
  cards: OwnedCard[];
  startIndex: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => {
        const config = RARITY_CONFIG[card.rarity];
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (startIndex + i) * 0.06, duration: 0.4 }}
          >
            <Link href={`/card/${card.id}`}>
              <div
                className={`card-glow-${card.rarity} overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04]`}
              >
                <div className="relative aspect-[5/7] w-full overflow-hidden">
                  {card.memberImage ? (
                    <Image
                      src={card.memberImage}
                      alt={card.memberName}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 448px) 50vw, 224px"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(135deg, ${card.memberColor}40 0%, ${card.memberColor}90 100%)`,
                      }}
                    />
                  )}
                  {/* Bottom overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                    <p className="truncate text-[13px] font-bold text-white">
                      {card.memberName}
                    </p>
                    <p className="text-[11px]" style={{ color: config.color }}>
                      {"★".repeat(config.stars)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-16 flex flex-col items-center"
    >
      {/* Pulsing card silhouette */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 h-[120px] w-[86px] rounded-2xl border border-white/10 bg-white/[0.04]"
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-white/[0.06]" />
        </div>
      </motion.div>
      <p className="mb-1 text-[15px] font-bold text-white/60">
        まだカードを取得していません
      </p>
      <p className="mb-5 text-center text-[13px] text-white/30">
        ガチャやショップでカードを集めて思い出を記録しよう
      </p>
      <Link
        href="/gacha"
        className="rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
      >
        ガチャを引く
      </Link>
    </motion.div>
  );
}

// --- Main Page ---

export default function HistoryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<OwnedCard[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setCards(getCards());
    setMounted(true);
  }, [router]);

  // Compute stats from all cards (unfiltered)
  const stats = useMemo(() => {
    const totalPhotos = cards.reduce(
      (sum, c) => sum + (c.attachedImages?.length || 0),
      0
    );
    const uniqueMembers = new Set(cards.map((c) => c.memberId)).size;
    const streak = calculateStreak(cards);
    return {
      totalCards: cards.length,
      streak,
      totalPhotos,
      uniqueMembers,
    };
  }, [cards]);

  // Filter cards
  const filteredCards = useMemo(() => {
    switch (activeFilter) {
      case "photo":
        return cards.filter(
          (c) => c.attachedImages && c.attachedImages.length > 0
        );
      case "memo":
        return cards.filter((c) => c.memo && c.memo.trim().length > 0);
      default:
        return cards;
    }
  }, [cards, activeFilter]);

  const dateGroups = useMemo(() => groupByDate(filteredCards), [filteredCards]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "すべて" },
    { key: "photo", label: "写真あり" },
    { key: "memo", label: "メモあり" },
  ];

  return (
    <AppShell>
      <Header title="推し活ダイアリー" showBack />

      <div className="px-4 pb-8">
        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Stats Summary Bar */}
            <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
              <StatPill
                emoji="🗂"
                value={stats.totalCards}
                label="総カード"
              />
              <StatPill
                emoji="🔥"
                value={stats.streak}
                label="コレクトストリーク"
                highlight
              />
              <StatPill
                emoji="📸"
                value={stats.totalPhotos}
                label="思い出写真"
              />
              <StatPill
                emoji="👤"
                value={stats.uniqueMembers}
                label="メンバー"
              />
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex items-center gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                    activeFilter === tab.key
                      ? "bg-white/10 font-bold text-white"
                      : "text-white/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Timeline Content */}
            {filteredCards.length === 0 ? (
              <div className="mt-16 text-center">
                <p className="text-[14px] text-white/40">
                  {activeFilter === "photo"
                    ? "写真付きのカードはまだありません"
                    : "メモ付きのカードはまだありません"}
                </p>
              </div>
            ) : (
              <div className="mt-2">
                {Array.from(dateGroups.entries()).map(
                  ([dateKey, groupCards], groupIdx) => {
                    // Separate memory-rich (Type A) and quick (Type B) cards
                    const memoryCards = groupCards.filter(
                      (c) =>
                        (c.memo && c.memo.trim().length > 0) ||
                        (c.attachedImages && c.attachedImages.length > 0)
                    );
                    const quickCards = groupCards.filter(
                      (c) =>
                        !(c.memo && c.memo.trim().length > 0) &&
                        !(c.attachedImages && c.attachedImages.length > 0)
                    );

                    return (
                      <div key={dateKey}>
                        <DateSeparator
                          date={groupCards[0].obtainedAt}
                          index={groupIdx}
                        />

                        {/* Type A: Memory Cards */}
                        {memoryCards.length > 0 && (
                          <div className="space-y-4">
                            {memoryCards.map((card, i) => (
                              <MemoryCard
                                key={card.id}
                                card={card}
                                index={groupIdx * 3 + i}
                              />
                            ))}
                          </div>
                        )}

                        {/* Type B: Quick Cards (2-column grid) */}
                        {quickCards.length > 0 && (
                          <div className={memoryCards.length > 0 ? "mt-4" : ""}>
                            <QuickCardGrid
                              cards={quickCards}
                              startIndex={
                                groupIdx * 3 + memoryCards.length
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
