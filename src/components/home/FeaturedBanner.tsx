"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ALL_CARDS } from "@/lib/cards-data";
import { RARITY_CONFIG } from "@/types";

const FEATURED_CARDS = ALL_CARDS.filter(
  (c) => c.rarity === "ur" || c.rarity === "legend"
);

export function FeaturedBanner() {
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % FEATURED_CARDS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance]);

  const card = FEATURED_CARDS[index];
  const rarityConf = RARITY_CONFIG[card.rarity];
  const stars = "★".repeat(rarityConf.stars);

  return (
    <div className="relative mx-4 overflow-hidden rounded-2xl" style={{ height: 200 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col justify-end p-5"
          style={{
            background: `linear-gradient(135deg, ${card.memberColor}44 0%, ${card.memberColor}cc 100%)`,
          }}
        >
          {/* Rarity badge */}
          <span
            className="mb-2 inline-block w-fit rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: rarityConf.color + "33",
              color: rarityConf.color,
            }}
          >
            {stars} {rarityConf.label}
          </span>

          <h3 className="text-lg font-bold text-white drop-shadow-md">
            {card.title}
          </h3>
          <p className="mt-0.5 text-sm text-white/80">
            {card.memberName} / {card.groupName}
          </p>

          <Link
            href="/gacha"
            className="mt-3 text-sm font-semibold text-white/90 transition-colors hover:text-white"
          >
            ガチャで入手 →
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      <div className="absolute bottom-2 right-3 flex gap-1">
        {FEATURED_CARDS.slice(0, 5).map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === index % 5 ? 16 : 6,
              backgroundColor:
                i === index % 5 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
