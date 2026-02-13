"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, Heart, Sparkles, Star } from "lucide-react";
import { MEMBERS } from "@/lib/groups-data";
import { ALL_CARDS } from "@/lib/cards-data";
import { RARITY_CONFIG } from "@/types";
import type { User, OwnedCard } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { FeaturedBanner } from "@/components/home/FeaturedBanner";
import { GroupCarousel } from "@/components/home/GroupCarousel";
import { CollectionProgress } from "@/components/home/CollectionProgress";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { getUser, getCoins, getCards, getGekioshiCardId } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [coins, setCoins] = useState(0);
  const [user, setUserState] = useState<User | null>(null);
  const [gekioshiCard, setGekioshiCard] = useState<OwnedCard | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/");
      return;
    }
    setUserState(u);
    setCoins(getCoins());
    setReady(true);

    const gekioshiId = getGekioshiCardId();
    if (gekioshiId) {
      const owned = getCards();
      const gCard = owned.find(c => c.id === gekioshiId);
      if (gCard) setGekioshiCard(gCard);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <AppShell>
      <Header title="ホーム" coins={coins} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        {/* Tanmou / User Status Section */}
        {user && (
          <div className="px-4 mb-5">
            <motion.div
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {(() => {
                const tanmouMember = user.tanmouMemberId
                  ? MEMBERS.find(m => m.id === user.tanmouMemberId)
                  : null;
                const tanmouCards = user.tanmouMemberId
                  ? ALL_CARDS.filter(c => c.memberId === user.tanmouMemberId)
                  : [];
                const ownedCards = getCards();
                const ownedTanmouCards = tanmouCards.filter(c =>
                  ownedCards.some(oc => oc.id === c.id)
                );
                const daysSinceRegistration = Math.floor(
                  (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                );
                const registrationDate = new Date(user.createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                return (
                  <>
                    {/* Tanmou card display */}
                    {tanmouMember && (
                      <div className="relative h-44 overflow-hidden">
                        {/* Background gradient with member color */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${tanmouMember.color}30 0%, ${tanmouMember.color}60 100%)`,
                          }}
                        />
                        {/* Member image */}
                        {tanmouMember.image && (
                          <Image
                            src={`/members/${tanmouMember.image}`}
                            alt={tanmouMember.name}
                            fill
                            className="object-cover object-top opacity-40"
                            sizes="448px"
                          />
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                        {/* Content */}
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <div className="flex items-end gap-3">
                            {/* Member avatar */}
                            <div
                              className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 shadow-lg"
                              style={{ borderColor: tanmouMember.color }}
                            >
                              {tanmouMember.image ? (
                                <Image
                                  src={`/members/${tanmouMember.image}`}
                                  alt={tanmouMember.name}
                                  fill
                                  className="object-cover object-top"
                                  sizes="64px"
                                />
                              ) : (
                                <div
                                  className="flex h-full w-full items-center justify-center text-[20px] font-bold text-white"
                                  style={{ backgroundColor: tanmouMember.color }}
                                >
                                  {tanmouMember.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Heart className="h-3.5 w-3.5 text-primary-500" fill="currentColor" />
                                <span className="text-[11px] font-bold text-primary-500">担当</span>
                              </div>
                              <p className="text-[20px] font-bold text-gray-900 truncate">
                                {tanmouMember.name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                カード {ownedTanmouCards.length}/{tanmouCards.length}枚 コンプリート
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Welcome message when no tanmou */}
                    {!tanmouMember && (
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4 text-primary-500" />
                          <span className="text-[14px] font-bold text-gray-900">
                            こんにちは、{user.displayName}さん
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-400">
                          設定から担当メンバーを選ぶと、ここにトレカが表示されます
                        </p>
                      </div>
                    )}

                    {/* User stats row */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                      <div className="flex flex-col items-center py-3">
                        <span className="text-[10px] text-gray-400">推し活</span>
                        <span className="text-[18px] font-bold text-gray-900">
                          {daysSinceRegistration === 0 ? 1 : daysSinceRegistration}
                        </span>
                        <span className="text-[10px] text-gray-400">日目</span>
                      </div>
                      <div className="flex flex-col items-center py-3">
                        <span className="text-[10px] text-gray-400">所持カード</span>
                        <span className="text-[18px] font-bold text-gray-900">
                          {ownedCards.length}
                        </span>
                        <span className="text-[10px] text-gray-400">/ {ALL_CARDS.length}枚</span>
                      </div>
                      <div className="flex flex-col items-center py-3">
                        <span className="text-[10px] text-gray-400">登録日</span>
                        <span className="text-[12px] font-bold text-gray-900 mt-0.5">
                          {new Date(user.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(user.createdAt).getFullYear()}年
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}

        {/* Gekioshi Card Display */}
        {gekioshiCard && (
          <div className="px-4 mb-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {/* Section label */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                <span className="text-[14px] font-bold text-gray-900">激推しカード</span>
              </div>

              {/* Card showcase */}
              <Link href={`/card/${gekioshiCard.id}`}>
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {/* Card visual - horizontal layout */}
                  <div className="flex">
                    {/* Card image (left side) */}
                    <div
                      className="relative w-28 aspect-[5/7] flex-shrink-0 overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${gekioshiCard.memberColor}40 0%, ${gekioshiCard.memberColor}90 100%)`,
                      }}
                    >
                      {gekioshiCard.memberImage && (
                        <Image
                          src={gekioshiCard.memberImage}
                          alt={gekioshiCard.memberName}
                          fill
                          className="object-cover object-top"
                          sizes="112px"
                        />
                      )}
                      <div className="card-holo-overlay" style={{ opacity: 0.3 }} />
                    </div>

                    {/* Card info (right side) */}
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      {/* Rarity badge */}
                      <span
                        className="self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          backgroundColor: `${RARITY_CONFIG[gekioshiCard.rarity].glowColor}22`,
                          color: RARITY_CONFIG[gekioshiCard.rarity].glowColor,
                        }}
                      >
                        {RARITY_CONFIG[gekioshiCard.rarity].label}
                      </span>

                      <p className="mt-1.5 text-[18px] font-bold text-gray-900 leading-tight">
                        {gekioshiCard.memberName}
                      </p>
                      <p className="mt-0.5 text-[12px] text-gray-500">
                        {gekioshiCard.title}
                      </p>
                      <p className="mt-1 text-[12px]" style={{ color: RARITY_CONFIG[gekioshiCard.rarity].color }}>
                        {"★".repeat(RARITY_CONFIG[gekioshiCard.rarity].stars)}
                      </p>

                      {/* Obtained date */}
                      <p className="mt-2 text-[10px] text-gray-400">
                        {new Date(gekioshiCard.obtainedAt).toLocaleDateString("ja-JP")} に取得
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        )}

        <FeaturedBanner />
        <GroupCarousel />
        <CollectionProgress />
        {/* History link */}
        <div className="px-4 mt-2 mb-4">
          <Link href="/history">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 transition-colors active:bg-gray-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-400/10">
                <Clock className="h-4 w-4 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-gray-900">ヒストリー</p>
                <p className="text-[11px] text-gray-400">カード取得履歴を見る</p>
              </div>
              <span className="text-[12px] text-gray-300">→</span>
            </div>
          </Link>
        </div>

        <ActivityFeed />
      </motion.div>
    </AppShell>
  );
}
