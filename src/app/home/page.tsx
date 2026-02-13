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
        {/* Gekioshi Card Showcase - Hero Display */}
        {gekioshiCard && (
          <div className="px-4 mb-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              {/* Section label */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                <span className="text-[14px] font-bold text-gray-900">激推しカード</span>
              </div>

              <Link href={`/card/${gekioshiCard.id}`}>
                <div className="relative rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">

                  {/* Luxurious frame - ornamental border pattern */}
                  <div className="p-3 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-50">

                    {/* Inner golden frame border */}
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        boxShadow: `
                          inset 0 0 0 2px #D4A849,
                          inset 0 0 0 4px #F5E6B8,
                          inset 0 0 0 5px #D4A849,
                          0 4px 16px rgba(212, 168, 73, 0.15)
                        `,
                      }}
                    >
                      {/* Card image - large, hero-sized */}
                      <div
                        className="relative aspect-[5/7] w-full overflow-hidden"
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
                            sizes="400px"
                            priority
                          />
                        )}
                        {/* Holo overlay */}
                        <div className="card-holo-overlay" style={{ opacity: 0.35 }} />

                        {/* Rarity glow effect */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            boxShadow: `inset 0 0 30px ${RARITY_CONFIG[gekioshiCard.rarity].glowColor}30`,
                          }}
                        />

                        {/* Bottom gradient with card info */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
                          {/* Gekioshi badge */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
                            <span className="text-[11px] font-bold text-amber-400 tracking-wide">激推し</span>
                          </div>

                          <p className="text-[24px] font-bold leading-tight text-white drop-shadow-lg">
                            {gekioshiCard.memberName}
                          </p>
                          <p className="mt-1 text-[13px] text-white/70 drop-shadow">
                            {gekioshiCard.title}
                          </p>
                          <div className="mt-1.5 flex items-center gap-3">
                            <p className="text-[13px]" style={{ color: RARITY_CONFIG[gekioshiCard.rarity].color }}>
                              {"★".repeat(RARITY_CONFIG[gekioshiCard.rarity].stars)}
                            </p>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                              style={{
                                backgroundColor: `${RARITY_CONFIG[gekioshiCard.rarity].glowColor}33`,
                                color: RARITY_CONFIG[gekioshiCard.rarity].color,
                              }}
                            >
                              {RARITY_CONFIG[gekioshiCard.rarity].label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Frame corner decorations */}
                    <div className="absolute top-1.5 left-1.5 h-4 w-4 border-t-2 border-l-2 border-amber-400/60 rounded-tl-lg" />
                    <div className="absolute top-1.5 right-1.5 h-4 w-4 border-t-2 border-r-2 border-amber-400/60 rounded-tr-lg" />
                    <div className="absolute bottom-1.5 left-1.5 h-4 w-4 border-b-2 border-l-2 border-amber-400/60 rounded-bl-lg" />
                    <div className="absolute bottom-1.5 right-1.5 h-4 w-4 border-b-2 border-r-2 border-amber-400/60 rounded-br-lg" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        )}

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
