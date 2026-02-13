"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { Card, RARITY_CONFIG, RARITY_ORDER, GACHA_COST_SINGLE, GACHA_COST_TEN } from "@/types";
import { getUser, getCoins, deductCoins, addCards, canDoFreeGacha, markFreeGachaUsed, addCoins, ownsCard } from "@/lib/store";
import { drawGacha } from "@/lib/cards-data";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { DrawAnimation } from "@/components/gacha/DrawAnimation";
import { GachaCardReveal } from "@/components/gacha/GachaCardReveal";

type GachaState = "select" | "drawing" | "reveal";

interface DrawnResult {
  card: Card;
  isNew: boolean;
}

export default function GachaPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GachaState>("select");
  const [coins, setCoinsState] = useState(0);
  const [freeAvailable, setFreeAvailable] = useState(false);
  const [drawnCards, setDrawnCards] = useState<DrawnResult[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [showRates, setShowRates] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setCoinsState(getCoins());
    setFreeAvailable(canDoFreeGacha());
    setMounted(true);
  }, [router]);

  const refreshCoins = useCallback(() => {
    setCoinsState(getCoins());
    setFreeAvailable(canDoFreeGacha());
  }, []);

  const handleDraw = useCallback((count: number, isFree: boolean) => {
    if (!isFree) {
      const cost = count === 1 ? GACHA_COST_SINGLE : GACHA_COST_TEN;
      if (!deductCoins(cost)) return;
    } else {
      markFreeGachaUsed();
    }

    const cards = drawGacha(count);
    // Check which are new before adding
    const results: DrawnResult[] = cards.map((c) => ({
      card: c,
      isNew: !ownsCard(c.id),
    }));

    // Add to collection
    const { dupeCount } = addCards(cards);
    // Refund for dupes
    if (dupeCount > 0) {
      addCoins(dupeCount * 50);
    }

    setDrawnCards(results);
    setRevealIndex(0);
    setShowGrid(false);
    setState("drawing");
    refreshCoins();
  }, [refreshCoins]);

  const handleAnimationComplete = useCallback(() => {
    if (drawnCards.length === 1) {
      setState("reveal");
    } else {
      setState("reveal");
      setShowGrid(true);
    }
  }, [drawnCards.length]);

  const handleSingleRevealNext = useCallback(() => {
    setState("select");
    refreshCoins();
  }, [refreshCoins]);

  const handleGridCardTap = useCallback((index: number) => {
    setShowGrid(false);
    setRevealIndex(index);
  }, []);

  const handleGridRevealNext = useCallback(() => {
    setShowGrid(true);
  }, []);

  const handleRetry = useCallback(() => {
    setState("select");
    refreshCoins();
  }, [refreshCoins]);

  const summary = useMemo(() => {
    const newCount = drawnCards.filter((r) => r.isNew).length;
    const dupeCount = drawnCards.length - newCount;
    return { newCount, dupeCount };
  }, [drawnCards]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  return (
    <AppShell>
      <Header title="ガチャ" coins={coins} />

      {state === "select" && (
        <div className="px-4 pt-4">
          {/* Gacha Banner */}
          <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="relative flex flex-col items-center justify-center py-12"
              style={{
                background: "linear-gradient(135deg, #60A5FA20 0%, #EC489920 25%, #F59E0B20 50%, #22C55E20 75%, #8B5CF620 100%)",
              }}
            >
              {/* Decorative sparkles */}
              <div className="absolute inset-0 overflow-hidden">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${15 + i * 18}%`,
                      top: `${20 + (i % 3) * 25}%`,
                    }}
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-white/20" />
                  </motion.div>
                ))}
              </div>

              <Sparkles className="mb-3 h-8 w-8 text-gold-300" />
              <h2 className="text-[20px] font-black text-white">
                STARTO ガチャ
              </h2>
              <p className="mt-1 text-[13px] text-white/50">
                推しのカードを引こう
              </p>
            </div>
            <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />
          </motion.div>

          {/* Rate Info */}
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => setShowRates(!showRates)}
              className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
            >
              <span className="text-[13px] font-medium text-white/60">
                排出確率
              </span>
              <ChevronDown
                className={`h-4 w-4 text-white/40 transition-transform ${showRates ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {showRates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 px-4 pb-3 pt-2">
                    {RARITY_ORDER.map((rarity) => {
                      const cfg = RARITY_CONFIG[rarity];
                      return (
                        <div
                          key={rarity}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cfg.color }}
                            />
                            <span className="text-[12px] text-white/60">
                              {cfg.labelEn} {cfg.label}
                            </span>
                          </div>
                          <span className="text-[12px] font-bold tabular-nums text-white/80">
                            {(cfg.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Draw Buttons */}
          <div className="mt-6 space-y-3">
            {/* Free gacha */}
            {freeAvailable && (
              <motion.button
                onClick={() => handleDraw(1, true)}
                className="w-full rounded-xl py-3.5 text-center font-bold text-white shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #16A34A)",
                  boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-[15px]">無料1回ガチャ</span>
                <span className="ml-2 text-[12px] text-white/70">
                  1日1回
                </span>
              </motion.button>
            )}

            {/* Single draw */}
            <motion.button
              onClick={() => handleDraw(1, false)}
              disabled={coins < GACHA_COST_SINGLE}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] py-3.5 text-center font-bold text-white transition-colors disabled:opacity-40"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-[15px]">1回ガチャ</span>
              <span className="ml-2 text-[13px] text-white/50">
                {GACHA_COST_SINGLE.toLocaleString()}コイン
              </span>
            </motion.button>

            {/* Ten pull */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => handleDraw(10, false)}
                disabled={coins < GACHA_COST_TEN}
                className="w-full rounded-xl py-4 text-center font-bold text-white shadow-lg disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
                }}
              >
                <span className="text-[16px]">10連ガチャ</span>
                <span className="ml-2 text-[13px] text-white/80">
                  {GACHA_COST_TEN.toLocaleString()}コイン
                </span>
              </button>
              {/* SR guaranteed badge */}
              <div className="absolute -right-1 -top-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
                SR以上1枚確定!
              </div>
            </motion.div>

            {/* Insufficient coins warning */}
            {coins < GACHA_COST_SINGLE && !freeAvailable && (
              <motion.p
                className="text-center text-[12px] text-red-400/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                コイン不足 - プログラムで獲得しよう
              </motion.p>
            )}
          </div>

          {/* Bottom padding */}
          <div className="h-8" />
        </div>
      )}

      {/* Drawing Animation */}
      <AnimatePresence>
        {state === "drawing" && (
          <DrawAnimation onComplete={handleAnimationComplete} />
        )}
      </AnimatePresence>

      {/* Reveal State */}
      <AnimatePresence>
        {state === "reveal" && drawnCards.length === 1 && (
          <GachaCardReveal
            card={drawnCards[0].card}
            isNew={drawnCards[0].isNew}
            onNext={handleSingleRevealNext}
          />
        )}
      </AnimatePresence>

      {/* 10-pull Grid Reveal */}
      <AnimatePresence>
        {state === "reveal" && drawnCards.length > 1 && showGrid && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-center py-4">
              <h2 className="text-[18px] font-bold text-white">
                ガチャ結果
              </h2>
            </div>

            {/* Card grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {drawnCards.map((result, i) => {
                  const cfg = RARITY_CONFIG[result.card.rarity];
                  return (
                    <motion.button
                      key={i}
                      className={`relative overflow-hidden rounded-xl card-glow-${result.card.rarity}`}
                      style={{ aspectRatio: "3/4" }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                      onClick={() => handleGridCardTap(i)}
                    >
                      {/* Card bg */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(160deg, ${result.card.memberColor}40 0%, ${result.card.memberColor} 50%, ${result.card.memberColor}90 100%)`,
                        }}
                      />
                      <div className="card-holo-overlay" />

                      {/* Rarity badge */}
                      <div className="absolute right-2 top-2 z-10">
                        <div
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                          style={{
                            backgroundColor: `${cfg.color}30`,
                            color: cfg.color,
                            border: `1px solid ${cfg.color}50`,
                          }}
                        >
                          {cfg.labelEn}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3">
                        <p
                          className="text-center text-[16px] font-black text-white"
                          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                        >
                          {result.card.memberName}
                        </p>
                        <p className="mt-1 text-center text-[10px] text-white/60">
                          {result.card.groupName}
                        </p>
                      </div>

                      {/* NEW badge */}
                      {result.isNew && (
                        <div className="absolute left-2 top-2 z-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black">
                          NEW
                        </div>
                      )}

                      {/* Border */}
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{ border: `1px solid ${cfg.color}30` }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-white/[0.06] bg-[#030712] px-4 pb-6 pt-4">
              <p className="mb-4 text-center text-[13px] text-white/60">
                NEW: {summary.newCount}枚 / 重複: {summary.dupeCount}枚
                {summary.dupeCount > 0 && (
                  <span className="ml-1 text-gold-300">
                    (+{summary.dupeCount * 50}コイン返還)
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] py-3 text-[14px] font-bold text-white transition-colors active:bg-white/[0.08]"
                >
                  もう一回
                </button>
                <button
                  onClick={() => router.push("/collection")}
                  className="flex-1 rounded-xl py-3 text-[14px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #ec6d81, #d4576b)",
                  }}
                >
                  コレクションへ
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10-pull individual card reveal */}
      <AnimatePresence>
        {state === "reveal" && drawnCards.length > 1 && !showGrid && (
          <GachaCardReveal
            card={drawnCards[revealIndex].card}
            isNew={drawnCards[revealIndex].isNew}
            onNext={handleGridRevealNext}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
