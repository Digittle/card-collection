"use client";

import { Card } from "@/types";
import { CardThumbnail } from "./CardThumbnail";
import { DEMO_CARDS } from "@/lib/cards-data";
import { Gift, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface CardGridProps {
  cards: Card[];
  allCards?: Card[];
  showZukan?: boolean;
}

export function CardGrid({
  cards,
  allCards = DEMO_CARDS,
  showZukan = false,
}: CardGridProps) {
  if (!showZukan && cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 shadow-lg shadow-black/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          <Gift className="h-11 w-11 text-white/40" />
        </motion.div>
        <h3 className="mb-2 text-[17px] font-bold text-white/70">
          まだカードがありません
        </h3>
        <p className="mb-8 text-center text-[14px] leading-relaxed text-white/40">
          ショップでカードを購入しましょう！
        </p>
        <Link
          href="/shop"
          className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
        >
          ショップへ
        </Link>
      </div>
    );
  }

  if (showZukan) {
    const ownedCardIds = new Set(cards.map((c) => c.id));

    return (
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        {allCards.map((card, index) => {
          const isOwned = ownedCardIds.has(card.id);

          if (isOwned) {
            return <CardThumbnail key={card.id} card={card} index={index} />;
          }

          return (
            <SilhouetteCard
              key={card.id}
              cardNumber={card.cardNumber}
              totalInSeries={card.totalInSeries}
              index={index}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
      {cards.map((card, index) => (
        <CardThumbnail key={card.id} card={card} index={index} />
      ))}
    </div>
  );
}

function SilhouetteCard({
  cardNumber,
  totalInSeries,
  index,
}: {
  cardNumber: number;
  totalInSeries: number;
  index: number;
}) {
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
      <div className="relative aspect-[5/7] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.01]">
        {/* Diagonal stripe pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 8px, white 8px, white 9px)",
          }}
        />

        {/* Series number */}
        <div className="absolute right-2 top-2 z-10">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/30">
            #{cardNumber}/{totalInSeries}
          </span>
        </div>

        {/* Lock icon + ??? */}
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <Lock className="h-6 w-6 text-white/20" />
          <span className="text-[18px] font-bold tracking-wider text-white/20">
            ???
          </span>
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-2.5 pb-2.5 pt-8">
          <div className="mb-1 h-3 w-12 rounded-full bg-white/10" />
          <div className="h-4 w-20 rounded-full bg-white/5" />
        </div>
      </div>
    </motion.div>
  );
}
