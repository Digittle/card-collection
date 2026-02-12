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
  CheckCircle2,
  Coins,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Program, UserProgramProgress } from "@/types";

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

const CATEGORY_LABEL: Record<Program["category"], string> = {
  collection: "コレクション",
  challenge: "チャレンジ",
  special: "スペシャル",
};

interface ProgramCardProps {
  program: Program;
  progress?: UserProgramProgress;
  totalRequirements: number;
  filledRequirements: number;
  onClick: () => void;
}

export function ProgramCard({
  program,
  progress,
  totalRequirements,
  filledRequirements,
  onClick,
}: ProgramCardProps) {
  const isCompleted = progress?.isCompleted ?? false;
  const IconComponent = ICON_MAP[program.iconName] || Award;

  return (
    <motion.div
      className="relative w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow active:shadow-md"
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: program.accentColor }}
      />

      <div className="p-5 pl-6">
        {/* Header row: icon + title + category */}
        <div className="flex items-start gap-3">
          {/* Icon circle */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${program.accentColor}18`,
            }}
          >
            <IconComponent
              className="h-5 w-5"
              style={{ color: program.accentColor }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-bold text-gray-900">
                {program.title}
              </h3>
              {isCompleted && (
                <span className="shrink-0 rounded-full bg-matcha-50 px-2 py-0.5 text-[10px] font-bold text-matcha-500">
                  完了
                </span>
              )}
            </div>

            {/* Category tag */}
            <span className="mt-0.5 inline-block text-xs text-gray-400">
              {CATEGORY_LABEL[program.category]}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <ProgressBar
            current={filledRequirements}
            total={totalRequirements}
            label="進捗"
          />
        </div>

        {/* Rewards row */}
        {(program.rewardBadgeId || program.rewardCoins) && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-gray-400">報酬:</span>
            {program.rewardBadgeId && (
              <div className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-gold-300" />
                <span className="text-xs font-medium text-gray-600">
                  バッジ
                </span>
              </div>
            )}
            {program.rewardCoins && (
              <div className="flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-gold-300" />
                <span className="text-xs font-medium text-gray-600">
                  {program.rewardCoins}コイン
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completed overlay */}
      {isCompleted && (
        <motion.div
          className="pointer-events-none absolute right-4 top-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
        >
          <CheckCircle2 className="h-6 w-6 text-matcha-400" />
        </motion.div>
      )}
    </motion.div>
  );
}
