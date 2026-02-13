"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ORB_COLORS = ["#60A5FA", "#EF4444", "#F59E0B", "#22C55E", "#EC4899", "#8B5CF6"];

interface DrawAnimationProps {
  onComplete: () => void;
}

export function DrawAnimation({ onComplete }: DrawAnimationProps) {
  const [phase, setPhase] = useState<"spin" | "converge" | "flash">("spin");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("converge"), 1400);
    const t2 = setTimeout(() => setPhase("flash"), 2100);
    const t3 = setTimeout(() => onComplete(), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background particle shimmer */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 1.5 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 1.5,
            }}
          />
        ))}
      </div>

      {/* Orbs */}
      <div className="relative h-40 w-40">
        {ORB_COLORS.map((color, i) => {
          const angle = (i / ORB_COLORS.length) * 360;
          const radius = phase === "converge" || phase === "flash" ? 0 : 60;
          const spinOffset = phase === "spin" ? 360 : 0;

          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 h-4 w-4 rounded-full"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 16px ${color}, 0 0 32px ${color}80`,
                marginLeft: -8,
                marginTop: -8,
              }}
              initial={{
                x: Math.cos((angle * Math.PI) / 180) * 60,
                y: Math.sin((angle * Math.PI) / 180) * 60,
                scale: 1,
              }}
              animate={{
                x: Math.cos(((angle + spinOffset) * Math.PI) / 180) * radius,
                y: Math.sin(((angle + spinOffset) * Math.PI) / 180) * radius,
                scale: phase === "converge" ? 1.5 : phase === "flash" ? 0 : 1,
                opacity: phase === "flash" ? 0 : 1,
              }}
              transition={{
                duration: phase === "spin" ? 1.4 : 0.7,
                ease: phase === "spin" ? "linear" : "easeIn",
              }}
            />
          );
        })}
      </div>

      {/* Center glow */}
      <AnimatePresence>
        {phase === "converge" && (
          <motion.div
            className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: 0.6 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ boxShadow: "0 0 60px #fff, 0 0 120px #fff8" }}
          />
        )}
      </AnimatePresence>

      {/* Flash */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
