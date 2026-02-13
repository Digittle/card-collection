"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getUser } from "@/lib/store";
import { MEMBERS } from "@/lib/groups-data";

// Pick a diverse set of member colors for the floating orbs
const ORB_COLORS = [
  ...new Set(MEMBERS.map((m) => m.color)),
].slice(0, 8);

function FloatingOrb({
  color,
  size,
  x,
  y,
  delay,
  duration,
}: {
  color: string;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, ${color}40 0%, ${color}00 70%)`,
        filter: "blur(40px)",
      }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -25, 15, -10, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [0.4, 0.7, 0.3, 0.6, 0.4],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace("/home");
    }
  }, [router]);

  // Generate stable orb configs
  const orbs = useMemo(() => {
    return ORB_COLORS.map((color, i) => ({
      color,
      size: 120 + (i % 3) * 80,
      x: 10 + ((i * 37) % 80),
      y: 5 + ((i * 29) % 85),
      delay: i * 0.8,
      duration: 12 + (i % 4) * 3,
    }));
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712] px-6">
      {/* Floating penlight-style colored orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {orbs.map((orb, i) => (
          <FloatingOrb key={i} {...orb} />
        ))}
      </div>

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-transparent to-[#030712]/80 pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Main title */}
        <motion.h1
          className="mb-4 text-[36px] font-extrabold leading-tight tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            STARTO
          </span>
          <br />
          <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            Card Collection
          </span>
        </motion.h1>

        <motion.p
          className="mb-12 text-[15px] text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          推しのカードを集めよう
        </motion.p>

        <motion.button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-amber-500 px-10 py-4 text-[16px] font-bold text-white shadow-xl shadow-amber-500/20 transition-all hover:shadow-amber-500/30 active:scale-[0.97]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          はじめる
          <ArrowRight className="h-5 w-5" />
        </motion.button>

        <motion.p
          className="mt-8 text-[13px] text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          無料ではじめられます
        </motion.p>
      </motion.div>
    </div>
  );
}
