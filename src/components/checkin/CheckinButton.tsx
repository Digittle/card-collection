"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface CheckinButtonProps {
  canCheckin: boolean;
  onCheckin: () => void;
  isLoading?: boolean;
}

export function CheckinButton({ canCheckin, onCheckin, isLoading }: CheckinButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (!canCheckin || isLoading) return;
    setIsPressed(true);
    onCheckin();
    setTimeout(() => setIsPressed(false), 2000);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Floating sparkles when available */}
      {canCheckin && !isPressed && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 2) * 30}%`,
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
            </motion.div>
          ))}
        </>
      )}

      <motion.button
        onClick={handleClick}
        disabled={!canCheckin || isLoading}
        className={`
          relative overflow-hidden rounded-2xl px-12 py-6 text-white font-bold text-lg shadow-2xl
          ${canCheckin 
            ? "bg-gradient-to-r from-primary-500 to-amber-500 shadow-amber-500/20 active:scale-95" 
            : "bg-gray-300 shadow-gray-300/20 cursor-not-allowed"
          }
          transition-all duration-300
        `}
        whileTap={canCheckin ? { scale: 0.95 } : {}}
        animate={canCheckin ? {
          boxShadow: [
            "0 0 20px rgba(246, 171, 0, 0.3)",
            "0 0 30px rgba(246, 171, 0, 0.5)",
            "0 0 20px rgba(246, 171, 0, 0.3)",
          ],
        } : {}}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Button content */}
        <div className="relative z-10 flex items-center gap-3">
          {isPressed ? (
            <CheckCircle2 className="h-6 w-6 text-green-200" />
          ) : canCheckin ? (
            <Heart className="h-6 w-6" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-gray-500" />
          )}
          <span>
            {isPressed 
              ? "チェックイン完了！" 
              : canCheckin 
                ? "推し活チェックイン" 
                : "今日はチェックイン済み"
            }
          </span>
        </div>

        {/* Animated background when active */}
        {canCheckin && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-400"
            animate={{
              opacity: [0.0, 0.2, 0.0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Sparkle particles on press */}
        {isPressed && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "50%",
                  width: "4px",
                  height: "4px",
                  background: "white",
                  borderRadius: "50%",
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: (Math.cos((i / 12) * Math.PI * 2) * 60),
                  y: (Math.sin((i / 12) * Math.PI * 2) * 60),
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </motion.button>
    </div>
  );
}