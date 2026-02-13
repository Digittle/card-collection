"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, RARITY_CONFIG } from "@/types";

interface CardCarouselTileProps {
  card: Card;
  index?: number;
  metric?: string;
  href?: string;
}

export function CardCarouselTile({
  card,
  index = 0,
  metric,
  href,
}: CardCarouselTileProps) {
  const config = RARITY_CONFIG[card.rarity];
  const linkHref = href ?? `/card/${card.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
      className="snap-start"
    >
      <Link href={linkHref} className="block">
        <div className="relative h-[196px] w-[140px] shrink-0 overflow-hidden rounded-2xl border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            className="object-cover transition-transform active:scale-[0.96]"
          />
          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 to-transparent" />

          {/* Metric badge */}
          {metric && (
            <div className="absolute right-1.5 top-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur-sm">
              {metric}
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute inset-x-0 bottom-0 p-2.5">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: config.glowColor }}
              />
              <span className="truncate text-[13px] font-semibold text-white">
                {card.title}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
