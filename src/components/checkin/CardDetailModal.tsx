"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Heart, Calendar, Trophy } from "lucide-react";
import { CheckinCard } from "@/lib/checkin-store";
import { RARITY_CONFIG } from "@/types";

interface CardDetailModalProps {
  isOpen: boolean;
  card: CheckinCard | null;
  onClose: () => void;
}

export function CardDetailModal({ isOpen, card, onClose }: CardDetailModalProps) {
  if (!card) return null;

  const rarityConfig = RARITY_CONFIG[card.rarity];
  const unlockedDate = card.unlockedAt ? new Date(card.unlockedAt) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70"
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
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Card display */}
            <div className="text-center mb-6">
              <div 
                className={`
                  w-48 h-64 mx-auto rounded-2xl overflow-hidden relative mb-4
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
                      <Heart className="h-16 w-16 mx-auto mb-2 text-primary-500" />
                      <div className="text-sm text-gray-600">#{card.cardNumber.toString().padStart(3, '0')}</div>
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
                  </div>
                </div>

                {/* Milestone badge */}
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {card.milestone}回達成
                </div>
              </div>
            </div>

            {/* Card details */}
            <div className="space-y-4">
              {/* Title and description */}
              <div className="text-center">
                <h2 
                  className="text-xl font-bold mb-2"
                  style={{ color: rarityConfig.color }}
                >
                  {card.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Rarity info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">レアリティ</span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-bold"
                      style={{ color: rarityConfig.color }}
                    >
                      {rarityConfig.label}
                    </span>
                    <div className="flex">
                      {[...Array(rarityConfig.stars)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="h-4 w-4 fill-current"
                          style={{ color: rarityConfig.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">達成条件</span>
                  <div className="flex items-center gap-2 text-amber-600">
                    <Trophy className="h-4 w-4" />
                    <span className="font-bold">{card.milestone}回チェックイン</span>
                  </div>
                </div>
              </div>

              {/* Unlock date */}
              {unlockedDate && (
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">獲得日時</span>
                  </div>
                  <div className="mt-1 text-green-800 font-medium">
                    {unlockedDate.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}

              {/* Series info */}
              <div className="text-center pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-1">{card.series}</div>
                <div className="text-xs text-gray-400">
                  No.{card.cardNumber} / {card.totalInSeries}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}