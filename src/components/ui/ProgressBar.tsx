"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const isComplete = current === total && total > 0;

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-gray-400">{label}</span>
          <span>
            {isComplete ? (
              <span className="font-bold text-matcha-500">
                コンプリート！
              </span>
            ) : (
              <span className="tabular-nums text-gray-500">
                {current}/{total}
              </span>
            )}
          </span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className={`h-full rounded-full ${
            isComplete
              ? "bg-gradient-to-r from-matcha-500 via-matcha-400 to-matcha-300"
              : "progress-bar-active bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
    </div>
  );
}
