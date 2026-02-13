"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";

interface CollabCelebrationProps {
  isVisible: boolean;
  programTitle: string;
  accentColor: string;
  onDismiss: () => void;
}

// Simple confetti particle
function ConfettiParticle({ index, color }: { index: number; color: string }) {
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 2 + Math.random() * 2;
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        left: `${left}%`,
        top: -20,
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{
        y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
        rotate: rotation + 720,
        opacity: [1, 1, 0],
        x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration,
        delay,
        ease: "easeIn",
      }}
    />
  );
}

const CONFETTI_COLORS = ["#ec6d81", "#f6ab00", "#90c31f", "#b08bbe", "#6481c0", "#FF6B6B", "#4ECDC4"];

export function CollabCelebration({
  isVisible,
  programTitle,
  accentColor,
  onDismiss,
}: CollabCelebrationProps) {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (isVisible) {
      setParticles(Array.from({ length: 50 }, (_, i) => i));
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Confetti */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((i) => (
              <ConfettiParticle
                key={i}
                index={i}
                color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 mx-4 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-1 rounded-3xl opacity-30"
              style={{
                background: `conic-gradient(from 0deg, ${accentColor}, #f6ab00, #90c31f, #b08bbe, ${accentColor})`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative rounded-3xl bg-white p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              >
                <PartyPopper className="mx-auto mb-4 h-16 w-16" style={{ color: accentColor }} />
              </motion.div>

              <motion.h2
                className="mb-2 text-2xl font-black text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                共闘達成！
              </motion.h2>

              <motion.p
                className="mb-6 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                「{programTitle}」をみんなの力で達成しました！
              </motion.p>

              <motion.button
                className="w-full rounded-xl py-3 text-sm font-bold text-white"
                style={{ backgroundColor: accentColor }}
                whileTap={{ scale: 0.97 }}
                onClick={onDismiss}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                報酬を確認する
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
