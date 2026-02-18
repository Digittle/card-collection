"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Heart } from "lucide-react";
import { CheckinEntry } from "@/lib/checkin-store";

interface CheckinHistoryProps {
  history: CheckinEntry[];
  limit?: number;
}

export function CheckinHistory({ history, limit = 10 }: CheckinHistoryProps) {
  const displayHistory = limit ? history.slice(0, limit) : history;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "今日";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "昨日";
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (displayHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>まだチェックインがありません</p>
        <p className="text-sm">推し活を記録してみましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary-500" />
        <h3 className="font-bold text-lg">チェックイン履歴</h3>
      </div>

      <div className="space-y-2">
        {displayHistory.map((entry, index) => (
          <motion.div
            key={entry.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-amber-500 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    推し活チェックイン
                  </div>
                  {entry.note && (
                    <div className="text-sm text-gray-600">
                      {entry.note}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="font-medium">{formatDate(entry.timestamp)}</div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatTime(entry.timestamp)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {limit && history.length > limit && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            他 {history.length - limit} 件のチェックイン
          </p>
        </div>
      )}
    </div>
  );
}