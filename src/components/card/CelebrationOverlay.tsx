"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_BOUNCY } from "@/lib/motion-variants";

interface CelebrationOverlayProps {
  cardTitle: string;
  onDismiss: () => void;
}

const AVATAR_COLORS = [
  "#FCA5A5", "#FCD34D", "#86EFAC", "#93C5FD", "#C4B5FD",
  "#FBCFE8", "#FDE68A", "#A7F3D0", "#BFDBFE", "#DDD6FE",
];

const NAMES = ["ゆうき", "はるか", "さくら", "れん", "あおい", "そうた", "ひなた", "みゆ"];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function CelebrationOverlay({ cardTitle, onDismiss }: CelebrationOverlayProps) {
  const [claimerCount] = useState(() => 5 + Math.floor(Math.random() * 21));
  const [avatars] = useState(() =>
    pickRandom(NAMES, 5).map((name, i) => ({
      name,
      initial: name.charAt(0),
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    }))
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      const exitTimer = setTimeout(onDismiss, 300);
      return () => clearTimeout(exitTimer);
    }
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
          initial={{ x: "-50%", y: 40, opacity: 0 }}
          animate={{ x: "-50%", y: 0, opacity: 1 }}
          exit={{ x: "-50%", y: 40, opacity: 0 }}
          transition={SPRING_BOUNCY}
        >
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 shadow-lg backdrop-blur-md">
            {/* Avatar stack */}
            <div className="mb-2 flex items-center">
              <div className="flex -space-x-2">
                {avatars.map((avatar, i) => (
                  <motion.div
                    key={avatar.name}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 text-xs font-bold text-white"
                    style={{ backgroundColor: avatar.color, zIndex: 5 - i }}
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05, ...SPRING_BOUNCY }}
                  >
                    {avatar.initial}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Message */}
            <p className="text-sm leading-relaxed text-white/90">
              他の<span className="font-bold text-white">{claimerCount}人</span>も
              「<span className="font-bold text-white">{cardTitle}</span>」を取得しました!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
