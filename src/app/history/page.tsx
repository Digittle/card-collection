"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, ImageIcon, BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { OwnedCard, RARITY_CONFIG } from "@/types";
import { getUser, getCards } from "@/lib/store";

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

export default function HistoryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<OwnedCard[]>([]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setCards(getCards());
    setMounted(true);
  }, [router]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  const dateGroups = groupByDate(cards);

  return (
    <AppShell>
      <Header title="ヒストリー" showBack />

      <div className="px-4 pb-8">
        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 flex flex-col items-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Clock className="h-7 w-7 text-white/30" />
            </div>
            <p className="mb-1 text-[15px] font-bold text-white/60">
              まだカードを取得していません
            </p>
            <p className="mb-5 text-center text-[13px] text-white/30">
              ガチャでカードを集めよう
            </p>
            <Link
              href="/gacha"
              className="rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
            >
              ガチャを引く
            </Link>
          </motion.div>
        ) : (
          <div className="mt-4 space-y-6">
            {Array.from(dateGroups.entries()).map(
              ([dateKey, groupCards], groupIdx) => (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(groupIdx * 0.08, 0.4) }}
                >
                  {/* Date header */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-4 w-[2px] rounded-full bg-primary-400" />
                    <span className="text-[13px] font-bold text-white/40">
                      {formatDateJP(groupCards[0].obtainedAt)}
                    </span>
                  </div>

                  {/* Cards in this date group */}
                  <div className="space-y-2">
                    {groupCards.map((card, cardIdx) => {
                      const config = RARITY_CONFIG[card.rarity];
                      const memoPreview =
                        card.memo && card.memo.length > 50
                          ? card.memo.slice(0, 50) + "..."
                          : card.memo;
                      const imageCount = card.attachedImages?.length || 0;

                      return (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: Math.min(
                              groupIdx * 0.08 + cardIdx * 0.04,
                              0.6
                            ),
                          }}
                        >
                          <Link href={`/card/${card.id}`}>
                            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-colors active:bg-white/[0.08]">
                              {/* Card thumbnail */}
                              <div
                                className={`card-glow-${card.rarity} relative h-[84px] w-[60px] shrink-0 overflow-hidden rounded-xl`}
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
                                    sizes="60px"
                                  />
                                )}
                              </div>

                              {/* Card info */}
                              <div className="flex min-w-0 flex-1 flex-col justify-center">
                                <p className="truncate text-[14px] font-bold text-white">
                                  {card.title}
                                </p>
                                <p className="mt-0.5 text-[12px] text-white/50">
                                  {card.memberName}
                                </p>
                                <p
                                  className="mt-0.5 text-[12px]"
                                  style={{ color: config.color }}
                                >
                                  {"★".repeat(config.stars)}
                                </p>

                                {/* Memo preview & image count */}
                                <div className="mt-1 flex items-center gap-2">
                                  {memoPreview && (
                                    <span className="flex items-center gap-1 truncate text-[11px] text-white/30">
                                      <BookOpen className="h-3 w-3 shrink-0" />
                                      <span className="truncate">
                                        {memoPreview}
                                      </span>
                                    </span>
                                  )}
                                  {imageCount > 0 && (
                                    <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-white/30">
                                      <ImageIcon className="h-3 w-3" />
                                      {imageCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
