"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Clock, Heart, Sparkles, Star, ChevronRight, LayoutGrid } from "lucide-react";
import { MEMBERS, GROUPS } from "@/lib/groups-data";
import { ALL_CARDS, getCardsByGroup } from "@/lib/cards-data";
import { RARITY_CONFIG } from "@/types";
import type { User, OwnedCard } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { FeaturedBanner } from "@/components/home/FeaturedBanner";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { getUser, getCoins, getCards, getGekioshiCardId, canDoFreeGacha, canClaimDailyBonus } from "@/lib/store";
import { OnboardingOverlay } from "@/components/home/OnboardingOverlay";
import { FirstGachaBanner, FreeGachaBadge } from "@/components/home/GachaPromoBanner";
import { DailyBonusModal } from "@/components/home/DailyBonusModal";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [coins, setCoins] = useState(0);
  const [user, setUserState] = useState<User | null>(null);
  const [gekioshiCard, setGekioshiCard] = useState<OwnedCard | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [freeGachaAvailable, setFreeGachaAvailable] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/");
      return;
    }
    setUserState(u);
    setCoins(getCoins());
    setFreeGachaAvailable(canDoFreeGacha());
    setReady(true);

    // Show onboarding if first time
    if (!localStorage.getItem("starto_onboarding_done")) {
      setShowOnboarding(true);
    } else if (canClaimDailyBonus()) {
      // Show daily bonus after onboarding is done
      setShowDailyBonus(true);
    }

    const gekioshiId = getGekioshiCardId();
    if (gekioshiId) {
      const owned = getCards();
      const gCard = owned.find(c => c.id === gekioshiId);
      if (gCard) setGekioshiCard(gCard);
    }
  }, [router]);

  const ownedCards = ready ? getCards() : [];
  const daysSinceRegistration = user
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const tanmouMember = user?.tanmouMemberId
    ? MEMBERS.find(m => m.id === user.tanmouMemberId) ?? null
    : null;
  const tanmouCards = user?.tanmouMemberId
    ? ALL_CARDS.filter(c => c.memberId === user.tanmouMemberId)
    : [];
  const ownedTanmouCards = tanmouCards.filter(c =>
    ownedCards.some(oc => oc.id === c.id)
  );

  // 4-3: ログイン日数ベースのstats（登録日からの日数 → そのまま利用、ラベルを変更）
  const statsRow = user && (
    <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
      <div className="flex flex-col items-center py-3">
        <span className="text-[10px] text-gray-400">ログイン</span>
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
        <span className="text-[10px] text-gray-400">コンプ率</span>
        <span className="text-[18px] font-bold text-gray-900">
          {ALL_CARDS.length > 0 ? Math.round((ownedCards.length / ALL_CARDS.length) * 100) : 0}
        </span>
        <span className="text-[10px] text-gray-400">%</span>
      </div>
    </div>
  );

  // 4-1: コレクション進捗をコンパクトなインラインに
  const compactCollectionProgress = (
    <div className="px-4 mt-4 mb-2">
      <Link href="/collection">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors active:bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary-500" />
              <span className="text-[14px] font-bold text-gray-900">コレクション</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <span className="text-[12px]">詳細</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {GROUPS.map((group) => {
              const total = getCardsByGroup(group.id).length;
              const owned = ownedCards.filter(c => c.groupId === group.id).length;
              const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
              return (
                <div key={group.id} className="flex-shrink-0 flex flex-col items-center gap-1 w-14">
                  <div className="relative h-10 w-10">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                      <circle
                        cx="20" cy="20" r="16" fill="none"
                        stroke={group.accentColor} strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 16}`}
                        strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-gray-600">{pct}%</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 truncate w-full text-center">{group.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Link>
    </div>
  );

  if (!ready) return null;

  return (
    <AppShell>
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingOverlay onClose={() => {
            setShowOnboarding(false);
            if (canClaimDailyBonus()) setShowDailyBonus(true);
          }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDailyBonus && !showOnboarding && (
          <DailyBonusModal
            onClose={() => setShowDailyBonus(false)}
            onClaimed={() => setCoins(getCoins())}
          />
        )}
      </AnimatePresence>
      {/* 4-2: コイン残高をHeaderに常に表示 */}
      <Header title="ホーム" coins={coins} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        {/* === Priority 1: CTA for new users === */}
        {ownedCards.length <= 1 && <FirstGachaBanner />}
        {freeGachaAvailable && ownedCards.length > 1 && <FreeGachaBadge />}

        {/* === Priority 2: Gekioshi Card Showcase + Stats === */}
        {gekioshiCard && (
          <div className="px-4 mb-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                <span className="text-[14px] font-bold text-gray-900">激推しカード</span>
              </div>

              <div className="relative rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <Link href={`/card/${gekioshiCard.id}`}>
                  <div className="p-3 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-50">
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
                        <div className="card-holo-overlay" style={{ opacity: 0.35 }} />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            boxShadow: `inset 0 0 30px ${RARITY_CONFIG[gekioshiCard.rarity].glowColor}30`,
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
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
                          {/* 4-4: レアリティ表記を★に統一 */}
                          <p className="mt-1.5 text-[13px]" style={{ color: RARITY_CONFIG[gekioshiCard.rarity].color }}>
                            {"★".repeat(RARITY_CONFIG[gekioshiCard.rarity].stars)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-1.5 left-1.5 h-4 w-4 border-t-2 border-l-2 border-amber-400/60 rounded-tl-lg" />
                    <div className="absolute top-1.5 right-1.5 h-4 w-4 border-t-2 border-r-2 border-amber-400/60 rounded-tr-lg" />
                    <div className="absolute bottom-1.5 left-1.5 h-4 w-4 border-b-2 border-l-2 border-amber-400/60 rounded-bl-lg" />
                    <div className="absolute bottom-1.5 right-1.5 h-4 w-4 border-b-2 border-r-2 border-amber-400/60 rounded-br-lg" />
                  </div>
                </Link>
                {statsRow}
              </div>
            </motion.div>
          </div>
        )}

        {/* === Priority 3: Tanmou / User Status (compact when gekioshi exists) === */}
        {user && !gekioshiCard && (
          <div className="px-4 mb-5">
            <motion.div
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {tanmouMember && (
                <div className="relative h-44 overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${tanmouMember.color}30 0%, ${tanmouMember.color}60 100%)`,
                    }}
                  />
                  {tanmouMember.image && (
                    <Image
                      src={`/members/${tanmouMember.image}`}
                      alt={tanmouMember.name}
                      fill
                      className="object-cover object-top opacity-40"
                      sizes="448px"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-end gap-3">
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
                          カード {ownedTanmouCards.length}/{tanmouCards.length}枚
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              {statsRow}
            </motion.div>
          </div>
        )}

        {/* Tanmou compact row when gekioshi exists */}
        {user && gekioshiCard && tanmouMember && (
          <div className="px-4 mb-4">
            <Link href="/settings">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors active:bg-gray-50">
                <div
                  className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2"
                  style={{ borderColor: tanmouMember.color }}
                >
                  {tanmouMember.image ? (
                    <Image
                      src={`/members/${tanmouMember.image}`}
                      alt={tanmouMember.name}
                      fill
                      className="object-cover object-top"
                      sizes="40px"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[14px] font-bold text-white"
                      style={{ backgroundColor: tanmouMember.color }}
                    >
                      {tanmouMember.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-primary-500" fill="currentColor" />
                    <span className="text-[12px] font-bold text-gray-900 truncate">{tanmouMember.name}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    カード {ownedTanmouCards.length}/{tanmouCards.length}枚
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </Link>
          </div>
        )}

        {/* === Priority 4: Featured Banner (pickup) === */}
        <FeaturedBanner />

        {/* === Priority 5: Compact Collection + Quick Links === */}
        {compactCollectionProgress}

        {/* Quick links row: History + Activity */}
        <div className="px-4 mt-2 mb-4 flex gap-3">
          <Link href="/history" className="flex-1">
            <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3 py-3 transition-colors active:bg-gray-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-400/10">
                <Clock className="h-3.5 w-3.5 text-primary-400" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">ヒストリー</p>
                <p className="text-[10px] text-gray-400">取得履歴</p>
              </div>
            </div>
          </Link>
          <Link href="/activity" className="flex-1">
            <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3 py-3 transition-colors active:bg-gray-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/10">
                <Star className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">ランキング</p>
                <p className="text-[10px] text-gray-400">同担の活動</p>
              </div>
            </div>
          </Link>
        </div>

        {/* === Priority 6: Activity Feed (lower priority, collapsed-style) === */}
        <ActivityFeed tanmouMemberId={user?.tanmouMemberId ?? null} />
      </motion.div>
    </AppShell>
  );
}
