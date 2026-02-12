"use client";

import { motion } from "framer-motion";
import { Users, Crown } from "lucide-react";
import { CollaborativeProgram, CollabProgramProgress } from "@/types";
import { LiveDot } from "./LiveDot";
import { GlobalProgressBar } from "./GlobalProgressBar";

// Icon map for collab programs
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Users,
  Crown,
};

interface CollabProgramCardProps {
  program: CollaborativeProgram;
  progress: CollabProgramProgress | null;
  onClick: () => void;
}

export function CollabProgramCard({ program, progress, onClick }: CollabProgramCardProps) {
  const current = (progress?.realPoints || 0) + (progress?.simulatedPoints || 0);
  const isCompleted = progress?.status === "completed";
  const IconComponent = ICON_MAP[program.iconName] || Users;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm"
    >
      {/* Accent top border */}
      <div className="h-1" style={{ backgroundColor: program.accentColor }} />

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${program.accentColor}15` }}
            >
              <IconComponent className="h-5 w-5" style={{ color: program.accentColor }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{program.title}</h3>
              <p className="text-[10px] text-gray-400">共闘プログラム</p>
            </div>
          </div>
          {!isCompleted && <LiveDot />}
          {isCompleted && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
              達成
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <GlobalProgressBar
          current={current}
          goal={program.goalPoints}
          accentColor={program.accentColor}
          size="sm"
        />

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {current}/{program.goalPoints} ポイント
          </span>
          {progress && progress.realPoints > 0 && (
            <span className="text-[10px] font-medium" style={{ color: program.accentColor }}>
              あなたの貢献: {progress.realPoints}pt
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
