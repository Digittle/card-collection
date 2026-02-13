"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rarity } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CelebrationBurstProps {
  rarity: Rarity;
  onComplete?: () => void;
}

const RARITY_CELEBRATION: Record<Rarity, { count: number; colors: string[]; duration: number; ring: boolean }> = {
  common:    { count: 8,  colors: ["#bfbfbf", "#d4d4d4"], duration: 1.0, ring: false },
  rare:      { count: 16, colors: ["#6481c0", "#8ba3d9", "#4a6bb0"], duration: 1.2, ring: false },
  epic:      { count: 24, colors: ["#b08bbe", "#c9a4d6", "#9673a8"], duration: 1.4, ring: true },
  legendary: { count: 40, colors: ["#f6ab00", "#ffd700", "#ff8c00", "#fff"], duration: 1.8, ring: true },
};

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  isRect: boolean;
  delay: number;
}

function generateParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + (Math.random() - 0.5) * 20,
    distance: 60 + Math.random() * 120,
    size: 4 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    isRect: Math.random() > 0.7,
    delay: Math.random() * 0.15,
  }));
}

export function CelebrationBurst({ rarity, onComplete }: CelebrationBurstProps) {
  const prefersReduced = useReducedMotion();
  const [particles] = useState(() =>
    generateParticles(RARITY_CELEBRATION[rarity].count, RARITY_CELEBRATION[rarity].colors)
  );
  const celebration = RARITY_CELEBRATION[rarity];

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, celebration.duration * 1000 + 200);

    return () => clearTimeout(timer);
  }, [celebration.duration, onComplete]);

  if (prefersReduced) {
    return (
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.4 }}
      />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {/* Particles */}
      {particles.map((p) => {
        const radians = (p.angle * Math.PI) / 180;
        const targetX = Math.cos(radians) * p.distance;
        const targetY = Math.sin(radians) * p.distance - 40;

        return (
          <motion.div
            key={p.id}
            className={`absolute ${p.isRect ? "rounded-sm" : "rounded-full"}`}
            style={{
              width: p.size,
              height: p.isRect ? p.size * 1.5 : p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 6px ${p.color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: targetX,
              y: targetY,
              opacity: [0, 1, 1, 0.8, 0],
              scale: [0, 1.2, 1, 0.6, 0],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: celebration.duration,
              delay: p.delay,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* Expanding glow ring for epic/legendary */}
      {celebration.ring && (
        <motion.div
          className="absolute rounded-full border-2"
          style={{
            width: 80,
            height: 80,
            borderColor: celebration.colors[0],
            boxShadow: `0 0 20px ${celebration.colors[0]}, inset 0 0 20px ${celebration.colors[0]}`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: celebration.duration * 0.8, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
