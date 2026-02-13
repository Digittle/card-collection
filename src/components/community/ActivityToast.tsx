"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActivityFeed } from "@/hooks/useActivityFeed";

export function ActivityToast() {
  const { latestItem } = useActivityFeed({ maxItems: 10, intervalRange: [4000, 10000] });
  const [visible, setVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(latestItem);

  useEffect(() => {
    if (latestItem && latestItem !== currentItem) {
      setCurrentItem(latestItem);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [latestItem, currentItem]);

  return (
    <AnimatePresence>
      {visible && currentItem && (
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 right-3 z-30 max-w-[280px] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e]/90 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ backgroundColor: currentItem.userColor }}
            >
              {currentItem.userInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] leading-tight text-white/70">
                {currentItem.message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
