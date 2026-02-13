"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Card, RARITY_CONFIG } from "@/types";
import { ParticleEffect } from "./ParticleEffect";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Sparkles } from "lucide-react";

interface CardFlipProps {
  card: Card;
  onComplete?: () => void;
  isFirstTime?: boolean;
}

export function CardFlip({
  card,
  onComplete,
  isFirstTime = true,
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showCardInfo, setShowCardInfo] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const config = RARITY_CONFIG[card.rarity];

  const isHighRarity = card.rarity === "epic" || card.rarity === "legendary";
  const flipDuration = prefersReducedMotion ? 0 : isFirstTime ? 0.8 : 0.5;

  // Fade-in duration: 0.3s normally, 0 for prefers-reduced-motion
  const fadeInDuration = prefersReducedMotion ? 0 : 0.3;

  // Stagger delays for card info sequence: badge -> title -> series
  const infoStagger = useMemo(
    () => ({
      badge: prefersReducedMotion ? 0 : 0,
      title: prefersReducedMotion ? 0 : 0.1,
      series: prefersReducedMotion ? 0 : 0.2,
    }),
    [prefersReducedMotion]
  );

  const handleFlip = useCallback(() => {
    if (isFlipped) return;
    setIsFlipped(true);

    if (config.vibrate && navigator.vibrate) {
      navigator.vibrate(200);
    }

    setTimeout(() => {
      setShowParticles(true);
    }, flipDuration * 500);

    setTimeout(() => {
      setShowCardInfo(true);
    }, flipDuration * 1000 + 200);

    setTimeout(() => {
      onComplete?.();
    }, flipDuration * 1000 + 800);
  }, [isFlipped, config.vibrate, flipDuration, onComplete]);

  const handleSkip = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      if (isFlipped || isSkipped) return;

      setIsSkipped(true);
      setIsFlipped(true);
      setShowParticles(true);

      // Legendary always fires vibrate, even on skip
      if (card.rarity === "legendary" && navigator.vibrate) {
        navigator.vibrate(200);
      }

      // Show card info after fade-in completes
      setTimeout(
        () => {
          setShowCardInfo(true);
        },
        prefersReducedMotion ? 0 : 300
      );

      setTimeout(
        () => {
          onComplete?.();
        },
        prefersReducedMotion ? 0 : 800
      );
    },
    [isFlipped, isSkipped, card.rarity, prefersReducedMotion, onComplete]
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative cursor-pointer"
        style={{ perspective: "1000px", width: "280px", height: "392px" }}
        onClick={!isFlipped ? handleFlip : undefined}
      >
        <ParticleEffect rarity={card.rarity} isActive={showParticles} />

        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: isSkipped ? 0 : flipDuration,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          {/* Back of card (card back face) */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.08] p-4"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Sparkles className="mb-4 h-12 w-12 text-white/40" />
              <p className="text-lg font-medium text-white/40">
                タップして開封
              </p>
            </div>
          </div>

          {/* Front of card (card image) */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  className="relative h-full w-full"
                  initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: fadeInDuration,
                    delay: isSkipped ? 0 : flipDuration * 0.5,
                  }}
                >
                  <div
                    className="relative h-full w-full overflow-hidden rounded-2xl border-2"
                    style={{
                      borderColor: config.glowColor,
                      boxShadow: `0 0 20px ${config.glowColor}, 0 0 40px ${config.glowColor}40`,
                    }}
                  >
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Card info: rarity badge -> title -> series (staggered fade-in) */}
      <AnimatePresence>
        {showCardInfo && (
          <div className="text-center">
            {/* Rarity badge */}
            <motion.div
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: fadeInDuration,
                delay: infoStagger.badge,
              }}
            >
              <span
                className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${config.textColor} bg-gradient-to-r ${config.bgGradient} ${
                  isHighRarity ? "ring-2 ring-offset-2 ring-offset-[#030712]" : ""
                }`}
                style={
                  isHighRarity
                    ? {
                        ["--tw-ring-color" as string]: config.glowColor,
                        boxShadow: `0 0 12px ${config.glowColor}, 0 0 24px ${config.glowColor}60`,
                      }
                    : undefined
                }
              >
                {config.label}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold text-white"
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: fadeInDuration,
                delay: infoStagger.title,
              }}
            >
              {card.title}
            </motion.h2>

            {/* Series info */}
            <motion.p
              className="mt-1 text-sm text-white/50"
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: fadeInDuration,
                delay: infoStagger.series,
              }}
            >
              {card.series} #{card.cardNumber}/{card.totalInSeries}
            </motion.p>
          </div>
        )}
      </AnimatePresence>

      {/* Skip button - shown when card back is visible */}
      {!isFlipped && (
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-sm text-white/40">
            カードをタップして開封しましょう
          </p>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/30 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white/50 active:bg-white/15"
          >
            スキップ
          </button>
        </motion.div>
      )}
    </div>
  );
}
