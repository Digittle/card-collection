"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/types";
import {
  getCards,
  getUser,
  hasCompletedOnboarding,
  getCoins,
  hasReceivedFreeCard,
} from "@/lib/store";
import { DEMO_CARDS, getFeaturedCards } from "@/lib/cards-data";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { HeroCarousel } from "@/components/discover/HeroCarousel";
import { CardCarousel } from "@/components/discover/CardCarousel";
import { CardCarouselTile } from "@/components/discover/CardCarouselTile";
import { ThemeBrowser } from "@/components/discover/ThemeBrowser";
import { ActivitySummary } from "@/components/discover/ActivitySummary";
import { ActivityToast } from "@/components/community/ActivityToast";
import { Gift } from "lucide-react";

export default function CollectionPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    setShowOnboarding(!hasCompletedOnboarding());
    setMounted(true);
  }, [router]);

  useEffect(() => {
    const handleFocus = () => setCards(getCards());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  const featuredCards = getFeaturedCards().slice(0, 4);
  const trendingCards = DEMO_CARDS.filter(
    (c) => !cards.some((owned) => owned.id === c.id)
  ).slice(0, 6);

  return (
    <AppShell>
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Hero Carousel */}
      <HeroCarousel cards={featuredCards} />

      {/* Your Collection */}
      {cards.length > 0 ? (
        <CardCarousel title="あなたのコレクション">
          {cards.map((card, i) => (
            <CardCarouselTile key={card.id} card={card} index={i} />
          ))}
        </CardCarousel>
      ) : (
        <section className="mt-6 px-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-2xl border border-white/8 bg-white/[0.03] py-12"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Gift className="h-7 w-7 text-white/30" />
            </div>
            <p className="mb-1 text-[15px] font-bold text-white/60">
              まだカードがありません
            </p>
            <p className="mb-5 text-[13px] text-white/30">
              ショップでカードを購入しましょう
            </p>
            <Link
              href="/shop"
              className="rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
            >
              ショップへ行く
            </Link>
          </motion.div>
        </section>
      )}

      {/* Trending Cards */}
      {trendingCards.length > 0 && (
        <CardCarousel title="注目のカード" seeAllHref="/shop">
          {trendingCards.map((card, i) => (
            <CardCarouselTile
              key={card.id}
              card={card}
              index={i}
              metric={`${Math.floor(Math.random() * 2000 + 500).toLocaleString()}人`}
              href="/shop"
            />
          ))}
        </CardCarousel>
      )}

      {/* Browse by Theme */}
      <ThemeBrowser />

      {/* Community Activity */}
      <ActivitySummary />

      {/* Activity Toast */}
      <ActivityToast />
    </AppShell>
  );
}
