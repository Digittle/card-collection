"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  userName: string;
  totalPoints: number;
  rank: number;
  isCurrentUser: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  maxDisplay?: number;
}

const RANK_ICONS: Record<number, { icon: React.ReactNode; color: string }> = {
  1: { icon: <Trophy className="h-4 w-4" />, color: "text-amber-500" },
  2: { icon: <Medal className="h-4 w-4" />, color: "text-gray-400" },
  3: { icon: <Award className="h-4 w-4" />, color: "text-amber-700" },
};

export function Leaderboard({ entries, maxDisplay = 10 }: LeaderboardProps) {
  const displayEntries = entries.slice(0, maxDisplay);

  if (displayEntries.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 text-center text-sm text-gray-400">
        まだ貢献者がいません
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {displayEntries.map((entry, i) => {
        const rankInfo = RANK_ICONS[entry.rank];
        return (
          <motion.div
            key={entry.userName}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
              entry.isCurrentUser
                ? "bg-pink-50 ring-1 ring-pink-200"
                : "bg-white"
            }`}
          >
            <span className={`flex w-6 items-center justify-center ${rankInfo?.color || "text-gray-400"}`}>
              {rankInfo ? rankInfo.icon : <span className="text-xs font-medium">{entry.rank}</span>}
            </span>
            <span className={`flex-1 text-sm ${entry.isCurrentUser ? "font-bold text-gray-900" : "text-gray-700"}`}>
              {entry.userName}
              {entry.isCurrentUser && (
                <span className="ml-1.5 text-xs text-pink-500">あなた</span>
              )}
            </span>
            <span className="text-sm font-semibold text-gray-600">
              {entry.totalPoints}pt
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
