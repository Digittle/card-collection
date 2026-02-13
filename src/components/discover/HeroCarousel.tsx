"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, RARITY_CONFIG } from "@/types";

interface HeroCarouselProps {
  cards: Card[];
}

export function HeroCarousel({ cards }: HeroCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const advance = useCallback(() => {
    if (cards.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  useEffect(() => {
    const timer = setInterval(advance, 6000);
    return () => clearInterval(timer);
  }, [advance]);

  if (cards.length === 0) return null;

  const card = cards[activeIndex];
  const config = RARITY_CONFIG[card.rarity];

  return (
    <div
      className="relative h-[420px] w-full cursor-pointer overflow-hidden"
      onClick={() => router.push(`/card/${card.id}`)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Overlay content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-md">
            Featured
          </span>
          <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-white">
            {card.title}
          </h2>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide`}
            style={{
              backgroundColor: `${config.glowColor}33`,
              color: config.glowColor,
            }}
          >
            {config.label}
          </span>
        </motion.div>
      </div>

      {/* Dot indicators */}
      {cards.length > 1 && (
        <div className="absolute bottom-5 right-5 z-10 flex gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
