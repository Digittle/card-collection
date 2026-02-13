"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Avatar {
  name: string;
  initial: string;
  color: string;
}

interface AvatarStackProps {
  avatars: Avatar[];
  max?: number;
}

export function AvatarStack({ avatars, max = 5 }: AvatarStackProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        <AnimatePresence mode="popLayout">
          {visible.map((avatar, i) => (
            <motion.div
              key={`${avatar.name}-${i}`}
              initial={{ opacity: 0, x: 16, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.03 }}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#030712] text-[11px] font-bold text-white"
              style={{ backgroundColor: avatar.color, zIndex: max - i }}
            >
              {avatar.initial}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {overflow > 0 && (
        <span className="ml-1.5 text-[11px] font-medium text-white/40">
          +{overflow}
        </span>
      )}
    </div>
  );
}
