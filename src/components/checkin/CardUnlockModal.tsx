"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Star, Heart } from "lucide-react";
import { CheckinCard } from "@/lib/checkin-store";
import { RARITY_CONFIG } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CardUnlockModalProps {
  isOpen: boolean;
  cards: CheckinCard[];
  onClose: () => void;
}

function UnlockCard({ card, delay }: { card: CheckinCard; delay: number }) {
  const rarityConfig = RARITY_CONFIG[card.rarity];
  
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0, rotateY: 180, opacity: 0 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.23, 1, 0.32, 1],
        rotateY: { duration: 0.6 }
      }}
    >
      {/* Card container */}
      <div 
        className={`
          relative w-48 h-64 rounded-2xl overflow-hidden
          ${card.rarity === 'normal' ? 'card-glow-normal' : ''}
          ${card.rarity === 'rare' ? 'card-glow-rare' : ''}
          ${card.rarity === 'sr' ? 'card-glow-sr' : ''}
          ${card.rarity === 'ur' ? 'card-glow-ur' : ''}
          ${card.rarity === 'legend' ? 'card-glow-legend' : ''}
        `}
        style={{
          background: `linear-gradient(135deg, ${rarityConfig.color}20, ${rarityConfig.glowColor}10)`,
          border: `2px solid ${rarityConfig.color}`,
        }}
      >
        {/* Holographic overlay */}
        <div className="card-holo-overlay" />
        
        {/* Card content */}
        <div className="relative h-full p-4 flex flex-col">
          {/* Rarity indicator */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(rarityConfig.stars)].map((_, i) => (
              <Star 
                key={i} 
                className="h-4 w-4 fill-current"
                style={{ color: rarityConfig.color }}
              />
            ))}
            <span 
              className="text-xs font-bold ml-1"
              style={{ color: rarityConfig.color }}
            >
              {rarityConfig.labelEn}
            </span>
          </div>

          {/* Card image area */}
          <div className="flex-1 bg-gradient-to-b from-white/90 to-white/70 rounded-xl mb-3 flex items-center justify-center">
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto mb-2 text-primary-500" />
              <div className="text-xs text-gray-600">#{card.cardNumber.toString().padStart(3, '0')}</div>
            </div>
          </div>

          {/* Card info */}
          <div className="text-center">
            <div 
              className="font-bold text-sm mb-1"
              style={{ color: rarityConfig.color }}
            >
              {card.title}
            </div>
            <div className="text-xs text-gray-600 line-clamp-2">
              {card.description}
            </div>
          </div>
        </div>

        {/* Milestone badge */}
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          {card.milestone}回達成
        </div>
      </div>

      {/* Floating sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${20 + (i % 4) * 30}%`,
            top: `${10 + Math.floor(i / 4) * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + i * 0.2,
            repeat: Infinity,
            delay: delay + i * 0.1,
            ease: "easeInOut",
          }}
        >
          <Sparkles 
            className="h-4 w-4"
            style={{ color: rarityConfig.glowColor }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CardUnlockModal({ isOpen, cards, onClose }: CardUnlockModalProps) {
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (isOpen && cards.length > 0) {
      const timer = setTimeout(() => setShowCongrats(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, cards.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            className="relative bg-white rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                🎉 カード獲得！
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600"
              >
                マイルストーン達成おめでとうございます！
              </motion.p>
            </div>

            {/* Cards */}
            <div className="flex flex-col items-center gap-6">
              {cards.map((card, index) => (
                <UnlockCard
                  key={card.id}
                  card={card}
                  delay={1 + index * 0.3}
                />
              ))}
            </div>

            {/* Congratulations text */}
            <AnimatePresence>
              {showCongrats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-6 pt-6 border-t border-gray-100"
                >
                  <p className="text-lg font-bold text-primary-500 mb-2">
                    素晴らしい継続力です！
                  </p>
                  <p className="text-sm text-gray-600">
                    これからも推し活を楽しんでくださいね✨
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={onClose}
              className="w-full mt-6 py-3 bg-gradient-to-r from-primary-500 to-amber-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              続ける
            </motion.button>
          </motion.div>

          {/* Background particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`bg-particle-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: "4px",
                height: "4px",
                background: "gold",
                borderRadius: "50%",
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}