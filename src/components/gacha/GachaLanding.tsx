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
    <div className="relative min-h-[calc(100vh-180px)] overflow-hidden bg-gradient-to-b from-[#F8F0F2] via-[#FFF5F0] to-[#F4F5F6] flex flex-col">
      {/* Soft decorative particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${5 + (i * 9) % 90}%`,
            top: `${10 + (i * 13) % 70}%`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            background: i % 2 === 0 ? "#ec6d8140" : "#f6ab0040",
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + (i % 3) * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Coin Display */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-sm px-3 py-1.5 border border-gray-200 shadow-sm">
        <Coins className="h-3.5 w-3.5 text-gold-500" />
        <span className="text-[13px] font-bold tabular-nums text-gold-600">{coins.toLocaleString()}</span>
      </div>

      {/* Limited Ribbon */}
      <div className="absolute top-4 left-0 z-20">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-1 text-[11px] font-bold text-white shadow-lg rounded-r-full"
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
            <circle cx="100" cy="100" r="90" fill="none" stroke="url(#ring1)" strokeWidth="0.5" opacity="0.4" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#ring1)" strokeWidth="0.3" opacity="0.2" strokeDasharray="8 12" />
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
            <circle cx="100" cy="100" r="95" fill="none" stroke="url(#ring2)" strokeWidth="0.3" opacity="0.3" strokeDasharray="4 16" />
            <defs>
              <linearGradient id="ring2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec6d81" />
                <stop offset="100%" stopColor="#f6ab00" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Character Image */}
        <div
          className="relative z-10 aspect-[5/7] w-[200px] overflow-hidden rounded-2xl animate-[gentleFloat_6s_ease-in-out_infinite] shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${featuredCard.memberColor}30 0%, ${featuredCard.memberColor}70 100%)`,
            boxShadow: `0 8px 32px ${featuredCard.memberColor}25, 0 0 60px ${featuredCard.memberColor}15`,
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
          <p className="text-[15px] font-bold text-gray-800">
            {featuredCard.title}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: featuredConfig.color }}>
            {"★".repeat(featuredConfig.stars)}
          </p>
          {featuredGroup && (
            <p className="mt-0.5 text-[11px] text-gray-400">{featuredGroup.name}</p>
          )}
        </div>
      </div>

      {/* Pity Progress Bar */}
      <div className="mx-6 mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-gray-400">天井カウンター</span>
          <span className="text-[12px] font-bold text-primary-500">{pityCount}/50</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #ec6d81, #f6ab00)" }}
            initial={{ width: 0 }}
            animate={{ width: `${(pityCount / 50) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="mt-1 text-[10px] text-gray-300">50回でUR以上1枚確定</p>
      </div>

      {/* Rate Info Accordion */}
      <div className="mx-6 mt-4">
        <button
          onClick={() => setShowRates(!showRates)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white/60 px-4 py-2.5 backdrop-blur-sm"
        >
          <span className="text-[12px] font-medium text-gray-500">排出確率</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showRates ? "rotate-180" : ""}`}
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
                        <span className="text-[12px] text-gray-500">
                          {cfg.labelEn} {cfg.label}
                        </span>
                      </div>
                      <span className="text-[12px] font-bold tabular-nums text-gray-700">
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
            className="mb-3 w-full rounded-xl py-3.5 text-center font-bold text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #22C55E, #16A34A)",
              boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
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
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3.5 text-center font-bold text-gray-700 shadow-sm transition-all disabled:opacity-30 active:bg-gray-50"
            whileTap={{ scale: 0.97 }}
          >
            <div className="text-[14px]">1回引く</div>
            <div className="text-[11px] text-gray-400">{GACHA_COST_SINGLE.toLocaleString()} コイン</div>
          </motion.button>

          <div className="relative flex-[1.4]">
            <motion.button
              onClick={() => onDraw(10, false)}
              disabled={coins < GACHA_COST_TEN}
              className="w-full rounded-xl py-3.5 text-center font-black text-black shadow-lg disabled:opacity-30 active:brightness-110"
              style={{
                background: "linear-gradient(135deg, #f6ab00, #fdd780, #f6ab00)",
                boxShadow: "0 4px 20px rgba(246,171,0,0.35)",
              }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  "0 4px 20px rgba(246,171,0,0.35)",
                  "0 4px 28px rgba(246,171,0,0.5)",
                  "0 4px 20px rgba(246,171,0,0.35)",
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
          <p className="mt-3 text-center text-[12px] text-red-400">コイン不足です</p>
        )}
      </div>
    </div>
  );
}
