"use client";

import { motion } from "framer-motion";
import { Flame, Calendar, Trophy, Target } from "lucide-react";

interface CheckinStatsProps {
  totalCount: number;
  streak: number;
  todaysCount: number;
  nextMilestone?: {
    milestone: number;
    title: string;
    remaining: number;
  };
}

export function CheckinStats({ totalCount, streak, todaysCount, nextMilestone }: CheckinStatsProps) {
  const progress = nextMilestone ? (totalCount / nextMilestone.milestone) * 100 : 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-amber-500" />
        <h3 className="font-bold text-lg text-gray-900">チェックイン記録</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-6 w-6 text-primary-500" />
          </div>
          <div className="text-2xl font-bold text-primary-600">{totalCount}</div>
          <div className="text-sm text-gray-600">総チェックイン</div>
        </motion.div>

        <motion.div
          className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center mb-2">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{streak}</div>
          <div className="text-sm text-gray-600">連続日数</div>
        </motion.div>
      </div>

      {/* Today's count */}
      {todaysCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">
              今日は{todaysCount}回チェックインしました！
            </span>
          </div>
        </div>
      )}

      {/* Next milestone */}
      {nextMilestone && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-gray-900">次の目標</span>
            </div>
            <span className="text-sm text-gray-500">
              あと{nextMilestone.remaining}回
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{nextMilestone.title}</span>
              <span className="text-gray-500">
                {totalCount}/{nextMilestone.milestone}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Achievement message */}
      {!nextMilestone && (
        <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
          <div className="text-2xl mb-2">🏆</div>
          <div className="font-bold text-amber-700 mb-1">全ての目標を達成！</div>
          <div className="text-sm text-amber-600">あなたは真の推しファンです！</div>
        </div>
      )}
    </div>
  );
}