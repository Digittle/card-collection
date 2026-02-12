"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, Crown } from "lucide-react";
import { CollabBadge, CollabBadgeTier } from "@/types";

const TIER_CONFIG: Record<CollabBadgeTier, {
  label: string;
  icon: React.ComponentType<any>;
  bgColor: string;
  textColor: string;
  borderColor: string;
  glow: boolean;
}> = {
  participant: {
    label: "共闘参加者",
    icon: Users,
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    borderColor: "border-gray-300",
    glow: false,
  },
  top_contributor: {
    label: "トップ貢献者",
    icon: TrendingUp,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-400",
    glow: false,
  },
  mvp: {
    label: "MVP",
    icon: Crown,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-400",
    glow: true,
  },
};

interface CollabBadgeDisplayProps {
  badges: CollabBadge[];
}

export function CollabBadgeDisplay({ badges }: CollabBadgeDisplayProps) {
  if (badges.length === 0) return null;

  return (
    <div className="space-y-2">
      {badges.map((badge) => {
        const config = TIER_CONFIG[badge.tier];
        const Icon = config.icon;
        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative flex items-center gap-3 rounded-xl border p-3 ${config.bgColor} ${config.borderColor}`}
          >
            {config.glow && (
              <motion.div
                className="absolute -inset-0.5 rounded-xl bg-purple-300 opacity-20"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div className={`relative flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.textColor}`} />
            </div>
            <div className="relative flex-1">
              <p className={`text-sm font-bold ${config.textColor}`}>{config.label}</p>
              <p className="text-[10px] text-gray-400">
                {new Date(badge.earnedAt).toLocaleDateString("ja-JP")} 獲得
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
