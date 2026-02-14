"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Coins, ChevronDown } from "lucide-react";
import { ALL_CARDS } from "@/lib/cards-data";
import { GROUPS } from "@/lib/groups-data";
import { RARITY_CONFIG, RARITY_ORDER, GACHA_COST_SINGLE, GACHA_COST_TEN } from "@/types";

interface GachaLandingProps {
  coins: number;
  freeAvailable: boolean;
  onDraw: (count: number, isFree: boolean) => void;
  pityCount: number;
}

export function GachaLanding({ coins, freeAvailable, onDraw, pityCount }: GachaLandingProps) {
  const [showRates, setShowRates] = useState(false);

  const featuredCard = useMemo(() => {
    const hourSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 6));
    const idx = hourSeed % ALL_CARDS.length;
    return ALL_CARDS[idx];
  }, []);

  const featuredGroup = useMemo(() => {
    return GROUPS.find((g) => g.id === featuredCard.groupId);
  }, [featuredCard]);

  const featuredConfig = RARITY_CONFIG[featuredCard.rarity];

  return (
    <div className="relative min-h-[calc(100vh-180px)] overflow-hidden bg-gradient-to-b from-[#0a0e27] to-[#030712] flex flex-col">
      {/* Particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="gacha-particle"
          style={{
            left: `${5 + (i * 6.3) % 90}%`,
            animationDelay: `${(i * 0.7) % 5}s`,
            animationDuration: `${4 + (i % 3) * 2}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
          }}
        />
      ))}

      {/* Coin Display */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1.5 border border-white/10">
        <Coins className="h-3.5 w-3.5 text-gold-300" />
        <span className="text-[13px] font-bold tabular-nums text-gold-300">{coins.toLocaleString()}</span>
      </div>

      {/* Limited Ribbon */}
      <div className="absolute top-4 left-0 z-20">
        <div
          className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-1 text-[11px] font-bold text-white shadow-lg"
          style={{ transform: "rotate(-2deg)", transformOrigin: "left center" }}
        >
          期間限定ピックアップ
        </div>
      </div>

      {/* Featured Character Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center pt-14 pb-2">
        {/* SVG Light Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="absolute h-72 w-72 animate-[ringRotate_20s_linear_infinite]"
            viewBox="0 0 200 200"
            style={{ filter: "blur(1px)" }}
          >
            <circle cx="100" cy="100" r="90" fill="none" stroke="url(#ring1)" strokeWidth="0.5" opacity="0.6" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#ring1)" strokeWidth="0.3" opacity="0.3" strokeDasharray="8 12" />
            <defs>
              <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f6ab00" />
                <stop offset="50%" stopColor="#ec6d81" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <svg
            className="absolute h-80 w-80 animate-[ringRotateReverse_25s_linear_infinite]"
            viewBox="0 0 200 200"
            style={{ filter: "blur(2px)" }}
          >
            <circle cx="100" cy="100" r="95" fill="none" stroke="url(#ring2)" strokeWidth="0.3" opacity="0.4" strokeDasharray="4 16" />
            <defs>
              <linearGradient id="ring2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#f6ab00" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Character Image */}
        <div
          className="relative z-10 aspect-[5/7] w-[200px] overflow-hidden rounded-2xl animate-[gentleFloat_6s_ease-in-out_infinite]"
          style={{
            background: `linear-gradient(135deg, ${featuredCard.memberColor}40 0%, ${featuredCard.memberColor}90 100%)`,
            boxShadow: `0 0 40px ${featuredCard.memberColor}40, 0 0 80px ${featuredCard.memberColor}20`,
          }}
        >
          {featuredCard.memberImage && (
            <Image
              src={featuredCard.memberImage}
              alt={featuredCard.memberName}
              fill
              className="object-cover object-top"
              sizes="200px"
            />
          )}
          <div className="card-holo-overlay" style={{ opacity: 0.3 }} />
        </div>

        {/* Card Title + Rarity */}
        <div className="relative z-10 mt-3 text-center">
          <p className="text-[15px] font-bold text-white drop-shadow-md">
            {featuredCard.title}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: featuredConfig.color }}>
            {"★".repeat(featuredConfig.stars)}
          </p>
          {featuredGroup && (
            <p className="mt-0.5 text-[11px] text-white/40">{featuredGroup.name}</p>
          )}
        </div>
      </div>

      {/* Pity Progress Bar */}
      <div className="mx-6 mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-white/50">天井カウンター</span>
          <span className="text-[12px] font-bold text-gold-300">{pityCount}/50</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #f6ab00, #FF5C00)" }}
            initial={{ width: 0 }}
            animate={{ width: `${(pityCount / 50) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="mt-1 text-[10px] text-white/30">50回でUR以上1枚確定</p>
      </div>

      {/* Rate Info Accordion */}
      <div className="mx-6 mt-4">
        <button
          onClick={() => setShowRates(!showRates)}
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm"
        >
          <span className="text-[12px] font-medium text-white/50">排出確率</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-white/40 transition-transform ${showRates ? "rotate-180" : ""}`}
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
                    <div key={rarity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <span className="text-[12px] text-white/50">
                          {cfg.labelEn} {cfg.label}
                        </span>
                      </div>
                      <span className="text-[12px] font-bold tabular-nums text-white/70">
                        {(cfg.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Draw Buttons */}
      <div className="mt-auto px-4 pb-6 pt-4">
        {freeAvailable && (
          <motion.button
            onClick={() => onDraw(1, true)}
            className="mb-3 w-full rounded-xl py-3.5 text-center font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #22C55E, #16A34A)",
              boxShadow: "0 0 20px rgba(34,197,94,0.3)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-[15px]">無料1回ガチャ</span>
            <span className="ml-2 text-[12px] text-white/70">1日1回</span>
          </motion.button>
        )}

        <div className="flex gap-3">
          <motion.button
            onClick={() => onDraw(1, false)}
            disabled={coins < GACHA_COST_SINGLE}
            className="flex-1 rounded-xl border border-white/15 bg-white/10 py-3.5 text-center font-bold text-white backdrop-blur-sm transition-all disabled:opacity-30 active:brightness-125"
            whileTap={{ scale: 0.97 }}
          >
            <div className="text-[14px]">1回引く</div>
            <div className="text-[11px] text-white/50">{GACHA_COST_SINGLE.toLocaleString()} コイン</div>
          </motion.button>

          <div className="relative flex-[1.4]">
            <motion.button
              onClick={() => onDraw(10, false)}
              disabled={coins < GACHA_COST_TEN}
              className="w-full rounded-xl py-3.5 text-center font-black text-black shadow-lg disabled:opacity-30 active:brightness-110"
              style={{
                background: "linear-gradient(135deg, #f6ab00, #fdd780, #f6ab00)",
                boxShadow: "0 0 24px rgba(246,171,0,0.4), 0 0 48px rgba(246,171,0,0.15)",
              }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  "0 0 24px rgba(246,171,0,0.4)",
                  "0 0 32px rgba(246,171,0,0.6)",
                  "0 0 24px rgba(246,171,0,0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-[16px]">10連引く</div>
              <div className="text-[11px] text-black/60">{GACHA_COST_TEN.toLocaleString()} コイン</div>
            </motion.button>
            {/* SR guaranteed ribbon */}
            <div className="absolute -top-2 -right-1 z-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
              SR以上1枚確定
            </div>
          </div>
        </div>

        {coins < GACHA_COST_SINGLE && !freeAvailable && (
          <p className="mt-3 text-center text-[12px] text-red-400/80">コイン不足です</p>
        )}
      </div>
    </div>
  );
}
