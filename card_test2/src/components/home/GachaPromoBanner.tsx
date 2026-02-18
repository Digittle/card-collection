"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Gift, Sparkles, ArrowRight } from "lucide-react";

/** 大きめCTA: カードが少ない（≤1枚）ユーザー向け */
export function FirstGachaBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="mx-4 mb-5"
    >
      <Link href="/gacha">
        <div className="relative overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-amber-50 p-5 shadow-sm">
          {/* Decorative sparkles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -top-3 -right-3 text-primary-200"
          >
            <Sparkles className="h-16 w-16" />
          </motion.div>

          <div className="relative z-10 flex items-start gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500 shadow-md"
            >
              <Gift className="h-7 w-7 text-white" />
            </motion.div>

            <div className="flex-1">
              <h3 className="text-[16px] font-bold text-gray-900">
                最初のガチャを引いてみよう！
              </h3>
              <p className="mt-1 text-[13px] text-gray-500 leading-relaxed">
                ガチャを引いてお気に入りのカードを集めよう。毎日1回無料で引けます！
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-colors active:bg-primary-600">
                ガチャを引く
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** 無料ガチャ可能時のバッジバナー */
export function FreeGachaBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 }}
      className="mx-4 mb-4"
    >
      <Link href="/gacha">
        <motion.div
          animate={{ boxShadow: ["0 0 0 0 rgba(99,102,241,0.3)", "0 0 0 8px rgba(99,102,241,0)", "0 0 0 0 rgba(99,102,241,0.3)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-3 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-white px-4 py-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500">
            <Gift className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-primary-600">無料ガチャが引けます！</p>
            <p className="text-[11px] text-gray-400">今日の無料1回を使おう</p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary-400" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
