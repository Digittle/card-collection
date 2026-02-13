"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Rarity, RARITY_CONFIG } from "@/types";
import { SPRING_BOUNCY } from "@/lib/motion-variants";

interface CountdownOverlayProps {
  rarity: Rarity;
  onComplete: () => void;
}

export function CountdownOverlay({ rarity, onComplete }: CountdownOverlayProps) {
  const prefersReduced = useReducedMotion();
  const [currentNumber, setCurrentNumber] = useState<number | null>(3);
  const config = RARITY_CONFIG[rarity];

  useEffect(() => {
    if (prefersReduced) {
      onComplete();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    // 3 → 2 → 1 → flash(0) → done(null)
    timers.push(setTimeout(() => {
      setCurrentNumber(2);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600));

    timers.push(setTimeout(() => {
      setCurrentNumber(1);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 1200));

    timers.push(setTimeout(() => {
      setCurrentNumber(0); // flash
      if (navigator.vibrate) navigator.vibrate(50);
    }, 1800));

    timers.push(setTimeout(() => {
      setCurrentNumber(null);
      onComplete();
    }, 2000));

    // Vibrate on initial 3
    if (navigator.vibrate) navigator.vibrate(50);

    return () => timers.forEach(clearTimeout);
  }, [prefersReduced, onComplete]);

  if (prefersReduced || currentNumber === null) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Vignette edges with rarity glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: `inset 0 0 120px 40px ${config.glowColor}`,
        }}
      >
        <motion.div
          className="h-full w-full"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            boxShadow: `inset 0 0 80px 20px ${config.glowColor}`,
          }}
        />
      </div>

      {/* Countdown numbers */}
      <AnimatePresence mode="wait">
        {currentNumber > 0 && (
          <motion.div
            key={currentNumber}
            className="select-none text-[160px] font-black leading-none text-white"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.8 }}
            transition={{ ...SPRING_BOUNCY }}
            style={{
              textShadow: `0 0 40px ${config.glowColor}, 0 0 80px ${config.glowColor}`,
            }}
          >
            {currentNumber}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash overlay */}
      <AnimatePresence>
        {currentNumber === 0 && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
