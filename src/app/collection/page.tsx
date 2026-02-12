"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardTheme } from "@/types";
import {
  getCards,
  getUser,
  hasCompletedOnboarding,
  getCoins,
  hasReceivedFreeCard,
  getEarnedBadges,
} from "@/lib/store";
import { getAllBadges } from "@/lib/badges-data";
import { CARD_THEMES, DEMO_CARDS, getCardsByTheme } from "@/lib/cards-data";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { CardGrid } from "@/components/card/CardGrid";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { BookOpen, Trophy, Gift, ChevronRight, Award } from "lucide-react";

export default function CollectionPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [coins, setCoins] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showZukan, setShowZukan] = useState(false);
  const [earnedBadgeCount, setEarnedBadgeCount] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    if (!hasReceivedFreeCard()) {
      router.replace("/gift");
      return;
    }

    setCards(getCards());
    setCoins(getCoins());
    setEarnedBadgeCount(getEarnedBadges().length);
    setShowOnboarding(!hasCompletedOnboarding());
    setMounted(true);
  }, [router]);

  useEffect(() => {
    const handleFocus = () => {
      setCards(getCards());
      setCoins(getCoins());
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    if (mounted) {
      const interval = setInterval(() => {
        setCards(getCards());
        setCoins(getCoins());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  const totalCards = DEMO_CARDS.length;
  const ownedCount = cards.length;
  const remaining = totalCards - ownedCount;
  const isComplete = ownedCount === totalCards && totalCards > 0;

  const zukanToggleButton = (
    <button
      onClick={() => setShowZukan((prev) => !prev)}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
        showZukan
          ? "bg-primary-200/30 text-primary-500"
          : "text-gray-500 active:bg-black/5"
      }`}
      aria-label="図鑑モード切替"
    >
      <BookOpen className="h-5 w-5" />
    </button>
  );

  return (
    <AppShell>
      <Header title="コレクション" coins={coins} rightAction={zukanToggleButton} />

      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Overall Progress Section */}
      <motion.div
        className="px-4 pt-5 pb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  isComplete
                    ? "bg-matcha-400/15 text-matcha-500"
                    : "bg-primary-200/30 text-primary-500"
                }`}
              >
                <Trophy className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">
                  コレクション
                </h2>
                <p className="text-[12px] text-gray-400">
                  {totalCards}枚中{" "}
                  <span className="font-semibold text-gray-600">
                    {ownedCount}枚
                  </span>{" "}
                  取得済み
                </p>
              </div>
            </div>
          </div>

          <ProgressBar current={ownedCount} total={totalCards} />

          <p className="mt-2.5 text-[12px]">
            {isComplete ? (
              <span className="font-bold text-matcha-500">
                すべてのカードをコンプリートしました！
              </span>
            ) : (
              <span className="text-gray-400">
                あと
                <span className="font-semibold text-primary-500">
                  {remaining}枚
                </span>
                でコンプリート！
              </span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Badge Summary Bar */}
      <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
        <Award className="h-4 w-4 text-gold-300" />
        <span className="text-[13px] font-medium text-gray-700">
          獲得バッジ: {earnedBadgeCount}/{getAllBadges().length}
        </span>
      </div>

      {/* Empty State: no cards at all and not in zukan mode */}
      {ownedCount === 0 && !showZukan ? (
        <motion.div
          className="flex flex-col items-center justify-center px-4 py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg shadow-black/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <Gift className="h-11 w-11 text-gray-400" />
          </motion.div>
          <h3 className="mb-2 text-[17px] font-bold text-gray-700">
            まだカードがありません
          </h3>
          <p className="mb-8 text-center text-[14px] leading-relaxed text-gray-400">
            ショップでカードを購入しましょう！
          </p>
          <Link
            href="/shop"
            className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all active:scale-[0.97]"
          >
            ショップへ行く
          </Link>
        </motion.div>
      ) : (
        /* Theme Sections */
        <div className="px-4 pb-6">
          {CARD_THEMES.map((theme, themeIndex) => (
            <ThemeSection
              key={theme.id}
              theme={theme}
              ownedCards={cards}
              showZukan={showZukan}
              index={themeIndex}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ThemeSection({
  theme,
  ownedCards,
  showZukan,
  index,
}: {
  theme: CardTheme;
  ownedCards: Card[];
  showZukan: boolean;
  index: number;
}) {
  const themeCards = getCardsByTheme(theme.id);
  const ownedCardsForTheme = ownedCards.filter((c) => c.themeId === theme.id);
  const ownedCount = ownedCardsForTheme.length;
  const totalCount = themeCards.length;

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.15 + index * 0.12,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {/* Theme Header */}
      <div
        className="mb-3 rounded-xl border border-gray-200 bg-white p-3"
        style={{ borderLeftWidth: 3, borderLeftColor: theme.accentColor }}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: theme.accentColor }}
            />
            <span className="text-[15px] font-bold text-gray-900">
              {theme.name}
            </span>
          </div>
          <span className="text-[12px] text-gray-400">
            {ownedCount}/{totalCount}
          </span>
        </div>
        <ProgressBar current={ownedCount} total={totalCount} />
      </div>

      {/* Theme Card Grid */}
      {!showZukan && ownedCardsForTheme.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-10">
          <p className="mb-2 text-[13px] text-gray-400">
            まだカードがありません
          </p>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-[12px] font-medium text-primary-500 transition-colors hover:text-primary-400"
          >
            ショップへ
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <CardGrid
          cards={ownedCardsForTheme}
          allCards={getCardsByTheme(theme.id)}
          showZukan={showZukan}
        />
      )}
    </motion.div>
  );
}
