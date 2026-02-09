"use client";

import { motion } from "framer-motion";
import { RARITY_CONFIG, Rarity } from "@/types";

interface ParticleEffectProps {
  rarity: Rarity;
  isActive: boolean;
}

export function ParticleEffect({ rarity, isActive }: ParticleEffectProps) {
  const config = RARITY_CONFIG[rarity];
  if (config.particleCount === 0 || !isActive) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: config.particleCount }).map((_, i) => {
        const angle = (360 / config.particleCount) * i;
        const delay = i * 0.1;
        const distance = 80 + Math.random() * 40;

        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{
              backgroundColor: config.glowColor,
              boxShadow: `0 0 6px ${config.glowColor}`,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance,
              opacity: [0, 1, 1, 0],
              scale: [0, 1.5, 1, 0],
            }}
            transition={{
              duration: 1.2,
              delay,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}
