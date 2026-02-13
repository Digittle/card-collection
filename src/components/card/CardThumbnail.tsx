"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, RARITY_CONFIG } from "@/types";

interface CardThumbnailProps {
  card: Card;
  index: number;
}

const GLOW_CLASS: Record<string, string> = {
  common: "card-glow-common",
  rare: "card-glow-rare",
  epic: "card-glow-epic",
  legendary: "card-glow-legendary",
};

export function CardThumbnail({ card, index }: CardThumbnailProps) {
  const config = RARITY_CONFIG[card.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <Link href={`/card/${card.id}`}>
        <div
          className={`card-thumbnail group relative aspect-[5/7] overflow-hidden rounded-xl border-2 transition-all duration-200 active:scale-[0.96] ${GLOW_CLASS[card.rarity]}`}
          style={{ borderColor: config.glowColor, boxShadow: `0 4px 20px ${config.glowColor}30, 0 0 40px ${config.glowColor}15` }}
        >
          {/* Holographic shimmer overlay */}
          <div className="card-holo-overlay" />

          {/* Card image */}
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Bottom gradient with card info */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2.5 pb-2.5 pt-10">
            {/* Rarity badge */}
            <span
              className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase leading-tight ${config.textColor} bg-gradient-to-r ${config.bgGradient} ${
                card.rarity === "legendary" ? "badge-legendary" : ""
              }`}
            >
              {config.label}
            </span>
            {/* Card name - 16px semibold per guidelines */}
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
        </div>
      </Link>
    </motion.div>
  );
}
