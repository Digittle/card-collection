"use client";

import { motion } from "framer-motion";

interface RightsDotsProps {
  total: number;
  consumed: number;
  accentColor?: string;
}

export function RightsDots({
  total,
  consumed,
  accentColor = "#ec6d81",
}: RightsDotsProps) {
  const available = total - consumed;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const isConsumed = i < consumed;

          return (
            <motion.div
              key={i}
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: isConsumed ? "#9ca3af" : accentColor,
                boxShadow: isConsumed
                  ? "none"
                  : `0 0 6px ${accentColor}40`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 300,
                delay: i * 0.05,
              }}
            />
          );
        })}
      </div>
      <span className="text-xs text-gray-400">
        {consumed}/{total} 消費済み
        {available > 0 && (
          <span className="ml-1 font-medium" style={{ color: accentColor }}>
            ・残り{available}
          </span>
        )}
      </span>
    </div>
  );
}
