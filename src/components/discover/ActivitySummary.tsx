"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Eye } from "lucide-react";
import { useCommunityPulse } from "@/hooks/useCommunityPulse";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { AvatarStack } from "@/components/community/AvatarStack";

export function ActivitySummary() {
  const { activeUserCount, todayClaimCount, trendingCards } = useCommunityPulse();

  const fakeAvatars = [
    { name: "ゆうき", initial: "ゆ", color: "#FCA5A5" },
    { name: "はるか", initial: "は", color: "#FCD34D" },
    { name: "さくら", initial: "さ", color: "#86EFAC" },
    { name: "れん", initial: "れ", color: "#93C5FD" },
    { name: "あおい", initial: "あ", color: "#C4B5FD" },
  ];

  return (
    <section className="mt-6 px-5 pb-8">
      <h3 className="mb-3 text-[17px] font-bold text-white">コミュニティ</h3>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
      >
        <div className="space-y-3">
          {/* Active users */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-400/10">
              <Eye className="h-4 w-4 text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/40">今見ている人</p>
              <p className="text-[15px] font-bold text-white">
                <AnimatedCounter value={activeUserCount} />人
              </p>
            </div>
          </div>

          {/* Today's claims */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-300/10">
              <TrendingUp className="h-4 w-4 text-gold-300" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/40">本日の取得数</p>
              <p className="text-[15px] font-bold text-white">
                <AnimatedCounter value={todayClaimCount} />枚
              </p>
            </div>
          </div>

          {/* Recent claimers */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-matcha-400/10">
              <Users className="h-4 w-4 text-matcha-400" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[11px] text-white/40">最近の取得者</p>
              <AvatarStack avatars={fakeAvatars} />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
