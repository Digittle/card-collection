"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Gift, Sparkles, ArrowRight, ChevronLeft } from "lucide-react";
import { Card, RARITY_CONFIG, RARITY_PRICE } from "@/types";
import {
  addCard,
  hasReceivedFreeCard,
  setFreeCardReceived,
  getUser,
} from "@/lib/store";
import { CARD_THEMES, getCardsByTheme } from "@/lib/cards-data";
import { CardFlip } from "@/components/card/CardFlip";
import { evaluateBadges } from "@/lib/badge-engine";

type GiftState = "selection" | "confirming" | "revealing" | "complete";

export default function GiftPage() {
  const router = useRouter();
  const [state, setState] = useState<GiftState>("selection");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    if (hasReceivedFreeCard()) {
      router.replace("/collection");
      return;
    }
    setMounted(true);
  }, [router]);

  const handleCardSelect = useCallback((card: Card) => {
    setSelectedCard((prev) => (prev?.id === card.id ? null : card));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedCard) return;
    setState("confirming");
  }, [selectedCard]);

  const handleReceive = useCallback(() => {
    setState("revealing");
  }, []);

  const handleRevealComplete = useCallback(() => {
    if (selectedCard) {
      setFreeCardReceived();
      addCard(selectedCard);
      evaluateBadges();
      setState("complete");
    }
  }, [selectedCard]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  return (
    <div className="relative min-h-screen bg-[#F4F5F6]">
      {/* Ambient glow background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary-400/6 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-60 w-60 rounded-full bg-gold-300/4 blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 h-60 w-60 rounded-full bg-matcha-300/4 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md">
        <AnimatePresence mode="wait">
          {/* ======================== */}
          {/* Selection State          */}
          {/* ======================== */}
          {state === "selection" && (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex min-h-screen flex-col"
            >
              {/* Header area */}
              <div className="px-4 pt-12 pb-4 text-center">
                <motion.div
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200/40 to-gold-300/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200, damping: 15 }}
                >
                  <Gift className="h-10 w-10 text-primary-500" />
                </motion.div>
                <motion.h1
                  className="mb-2 text-[22px] font-bold text-gray-900"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  ウェルカムギフト
                </motion.h1>
                <motion.p
                  className="text-[14px] leading-relaxed text-gray-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  最初の1枚を選びましょう！
                  <br />
                  お好きなカードを1枚無料でプレゼント
                </motion.p>
              </div>

              {/* Card grid */}
              <div className="flex-1 px-4 pb-28">
                <div className="space-y-6">
                  {CARD_THEMES.map((theme, themeIndex) => {
                    const themeCards = getCardsByTheme(theme.id);
                    return (
                      <div key={theme.id}>
                        {/* Theme header */}
                        <div className="mb-3 flex items-center gap-2.5">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <div>
                            <h3 className="text-[14px] font-bold text-gray-900">{theme.name}</h3>
                            <p className="text-[11px] text-gray-400">{theme.description}</p>
                          </div>
                        </div>
                        {/* Cards in this theme */}
                        <div className="grid grid-cols-2 gap-3">
                          {themeCards.map((card, index) => {
                            const config = RARITY_CONFIG[card.rarity];
                            const isSelected = selectedCard?.id === card.id;
                            const originalPrice = RARITY_PRICE[card.rarity];
                            const globalIndex = themeIndex * 4 + index;

                            return (
                              <motion.button
                                key={card.id}
                                onClick={() => handleCardSelect(card)}
                                className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                                  isSelected
                                    ? "ring-2 ring-primary-400 ring-offset-2 ring-offset-[#F4F5F6]"
                                    : "ring-0"
                                }`}
                                style={{
                                  borderColor: isSelected
                                    ? "var(--color-primary-400)"
                                    : config.glowColor + "60",
                                  boxShadow: isSelected
                                    ? `0 0 20px var(--color-primary-400, rgba(59,130,246,0.3)), 0 0 40px ${config.glowColor}30`
                                    : "none",
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  scale: isSelected ? 1.02 : 1,
                                }}
                                transition={{
                                  opacity: { delay: 0.1 + globalIndex * 0.05 },
                                  y: { delay: 0.1 + globalIndex * 0.05 },
                                  scale: { type: "spring", stiffness: 300, damping: 20 },
                                }}
                                whileTap={{ scale: 0.97 }}
                              >
                                {/* Card image */}
                                <div className="relative aspect-[5/7] w-full overflow-hidden bg-gray-100">
                                  <Image
                                    src={card.imageUrl}
                                    alt={card.title}
                                    fill
                                    className="object-cover"
                                  />
                                  {/* Rarity badge */}
                                  <div className="absolute top-2 left-2">
                                    <span
                                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${config.textColor} bg-gradient-to-r ${config.bgGradient}`}
                                    >
                                      {config.label}
                                    </span>
                                  </div>
                                  {/* Selected checkmark overlay */}
                                  {isSelected && (
                                    <motion.div
                                      className="absolute inset-0 flex items-center justify-center bg-primary-200/20"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                    >
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 shadow-lg shadow-primary-400/20">
                                        <Sparkles className="h-5 w-5 text-white" />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>

                                {/* Card info */}
                                <div className="bg-white/90 px-3 py-2.5">
                                  <p className="truncate text-[13px] font-bold text-gray-900">
                                    {card.title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-[13px] font-bold text-matcha-300">
                                      無料
                                    </span>
                                    <span className="text-[11px] text-gray-400 line-through">
                                      ¥{originalPrice.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fixed bottom CTA */}
              <div className="fixed bottom-0 left-0 right-0 z-20">
                <div className="mx-auto max-w-md">
                  <div className="bg-gradient-to-t from-[#F4F5F6] via-[#F4F5F6]/95 to-[#F4F5F6]/0 px-4 pt-6 pb-8">
                    <motion.button
                      onClick={handleConfirm}
                      disabled={!selectedCard}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-4 text-[15px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all disabled:opacity-40 disabled:shadow-none"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.5,
                      }}
                      whileTap={selectedCard ? { scale: 0.98 } : undefined}
                    >
                      <Gift className="h-5 w-5" />
                      このカードを受け取る
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================== */}
          {/* Confirming State         */}
          {/* ======================== */}
          {state === "confirming" && selectedCard && (
            <motion.div
              key="confirming"
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setState("selection")}
              />

              {/* Dialog */}
              <motion.div
                className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Card preview */}
                <div className="relative aspect-[5/4] w-full overflow-hidden">
                  <Image
                    src={selectedCard.imageUrl}
                    alt={selectedCard.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span
                      className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${RARITY_CONFIG[selectedCard.rarity].textColor} bg-gradient-to-r ${RARITY_CONFIG[selectedCard.rarity].bgGradient}`}
                    >
                      {RARITY_CONFIG[selectedCard.rarity].label}
                    </span>
                    <p className="text-[16px] font-bold text-gray-900">
                      {selectedCard.title}
                    </p>
                  </div>
                </div>

                <div className="px-5 pt-4 pb-5">
                  <p className="mb-5 text-center text-[14px] leading-relaxed text-gray-600">
                    「{selectedCard.title}」を
                    <br />
                    受け取りますか？
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <motion.button
                      onClick={handleReceive}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-primary-400/15"
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.15,
                      }}
                    >
                      <Gift className="h-4 w-4" />
                      受け取る
                    </motion.button>
                    <motion.button
                      onClick={() => setState("selection")}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 py-3.5 text-[14px] font-medium text-gray-600 transition-all active:bg-gray-100"
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.25,
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      戻る
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ======================== */}
          {/* Revealing State          */}
          {/* ======================== */}
          {state === "revealing" && selectedCard && (
            <motion.div
              key="revealing"
              className="flex min-h-screen flex-col items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardFlip
                card={selectedCard}
                onComplete={handleRevealComplete}
                isFirstTime={true}
              />
            </motion.div>
          )}

          {/* ======================== */}
          {/* Complete State           */}
          {/* ======================== */}
          {state === "complete" && selectedCard && (
            <motion.div
              key="complete"
              className="flex min-h-screen flex-col items-center justify-center px-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-matcha-400/20 to-matcha-300/10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <Sparkles className="h-10 w-10 text-matcha-300" />
              </motion.div>

              <motion.h2
                className="mb-2 text-[22px] font-bold text-gray-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                おめでとうございます！
              </motion.h2>

              <motion.p
                className="mb-2 text-[14px] text-gray-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {selectedCard.title}がコレクションに追加されました
              </motion.p>

              <motion.p
                className="mb-8 text-[12px] text-matcha-400/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                コレクションを始めましょう！
              </motion.p>

              <motion.div
                className="w-full max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.5,
                }}
              >
                <button
                  onClick={() => router.push("/collection")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-matcha-500 to-matcha-400 py-4 text-[15px] font-bold text-white shadow-lg shadow-matcha-400/15 transition-all active:scale-[0.98]"
                >
                  コレクションを見る
                  <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
