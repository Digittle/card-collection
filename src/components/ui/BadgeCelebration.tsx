"use client";

import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Footprints,
  LayoutGrid,
  Trophy,
  Star,
  Crown,
  ArrowLeftRight,
  Zap,
  Award,
} from "lucide-react";
import type { Badge } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints,
  LayoutGrid,
  Trophy,
  Star,
  Crown,
  ArrowLeftRight,
  Zap,
  Award,
};

const TIER_GRADIENT: Record<Badge["tier"], string> = {
  bronze: "from-amber-700 to-amber-600",
  silver: "from-gray-400 to-gray-300",
  gold: "from-yellow-500 to-amber-400",
  platinum: "from-gray-200 to-white",
};

const TIER_GLOW: Record<Badge["tier"], string> = {
  bronze: "rgba(180, 83, 9, 0.4)",
  silver: "rgba(156, 163, 175, 0.5)",
  gold: "rgba(245, 158, 11, 0.6)",
  platinum: "rgba(229, 231, 235, 0.8)",
};

interface BadgeCelebrationProps {
  badge: Badge | null;
  onDismiss: () => void;
}

function CelebrationParticles({ tier }: { tier: Badge["tier"] }) {
  const particleCount = tier === "platinum" ? 16 : tier === "gold" ? 12 : 0;

  const particles = useMemo(() => {
    const colors =
      tier === "platinum"
        ? ["#e5e7eb", "#f3f4f6", "#d1d5db", "#9ca3af"]
        : ["#f59e0b", "#fbbf24", "#f6ab00", "#fcd34d"];

    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = (360 / particleCount) * i + Math.random() * 20;
      const distance = 100 + Math.random() * 60;
      return {
        angle,
        distance,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 4,
        delay: i * 0.04,
      };
    });
  }, [particleCount, tier]);

  if (particleCount === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1, 0],
          }}
          transition={{
            duration: 1.4,
            delay: 0.3 + p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export function BadgeCelebration({ badge, onDismiss }: BadgeCelebrationProps) {
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  if (!badge) return null;

  const IconComponent = ICON_MAP[badge.iconName] || Award;
  const gradient = TIER_GRADIENT[badge.tier];
  const glow = TIER_GLOW[badge.tier];
  const showParticles = badge.tier === "gold" || badge.tier === "platinum";
  const isPlatinum = badge.tier === "platinum";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative flex w-full max-w-xs flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 250 }}
        >
          {/* Particle effect layer */}
          {showParticles && <CelebrationParticles tier={badge.tier} />}

          {/* Badge icon circle */}
          <motion.div
            className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${gradient}`}
            style={{
              boxShadow: `0 0 24px ${glow}, 0 0 48px ${glow}60`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 200,
              delay: 0.15,
            }}
          >
            <IconComponent
              className={`h-10 w-10 ${
                isPlatinum ? "text-gray-600" : "text-white"
              }`}
            />
            {/* Platinum shimmer overlay */}
            {isPlatinum && (
              <div className="shimmer absolute inset-0 rounded-full opacity-60" />
            )}
          </motion.div>

          {/* Title: バッジ獲得！ */}
          <motion.p
            className="mt-6 text-lg font-bold text-gray-900"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            バッジ獲得！
          </motion.p>

          {/* Badge title */}
          <motion.h3
            className="mt-2 text-base font-semibold text-gray-800"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            {badge.title}
          </motion.h3>

          {/* Badge description */}
          <motion.p
            className="mt-1.5 text-center text-sm leading-relaxed text-gray-500"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {badge.description}
          </motion.p>

          {/* Dismiss button */}
          <motion.button
            onClick={handleDismiss}
            className="mt-7 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-10 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            OK
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
