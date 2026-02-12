"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Coins,
  ShoppingBag,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  LayoutGrid,
} from "lucide-react";
import { Card, CardTheme, RARITY_CONFIG, RARITY_PRICE } from "@/types";
import { getCoins, deductCoins, addCard, getCards, getUser } from "@/lib/store";
import { CARD_THEMES, getCardsByTheme } from "@/lib/cards-data";
import { CardFlip } from "@/components/card/CardFlip";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
type ShopView = "themes" | "cards";
type ShopState = "browsing" | "confirming" | "revealing" | "complete";

export default function ShopPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [coins, setCoinsState] = useState(0);
  const [ownedCardIds, setOwnedCardIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ShopView>("themes");
  const [shopState, setShopState] = useState<ShopState>("browsing");
  const [selectedTheme, setSelectedTheme] = useState<CardTheme | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [error, setError] = useState("");

  const refreshState = useCallback(() => {
    setCoinsState(getCoins());
    const cards = getCards();
    setOwnedCardIds(new Set(cards.map((c) => c.id)));
  }, []);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    refreshState();
    setMounted(true);
  }, [router, refreshState]);

  // Re-sync when the tab regains focus
  useEffect(() => {
    const handleFocus = () => refreshState();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshState]);

  const handleThemeTap = (theme: CardTheme) => {
    setSelectedTheme(theme);
    setView("cards");
  };

  const handleBackToThemes = () => {
    setView("themes");
    setSelectedTheme(null);
  };

  const handleCardTap = (card: Card) => {
    if (ownedCardIds.has(card.id)) return;
    setSelectedCard(card);
    setError("");
    setShopState("confirming");
  };

  const handlePurchase = () => {
    if (!selectedCard) return;

    const price = RARITY_PRICE[selectedCard.rarity];
    const success = deductCoins(price);

    if (!success) {
      setError("コインが足りません");
      return;
    }

    addCard(selectedCard);
    setShopState("revealing");
  };

  const handleCancel = () => {
    setSelectedCard(null);
    setError("");
    setShopState("browsing");
  };

  const handleRevealComplete = () => {
    setShopState("complete");
  };

  const handleBackToShop = () => {
    setSelectedCard(null);
    setError("");
    refreshState();
    setShopState("browsing");
  };

  /** Compute owned count for a given theme */
  const getThemeProgress = (themeId: string) => {
    const themeCards = getCardsByTheme(themeId);
    const owned = themeCards.filter((c) => ownedCardIds.has(c.id)).length;
    return { owned, total: themeCards.length };
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  return (
    <AppShell>
      {/* ========== Theme List View ========== */}
      {view === "themes" && (
        <>
          <Header title="ショップ" coins={coins} />

          {/* Coin Balance Bar */}
          <motion.div
            className="px-4 pt-4 pb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-gold-400/20 bg-gradient-to-r from-gold-400/10 to-gold-400/5 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/15">
                <Coins className="h-5 w-5 text-gold-400" />
              </div>
              <div>
                <p className="text-[12px] text-gray-400">所持コイン</p>
                <p className="text-[18px] font-bold text-gold-400">
                  {coins.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Theme Cards */}
          <div className="flex flex-col gap-4 px-4 pt-3 pb-6">
            {CARD_THEMES.map((theme, index) => {
              const { owned, total } = getThemeProgress(theme.id);

              return (
                <motion.button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeTap(theme)}
                  className="relative h-44 w-full overflow-hidden rounded-2xl border border-gray-200 text-left"
                  style={{
                    boxShadow: `0 0 24px ${theme.accentColor}15, 0 0 48px ${theme.accentColor}08`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Background Image */}
                  <Image
                    src={theme.coverImageUrl}
                    alt={theme.name}
                    fill
                    className="object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

                  {/* Content */}
                  <div className="relative z-10 flex h-full flex-col justify-between p-5">
                    {/* Top: Accent dot */}
                    <div
                      className="h-2 w-8 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />

                    {/* Middle: Name & description */}
                    <div>
                      <h3 className="text-[20px] font-bold text-white">
                        {theme.name}
                      </h3>
                      <p className="mt-0.5 text-[13px] text-gray-200">
                        {theme.description}
                      </p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-black/10 px-3 py-1 text-[12px] text-white/80">
                        {owned}/{total} 取得済み
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-white/60">
                        <LayoutGrid className="h-3.5 w-3.5" />
                        {total}枚
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </>
      )}

      {/* ========== Card List View ========== */}
      {view === "cards" && selectedTheme && (
        <>
          <Header title={selectedTheme.name} coins={coins} />

          {/* Back button */}
          <button
            onClick={handleBackToThemes}
            className="flex items-center gap-1 px-4 pt-3 text-[13px] text-gray-500"
          >
            <ChevronLeft className="h-4 w-4" />
            テーマ一覧に戻る
          </button>

          {/* Theme info banner */}
          <div className="px-4 pt-3">
            <div
              className="rounded-xl border-l-4 bg-white px-4 py-3"
              style={{ borderLeftColor: selectedTheme.accentColor }}
            >
              <p className="text-[13px] text-gray-600">
                {selectedTheme.description}
              </p>
              {(() => {
                const { owned, total } = getThemeProgress(selectedTheme.id);
                const pct = total > 0 ? (owned / total) * 100 : 0;
                return (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[12px] text-gray-500">
                      {owned}/{total}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: selectedTheme.accentColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-2 gap-3 px-4 pt-4 pb-6">
            {getCardsByTheme(selectedTheme.id).map((card, index) => {
              const config = RARITY_CONFIG[card.rarity];
              const price = RARITY_PRICE[card.rarity];
              const owned = ownedCardIds.has(card.id);
              const canAfford = coins >= price;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleCardTap(card)}
                    disabled={owned}
                    className={`group relative w-full text-left transition-all active:scale-[0.97] ${
                      owned ? "opacity-60" : ""
                    }`}
                  >
                    {/* Card Image */}
                    <div
                      className="relative aspect-[5/7] overflow-hidden rounded-xl border-2"
                      style={{ borderColor: config.glowColor }}
                    >
                      <Image
                        src={card.imageUrl}
                        alt={card.title}
                        fill
                        className="object-cover"
                      />

                      {/* Bottom gradient overlay */}
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2.5 pb-2.5 pt-10">
                        {/* Rarity badge */}
                        <span
                          className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase leading-tight ${config.textColor} bg-gradient-to-r ${config.bgGradient} ${
                            card.rarity === "legendary"
                              ? "badge-legendary"
                              : ""
                          }`}
                        >
                          {config.label}
                        </span>
                        {/* Card title */}
                        <p className="truncate text-[15px] font-semibold leading-tight text-white">
                          {card.title}
                        </p>
                      </div>

                      {/* Series number badge */}
                      <div className="absolute right-1.5 top-1.5 z-10">
                        <span className="rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white/70 backdrop-blur-sm">
                          #{card.cardNumber}/{card.totalInSeries}
                        </span>
                      </div>

                      {/* Owned overlay */}
                      {owned && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-matcha-400/20">
                              <Check className="h-5 w-5 text-matcha-300" />
                            </div>
                            <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-matcha-300 backdrop-blur-sm">
                              取得済み
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price display */}
                    {!owned && (
                      <div className="mt-2 flex items-center justify-center gap-1.5">
                        <Coins
                          className={`h-3.5 w-3.5 ${
                            canAfford ? "text-gold-400" : "text-rose-400"
                          }`}
                        />
                        <span
                          className={`text-[13px] font-bold ${
                            canAfford ? "text-gold-400" : "text-rose-400"
                          }`}
                        >
                          {price.toLocaleString()} コイン
                        </span>
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* ========== Purchase Flow Overlays ========== */}
      <AnimatePresence mode="wait">
        {/* Confirming Modal */}
        {shopState === "confirming" && selectedCard && (
          <motion.div
            key="confirming"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Top accent bar */}
              <div
                className="h-1"
                style={{
                  background: RARITY_CONFIG[selectedCard.rarity].glowColor,
                }}
              />

              <div className="p-6">
                {/* Card preview */}
                <div className="mb-5 flex justify-center">
                  <div
                    className="relative aspect-[5/7] w-36 overflow-hidden rounded-xl border-2"
                    style={{
                      borderColor:
                        RARITY_CONFIG[selectedCard.rarity].glowColor,
                    }}
                  >
                    <Image
                      src={selectedCard.imageUrl}
                      alt={selectedCard.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Rarity badge */}
                <div className="mb-3 flex justify-center">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase ${RARITY_CONFIG[selectedCard.rarity].textColor} bg-gradient-to-r ${RARITY_CONFIG[selectedCard.rarity].bgGradient}`}
                  >
                    {RARITY_CONFIG[selectedCard.rarity].label}
                  </span>
                </div>

                {/* Confirmation text */}
                <div className="mb-5 text-center">
                  <h2 className="mb-2 text-[18px] font-bold text-gray-900">
                    「{selectedCard.title}」を購入しますか？
                  </h2>
                  <div className="flex items-center justify-center gap-1.5">
                    <Coins className="h-4 w-4 text-gold-400" />
                    <span className="text-[16px] font-bold text-gold-400">
                      {RARITY_PRICE[selectedCard.rarity].toLocaleString()}{" "}
                      コイン
                    </span>
                  </div>
                </div>

                {/* Remaining balance */}
                <div className="mb-5 rounded-xl bg-gray-100 px-4 py-3 text-center">
                  <p className="text-[13px] text-gray-500">
                    購入後の残高:{" "}
                    <span className="font-bold text-gold-400">
                      {(
                        coins - RARITY_PRICE[selectedCard.rarity]
                      ).toLocaleString()}
                      コイン
                    </span>
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    className="mb-4 flex items-center gap-2.5 rounded-xl bg-red-500/8 p-3.5 text-[13px] leading-relaxed text-red-400"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handlePurchase}
                    disabled={coins < RARITY_PRICE[selectedCard.rarity]}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    購入する
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded-2xl border border-gray-200 bg-gray-50 py-3.5 text-[14px] font-medium text-gray-600 transition-all active:scale-[0.98] active:bg-gray-100"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Revealing State */}
        {shopState === "revealing" && selectedCard && (
          <motion.div
            key="revealing"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CardFlip
              card={selectedCard}
              onComplete={handleRevealComplete}
              isFirstTime={true}
            />
          </motion.div>
        )}

        {/* Complete State */}
        {shopState === "complete" && selectedCard && (
          <motion.div
            key="complete"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex w-full max-w-sm flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div
                className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-matcha-400/20 to-matcha-300/10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
              >
                <Sparkles className="h-10 w-10 text-matcha-500" />
              </motion.div>

              <h2 className="mb-2 text-[22px] font-bold text-white">
                おめでとうございます！
              </h2>
              <p className="mb-2 text-[15px] font-semibold text-white">
                「{selectedCard.title}」
              </p>
              <p className="mb-8 text-[14px] text-gray-300">
                コレクションに追加されました
              </p>

              <div className="flex w-full flex-col gap-3">
                <button
                  onClick={() => router.push(`/card/${selectedCard.id}`)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all active:scale-[0.98]"
                >
                  カードを見る
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleBackToShop}
                  className="rounded-2xl border border-gray-200/40 bg-white/10 py-3.5 text-[14px] font-medium text-gray-200 transition-all active:scale-[0.98] active:bg-white/20"
                >
                  ショップに戻る
                </button>
                <button
                  onClick={() => router.push("/collection")}
                  className="py-2 text-[13px] text-gray-400 transition-colors active:text-gray-200"
                >
                  コレクションへ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
