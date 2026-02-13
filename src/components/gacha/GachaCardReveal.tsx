"use client";

import { motion } from "framer-motion";
import { Card, RARITY_CONFIG } from "@/types";

interface GachaCardRevealProps {
  card: Card;
  isNew: boolean;
  onNext: () => void;
}

export function GachaCardReveal({ card, isNew, onNext }: GachaCardRevealProps) {
  const config = RARITY_CONFIG[card.rarity];
  const stars = "★".repeat(config.stars);

  // Generate lighter and darker shades from memberColor
  const baseColor = card.memberColor;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onNext}
    >
      {/* Card */}
      <motion.div
        className={`relative w-full max-w-[280px] overflow-hidden rounded-2xl card-glow-${card.rarity}`}
        initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ aspectRatio: "3/4" }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${baseColor}40 0%, ${baseColor} 50%, ${baseColor}90 100%)`,
          }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }}
        />

        {/* Holo shimmer */}
        <div className="card-holo-overlay" />

        {/* Rarity badge - top right */}
        <div className="absolute right-3 top-3 z-10">
          <div
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: `${config.color}30`,
              color: config.color,
              border: `1px solid ${config.color}50`,
            }}
          >
            {config.labelEn} {stars}
          </div>
        </div>

        {/* Card content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
          {/* Member name */}
          <h2
            className="text-center text-[28px] font-black leading-tight text-white"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          >
            {card.memberName}
          </h2>

          {/* Card title */}
          <p
            className="mt-2 text-center text-[14px] text-white/80"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            {card.title}
          </p>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 z-10 p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium text-white/50">
                {card.groupName}
              </p>
              <p className="text-[10px] text-white/40">
                {card.series}
              </p>
            </div>
            <p className="text-[10px] tabular-nums text-white/40">
              {card.cardNumber}/{card.totalInSeries}
            </p>
          </div>
        </div>

        {/* Border */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            border: `1.5px solid ${config.color}40`,
          }}
        />
      </motion.div>

      {/* NEW badge */}
      {isNew && (
        <motion.div
          className="mt-4"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
        >
          <span className="inline-block animate-pulse rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 px-4 py-1 text-[13px] font-black text-black shadow-lg shadow-amber-500/30">
            NEW!
          </span>
        </motion.div>
      )}

      {/* Rarity label */}
      <motion.p
        className="mt-3 text-[13px] font-bold"
        style={{ color: config.color }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {config.label} - {config.distanceLabel}
      </motion.p>

      {/* Tap hint */}
      <motion.p
        className="mt-6 text-[12px] text-white/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        タップして次へ
      </motion.p>
    </motion.div>
  );
}
