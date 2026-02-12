"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CollabFeedItem } from "@/types";
import { Users, Flag, PartyPopper } from "lucide-react";

interface ActivityFeedProps {
  items: CollabFeedItem[];
  maxDisplay?: number;
}

const TYPE_CONFIG: Record<CollabFeedItem["type"], { icon: React.ReactNode; bgColor: string }> = {
  contribution: { icon: <Users className="h-3.5 w-3.5" />, bgColor: "bg-blue-50 text-blue-500" },
  milestone: { icon: <Flag className="h-3.5 w-3.5" />, bgColor: "bg-amber-50 text-amber-500" },
  completion: { icon: <PartyPopper className="h-3.5 w-3.5" />, bgColor: "bg-green-50 text-green-500" },
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return "たった今";
  if (seconds < 60) return `${seconds}秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

export function ActivityFeed({ items, maxDisplay = 20 }: ActivityFeedProps) {
  const sorted = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxDisplay);

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 text-center text-sm text-gray-400">
        アクティビティはまだありません
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AnimatePresence initial={false}>
        {sorted.map((item) => {
          const config = TYPE_CONFIG[item.type];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-2.5 rounded-lg px-3 py-2 ${
                item.type === "milestone" ? "bg-amber-50/50" :
                item.type === "completion" ? "bg-green-50/50" :
                item.isReal ? "bg-pink-50/30" : "bg-white"
              }`}
            >
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
                {config.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${
                  item.type === "completion" ? "font-bold text-green-700" :
                  item.type === "milestone" ? "font-semibold text-amber-700" :
                  "text-gray-600"
                }`}>
                  {item.message}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  {timeAgo(item.createdAt)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
