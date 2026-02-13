"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, RARITY_CONFIG, RARITY_PRICE } from "@/types";
import { Coins } from "lucide-react";

interface FeaturedCardProps {
  card: Card;
  onTap: () => void;
}

export function FeaturedCard({ card, onTap }: FeaturedCardProps) {
  const config = RARITY_CONFIG[card.rarity];
  const price = RARITY_PRICE[card.rarity];

  return (
    <motion.button
      type="button"
      onClick={onTap}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16 / 10" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background image */}
      <Image
        src={card.imageUrl}
        alt={card.title}
        fill
        className="object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Top badge */}
      <div className="absolute left-4 top-4 z-10">
        <span className="rounded-full bg-gold-400/20 px-3 py-1 text-[11px] font-bold text-gold-300 backdrop-blur-sm">
          本日のおすすめ
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <div className="flex items-end justify-between">
          <div>
            <span
              className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${config.textColor} bg-gradient-to-r ${config.bgGradient}`}
            >
              {config.label}
            </span>
            <h3 className="text-[18px] font-bold leading-tight text-white">
              {card.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <Coins className="h-4 w-4 text-gold-300" />
            <span className="text-[14px] font-bold text-gold-300">
              {price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
