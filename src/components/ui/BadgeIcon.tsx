"use client";

import { motion } from "framer-motion";
import {
  Footprints,
  LayoutGrid,
  Trophy,
  Star,
  Crown,
  ArrowLeftRight,
  Zap,
  Award,
  Lock,
} from "lucide-react";
import type { Badge } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Footprints,
  LayoutGrid,
  Trophy,
  Star,
  Crown,
  ArrowLeftRight,
  Zap,
  Award,
};

const TIER_STYLES: Record<
  Badge["tier"],
  {
    gradient: string;
    border: string;
    glow: string;
    iconColor: string;
  }
> = {
  bronze: {
    gradient: "from-amber-700 to-amber-600",
    border: "border-amber-600",
    glow: "rgba(180, 83, 9, 0.3)",
    iconColor: "text-white",
  },
  silver: {
    gradient: "from-gray-400 to-gray-300",
    border: "border-gray-400",
    glow: "rgba(156, 163, 175, 0.35)",
    iconColor: "text-white",
  },
  gold: {
    gradient: "from-yellow-500 to-amber-400",
    border: "border-amber-400",
    glow: "rgba(245, 158, 11, 0.4)",
    iconColor: "text-white",
  },
  platinum: {
    gradient: "from-gray-200 to-white",
    border: "border-gray-300",
    glow: "rgba(229, 231, 235, 0.6)",
    iconColor: "text-gray-600",
  },
};

const SIZE_MAP = {
  sm: { container: 40, icon: 18, label: "text-[10px]" },
  md: { container: 56, icon: 24, label: "text-xs" },
  lg: { container: 72, icon: 32, label: "text-sm" },
};

interface BadgeIconProps {
  badge: Badge;
  earned: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function BadgeIcon({
  badge,
  earned,
  size = "md",
  showLabel = false,
}: BadgeIconProps) {
  const tierStyle = TIER_STYLES[badge.tier];
  const sizeConfig = SIZE_MAP[size];
  const IconComponent = ICON_MAP[badge.iconName] || Award;

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 200 }}
    >
      <div
        className={`relative flex items-center justify-center rounded-full border-2 bg-gradient-to-br ${
          earned
            ? `${tierStyle.gradient} ${tierStyle.border}`
            : "from-gray-200 to-gray-100 border-gray-200"
        }`}
        style={{
          width: sizeConfig.container,
          height: sizeConfig.container,
          boxShadow: earned ? `0 0 12px ${tierStyle.glow}` : "none",
          filter: earned ? "none" : "grayscale(1)",
          opacity: earned ? 1 : 0.4,
        }}
      >
        {earned ? (
          <IconComponent
            className={tierStyle.iconColor}
            style={{
              width: sizeConfig.icon,
              height: sizeConfig.icon,
            }}
          />
        ) : (
          <Lock
            className="text-gray-400"
            style={{
              width: sizeConfig.icon * 0.7,
              height: sizeConfig.icon * 0.7,
            }}
          />
        )}
      </div>

      {showLabel && (
        <span
          className={`max-w-[80px] truncate text-center font-medium ${sizeConfig.label} ${
            earned ? "text-gray-700" : "text-gray-400"
          }`}
        >
          {badge.title}
        </span>
      )}
    </motion.div>
  );
}
