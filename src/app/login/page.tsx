"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ArrowRight, Sparkles } from "lucide-react";
import { setUser, hasCompletedOnboarding } from "@/lib/store";
import { v4Fallback } from "@/lib/utils";
import { INITIAL_COINS } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);

    const user = {
      id: v4Fallback(),
      displayName: name.trim(),
      email: "",
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: false,
      coins: INITIAL_COINS,
      hasReceivedFreeCard: false,
    };

    setUser(user);

    setTimeout(() => {
      if (hasCompletedOnboarding()) {
        router.push("/collection");
      } else {
        router.push("/onboarding");
      }
    }, 300);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);

    const user = {
      id: v4Fallback(),
      displayName: "ゲスト",
      email: "",
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: false,
      coins: INITIAL_COINS,
      hasReceivedFreeCard: false,
    };

    setUser(user);

    setTimeout(() => {
      if (hasCompletedOnboarding()) {
        router.push("/collection");
      } else {
        router.push("/onboarding");
      }
    }, 300);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712] px-6">
      {/* Ambient bg */}
      <div className="ambient-glow left-[30%] top-[25%] h-[300px] w-[300px] bg-primary-400/15" />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <motion.div
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200/40 to-primary-100/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <Sparkles className="h-10 w-10 text-primary-500" />
          </motion.div>
          <h1 className="mb-2 text-[24px] font-bold text-white">ようこそ</h1>
          <p className="text-[14px] leading-relaxed text-white/50">
            名前を入力してカード収集を始めましょう
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="あなたの名前"
              maxLength={20}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-[15px] text-white placeholder-white/30 outline-none transition-all focus:border-primary-400 focus:bg-white/10 focus:ring-2 focus:ring-primary-400/20"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-4 text-[15px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                スタート
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[12px] text-white/30">または</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-[14px] font-medium text-white/60 transition-all active:scale-[0.98] active:bg-white/10 disabled:opacity-40"
        >
          ゲストではじめる
        </button>
      </motion.div>
    </div>
  );
}
