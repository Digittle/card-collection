"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { getUser } from "@/lib/store";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace("/collection");
    }
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F4F5F6] px-6">
      {/* Animated ambient background */}
      <div className="ambient-glow left-[20%] top-[20%] h-[350px] w-[350px] bg-primary-400/10" />
      <div
        className="ambient-glow right-[15%] top-[50%] h-[300px] w-[300px] bg-gold-300/8"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="ambient-glow bottom-[10%] left-[30%] h-[250px] w-[250px] bg-rose-300/6"
        style={{ animationDelay: "-14s" }}
      />

      {/* Floating card illustrations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[8%] top-[15%] h-20 w-14 rounded-lg border border-primary-300/30 bg-gradient-to-br from-primary-200/40 to-primary-100/30"
          animate={{ y: [0, -12, 0], rotate: [-5, -3, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="m-auto mt-5 h-5 w-5 text-primary-400/50" />
        </motion.div>
        <motion.div
          className="absolute right-[10%] top-[22%] h-16 w-11 rounded-lg border border-gold-300/20 bg-gradient-to-br from-gold-300/30 to-gold-200/20"
          animate={{ y: [0, -10, 0], rotate: [6, 8, 6] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <Sparkles className="m-auto mt-4 h-4 w-4 text-gold-300/50" />
        </motion.div>
        <motion.div
          className="absolute bottom-[25%] left-[15%] h-14 w-10 rounded-lg border border-rose-300/15 bg-gradient-to-br from-rose-200/10 to-rose-100/5"
          animate={{ y: [0, -8, 0], rotate: [-3, -6, -3] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-[30%] right-[12%] h-18 w-12 rounded-lg border border-matcha-400/15 bg-gradient-to-br from-matcha-300/20 to-matcha-200/15"
          animate={{ y: [0, -14, 0], rotate: [4, 2, 4] }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="mb-10 flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-primary-600 via-primary-500 to-gold-500 shadow-2xl shadow-primary-400/20"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, delay: 0.2 }}
        >
          <Sparkles className="h-14 w-14 text-white" />
        </motion.div>

        <motion.h1
          className="mb-3 text-[32px] font-bold leading-tight tracking-tight text-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Digital Card
          <br />
          <span className="bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
            Collection
          </span>
        </motion.h1>

        <motion.p
          className="mb-12 max-w-[260px] text-[15px] leading-relaxed text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          あなただけのデジタルカードを
          <br />
          受け取って、集めて、楽しもう
        </motion.p>

        <motion.button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-10 py-4 text-[16px] font-bold text-white shadow-xl shadow-primary-500/25 transition-all hover:shadow-primary-500/40 active:scale-[0.97]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
        >
          はじめる
          <ArrowRight className="h-5 w-5" />
        </motion.button>

        <motion.p
          className="mt-8 text-[13px] text-gray-400"
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
