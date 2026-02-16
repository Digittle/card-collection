"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
          {card.memberImage && (
            <Image
              src={card.memberImage}
              alt={card.memberName}
              fill
              className="object-cover object-top opacity-60"
              sizes="(max-width: 448px) 100vw, 420px"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {/* Rarity badge */}
          <span
            className="relative z-10 mb-2 inline-block w-fit rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: rarityConf.color + "33",
              color: rarityConf.color,
            }}
          >
            {stars} {rarityConf.label}
          </span>

          <h3 className="relative z-10 text-lg font-bold text-white drop-shadow-md">
            {card.title}
          </h3>
          <p className="relative z-10 mt-0.5 text-sm text-white/80">
            {card.memberName} / {card.groupName}
          </p>

          <Link
            href="/gacha"
            className="relative z-10 mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-[13px] font-bold text-white shadow-sm border border-white/30 transition-all hover:bg-white/30 active:bg-white/40"
          >
            ガチャで入手
            <span className="text-[14px]">→</span>
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
