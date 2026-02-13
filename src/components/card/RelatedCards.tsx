"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, RARITY_CONFIG } from "@/types";
import { getRelatedCards } from "@/lib/cards-data";
import { getCards } from "@/lib/store";
import { useEffect, useState } from "react";

interface RelatedCardsProps {
  cardId: string;
}

export function RelatedCards({ cardId }: RelatedCardsProps) {
  const [related, setRelated] = useState<Card[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRelated(getRelatedCards(cardId));
    setOwnedIds(new Set(getCards().map((c) => c.id)));
  }, [cardId]);

  if (related.length === 0) return null;

  return (
    <section className="mt-6">
      <h3 className="mb-3 px-5 text-[15px] font-bold text-white">関連カード</h3>
      <div className="scrollbar-hide flex gap-2.5 overflow-x-auto px-5 pb-2">
        {related.map((card, i) => {
          const config = RARITY_CONFIG[card.rarity];
          const owned = ownedIds.has(card.id);

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <Link
                href={owned ? `/card/${card.id}` : "#"}
                className={`block ${!owned ? "pointer-events-none" : ""}`}
              >
                <div className="relative h-[140px] w-[100px] shrink-0 overflow-hidden rounded-xl border border-white/8">
                  {owned ? (
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/5">
                      <span className="text-[11px] text-white/20">???</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <div className="flex items-center gap-1">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: config.glowColor }}
                      />
                      <span className="truncate text-[10px] font-medium text-white/80">
                        {card.title}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
