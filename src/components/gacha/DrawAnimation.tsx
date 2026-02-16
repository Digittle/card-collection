"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Rarity } from "@/types";

const ORB_COLORS_DEFAULT = ["#60A5FA", "#EF4444", "#F59E0B", "#22C55E", "#EC4899", "#8B5CF6"];
const ORB_COLORS_SR = ["#A855F7", "#C084FC", "#9333EA", "#7C3AED", "#A78BFA", "#DDD6FE"];
const ORB_COLORS_UR = ["#F59E0B", "#FBBF24", "#FCD34D", "#D97706", "#EAB308", "#FDE68A"];
const ORB_COLORS_LEGEND = ["#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#A855F7", "#EC4899"];

interface DrawAnimationProps {
  onComplete: () => void;
  rarity?: Rarity;
}

function getRarityTier(rarity?: Rarity): "normal" | "sr" | "ur" | "legend" {
  if (rarity === "legend") return "legend";
  if (rarity === "ur") return "ur";
  if (rarity === "sr") return "sr";
  return "normal";
}

export function DrawAnimation({ onComplete, rarity }: DrawAnimationProps) {
  const [phase, setPhase] = useState<"spin" | "converge" | "flash">("spin");
  const tier = getRarityTier(rarity);

  const timing = useMemo(() => {
    switch (tier) {
      case "legend": return { spin: 2200, converge: 3000, complete: 3800 };
      case "ur": return { spin: 1800, converge: 2600, complete: 3200 };
      case "sr": return { spin: 1600, converge: 2300, complete: 2800 };
      default: return { spin: 1400, converge: 2100, complete: 2600 };
    }
  }, [tier]);

  const orbColors = useMemo(() => {
    switch (tier) {
      case "legend": return ORB_COLORS_LEGEND;
      case "ur": return ORB_COLORS_UR;
      case "sr": return ORB_COLORS_SR;
      default: return ORB_COLORS_DEFAULT;
    }
  }, [tier]);

  const bgColor = useMemo(() => {
    switch (tier) {
      case "legend": return "bg-black";
      case "ur": return "bg-black";
      case "sr": return "bg-black";
      default: return "bg-black";
    }
  }, [tier]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("converge"), timing.spin);
    const t2 = setTimeout(() => setPhase("flash"), timing.converge);
    const t3 = setTimeout(() => onComplete(), timing.complete);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete, timing]);

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center ${bgColor}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background particle shimmer */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: tier === "legend" ? 40 : tier === "ur" ? 30 : 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: tier === "legend"
                ? `hsl(${(i * 37) % 360}, 80%, 70%)`
                : tier === "ur"
                ? "#FBBF2480"
                : tier === "sr"
                ? "#C084FC80"
                : "rgba(255,255,255,0.3)",
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

      {/* Aura for SR+ */}
      {tier !== "normal" && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: tier === "legend" ? 300 : tier === "ur" ? 250 : 200,
            height: tier === "legend" ? 300 : tier === "ur" ? 250 : 200,
            background: tier === "legend"
              ? "conic-gradient(from 0deg, #EF4444, #F59E0B, #22C55E, #3B82F6, #A855F7, #EC4899, #EF4444)"
              : tier === "ur"
              ? "radial-gradient(circle, #FBBF2440 0%, #F59E0B20 50%, transparent 70%)"
              : "radial-gradient(circle, #C084FC30 0%, #A855F720 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{
            rotate: tier === "legend" ? [0, 360] : 0,
            scale: [0.8, 1.2, 0.8],
            opacity: phase === "flash" ? 0 : [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: tier === "legend" ? 3 : 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Screen shake for Legend */}
      <motion.div
        className="relative h-40 w-40"
        animate={
          tier === "legend" && phase === "converge"
            ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 3, -1, 0] }
            : {}
        }
        transition={{ duration: 0.3, repeat: tier === "legend" && phase === "converge" ? Infinity : 0 }}
      >
        {/* Orbs */}
        {orbColors.map((color, i) => {
          const angle = (i / orbColors.length) * 360;
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
                duration: phase === "spin" ? timing.spin / 1000 : 0.7,
                ease: phase === "spin" ? "linear" : "easeIn",
              }}
            />
          );
        })}
      </motion.div>

      {/* Center glow */}
      <AnimatePresence>
        {phase === "converge" && (
          <motion.div
            className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: 0.6 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              boxShadow: tier === "ur"
                ? "0 0 60px #FBBF24, 0 0 120px #F59E0B80"
                : tier === "sr"
                ? "0 0 60px #C084FC, 0 0 120px #A855F780"
                : "0 0 60px #fff, 0 0 120px #fff8",
              backgroundColor: tier === "ur" ? "#FBBF24" : tier === "sr" ? "#C084FC" : "#fff",
            }}
          />
        )}
      </AnimatePresence>

      {/* Flash */}
      <AnimatePresence>
        {phase === "flash" && (
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundColor: tier === "legend"
                ? "#FBBF24"
                : tier === "ur"
                ? "#FDE68A"
                : tier === "sr"
                ? "#E9D5FF"
                : "#fff",
            }}
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
