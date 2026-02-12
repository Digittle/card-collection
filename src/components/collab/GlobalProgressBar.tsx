"use client";

import { motion } from "framer-motion";

interface GlobalProgressBarProps {
  current: number;
  goal: number;
  accentColor: string;
  size?: "sm" | "lg";
}

export function GlobalProgressBar({ current, goal, accentColor, size = "lg" }: GlobalProgressBarProps) {
  const percentage = Math.min(100, Math.round((current / goal) * 100));
  const isLarge = size === "lg";

  return (
    <div className={isLarge ? "space-y-2" : "space-y-1"}>
      <div
        className={`w-full overflow-hidden rounded-full bg-gray-200 ${
          isLarge ? "h-5" : "h-2.5"
        }`}
      >
        <motion.div
          className={`${isLarge ? "h-5" : "h-2.5"} rounded-full`}
          style={{ backgroundColor: accentColor }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {isLarge && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-600">
            {current} / {goal} ポイント
          </span>
          <motion.span
            className="font-bold"
            style={{ color: accentColor }}
            key={percentage}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {percentage}%
          </motion.span>
        </div>
      )}
    </div>
  );
}
