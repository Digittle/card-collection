"use client";

import { motion } from "framer-motion";
import { GROUPS } from "@/lib/groups-data";
import { getCardsByGroup } from "@/lib/cards-data";
import { getCards } from "@/lib/store";

function ProgressRing({
  progress,
  color,
  radius = 30,
  strokeWidth = 4,
}: {
  progress: number;
  color: string;
  radius?: number;
  strokeWidth?: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const size = (radius + strokeWidth) * 2;

  return (
    <svg width={size} height={size} className="shrink-0">
      {/* Background track */}
      <circle
        cx={radius + strokeWidth}
        cy={radius + strokeWidth}
        r={radius}
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={radius + strokeWidth}
        cy={radius + strokeWidth}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
        className="transition-all duration-700"
      />
      {/* Percentage label */}
      <text
        x={radius + strokeWidth}
        y={radius + strokeWidth}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#1a1a2e"
        fontSize="13"
        fontWeight="bold"
      >
        {Math.round(progress * 100)}%
      </text>
    </svg>
  );
}

export function CollectionProgress() {
  const ownedCards = getCards();

  return (
    <section className="mt-6 px-4">
      <h2 className="mb-3 text-[15px] font-bold text-gray-900">
        コレクション進捗
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {GROUPS.map((group, i) => {
          const total = getCardsByGroup(group.id).length;
          const owned = ownedCards.filter(
            (c) => c.groupId === group.id
          ).length;
          const progress = total > 0 ? owned / total : 0;

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
            >
              <ProgressRing progress={progress} color={group.accentColor} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-gray-900">
                  {group.name}
                </p>
                <p
                  className="text-[12px] font-semibold"
                  style={{ color: group.accentColor }}
                >
                  {owned}/{total}枚
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
