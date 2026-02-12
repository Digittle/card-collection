"use client";

import { motion } from "framer-motion";

export function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
          animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
      </span>
      <span className="text-xs font-semibold text-green-600">LIVE</span>
    </span>
  );
}
