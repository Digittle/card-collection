"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getUser } from "@/lib/store";
import { MEMBERS } from "@/lib/groups-data";
import Image from "next/image";

// Pick diverse members for floating cards
const FLOATING_MEMBERS = [
  "/members/sm-meguro.jpg",
  "/members/st-jesse.jpg",
  "/members/nw-ohashi.jpg",
  "/members/tj-matsuda.jpg",
  "/members/sm-raul.jpg",
  "/members/st-kyomoto.jpg",
  "/members/nw-nagao.jpg",
  "/members/tj-kawashima.jpg",
  "/members/sm-watanabe.jpg",
  "/members/st-matsumura.jpg",
];

// Pick a diverse set of member colors for the floating orbs
const ORB_COLORS = [
  ...new Set(MEMBERS.map((m) => m.color)),
].slice(0, 6);

function FloatingCard({
  src,
  size,
  x,
  y,
  delay,
  duration,
  rotate,
}: {
  src: string;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  rotate: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size * 1.3,
        left: `${x}%`,
        top: `${y}%`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.15, 0.35, 0.2, 0.3, 0.15],
        y: [0, -15, 8, -10, 0],
        x: [0, 8, -5, 3, 0],
        rotate: [rotate, rotate + 3, rotate - 2, rotate + 1, rotate],
        scale: [0.95, 1.05, 0.98, 1.02, 0.95],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <div className="w-full h-full rounded-xl overflow-hidden shadow-lg shadow-black/10">
        <Image
          src={src}
          alt=""
          width={size}
          height={size * 1.3}
          className="w-full h-full object-cover"
          priority={false}
        />
      </div>
    </motion.div>
  );
}

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
        background: `radial-gradient(circle, ${color}20 0%, ${color}00 70%)`,
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

  // Generate floating card configs
  const cards = useMemo(() => {
    const positions = [
      { x: 2, y: 5, rotate: -12 },
      { x: 72, y: 3, rotate: 8 },
      { x: -3, y: 35, rotate: 6 },
      { x: 78, y: 30, rotate: -9 },
      { x: 8, y: 65, rotate: 10 },
      { x: 70, y: 60, rotate: -7 },
      { x: 25, y: 80, rotate: -5 },
      { x: 55, y: 78, rotate: 12 },
      { x: 40, y: 2, rotate: -3 },
      { x: 50, y: 45, rotate: 5 },
    ];
    return FLOATING_MEMBERS.map((src, i) => ({
      src,
      size: 60 + (i % 3) * 15,
      ...positions[i],
      delay: i * 0.5,
      duration: 10 + (i % 4) * 2,
    }));
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F4F5F6] px-6">
      {/* Floating penlight-style colored orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {orbs.map((orb, i) => (
          <FloatingOrb key={`orb-${i}`} {...orb} />
        ))}
      </div>

      {/* Floating member cards */}
      <div className="absolute inset-0 overflow-hidden">
        {cards.map((card, i) => (
          <FloatingCard key={`card-${i}`} {...card} />
        ))}
      </div>

      {/* Vignette overlay to keep center readable */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, rgba(244,245,246,0.85) 30%, rgba(244,245,246,0.4) 70%, rgba(244,245,246,0.1) 100%)"
      }} />

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
          <span className="bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
            STARTO
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
            Card Collection
          </span>
        </motion.h1>

        <motion.p
          className="mb-12 text-[15px] text-gray-500"
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
          className="mt-8 text-[13px] text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          無料ではじめられます
        </motion.p>
        <motion.p
          className="mt-2 text-[12px] text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          登録不要・ブラウザで遊べます
        </motion.p>
      </motion.div>
    </div>
  );
}
