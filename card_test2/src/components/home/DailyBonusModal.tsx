"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Flame, Gift, X } from "lucide-react";
import { claimDailyBonus, canClaimDailyBonus } from "@/lib/store";

interface DailyBonusModalProps {
  onClose: () => void;
  onClaimed: (coins: number) => void;
}

export function DailyBonusModal({ onClose, onClaimed }: DailyBonusModalProps) {
  const [result, setResult] = useState<{
    coins: number;
    streak: number;
    streakBonus: number;
  } | null>(null);

  useEffect(() => {
    if (!canClaimDailyBonus()) {
      onClose();
      return;
    }
    const res = claimDailyBonus();
    if (res.claimed) {
      setResult({ coins: res.coins, streak: res.streak, streakBonus: res.streakBonus });
      onClaimed(res.coins);
    } else {
      onClose();
    }
  }, [onClose, onClaimed]);

  if (!result) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-gray-500 transition-colors active:bg-black/20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 px-6 pb-6 pt-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Gift className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h2 className="text-[20px] font-black text-white">ログインボーナス!</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-5 text-center">
          {/* Streak */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-[16px] font-bold text-gray-900">
              {result.streak}日連続ログイン
            </span>
          </div>

          {/* Coins earned */}
          <motion.div
            className="mb-2 flex items-center justify-center gap-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.4, stiffness: 200 }}
          >
            <Coins className="h-6 w-6 text-amber-500" />
            <span className="text-[32px] font-black text-gray-900">
              +{result.coins.toLocaleString()}
            </span>
          </motion.div>

          {result.streakBonus > 0 && (
            <p className="text-[13px] text-amber-600 font-medium">
              連続ログインボーナス +{result.streakBonus.toLocaleString()} コイン含む
            </p>
          )}

          {/* Streak visualization */}
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${
                  i < result.streak
                    ? "bg-amber-400 text-white"
                    : "bg-gray-100 text-gray-300"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">7日連続で1,000コインボーナス!</p>

          {/* CTA */}
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-amber-500/20 transition-all active:scale-[0.97]"
          >
            受け取る
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
