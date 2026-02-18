"use client";

import { motion } from "framer-motion";
import { Lock, Star, Heart } from "lucide-react";
import { CheckinCard } from "@/lib/checkin-store";
import { RARITY_CONFIG } from "@/types";

interface CollectionCardProps {
  card: CheckinCard;
  index: number;
  onClick?: () => void;
}

export function CollectionCard({ card, index, onClick }: CollectionCardProps) {
  const rarityConfig = RARITY_CONFIG[card.rarity];
  const isUnlocked = card.unlocked;

  return (
    <motion.div
      className={`
        relative cursor-pointer select-none
        ${isUnlocked ? 'hover:scale-105' : 'opacity-60'}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isUnlocked ? 1 : 0.6, y: 0 }}
      whileHover={isUnlocked ? { scale: 1.05 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      transition={{ 
        delay: index * 0.1,
        duration: 0.3,
        scale: { duration: 0.2 }
      }}
      onClick={onClick}
    >
      <div 
        className={`
          w-full aspect-[3/4] rounded-2xl overflow-hidden relative
          ${isUnlocked 
            ? `${card.rarity === 'normal' ? 'card-glow-normal' : ''}
               ${card.rarity === 'rare' ? 'card-glow-rare' : ''}
               ${card.rarity === 'sr' ? 'card-glow-sr' : ''}
               ${card.rarity === 'ur' ? 'card-glow-ur' : ''}
               ${card.rarity === 'legend' ? 'card-glow-legend' : ''}`
            : 'shadow-md'
          }
        `}
        style={{
          background: isUnlocked 
            ? `linear-gradient(135deg, ${rarityConfig.color}20, ${rarityConfig.glowColor}10)`
            : 'linear-gradient(135deg, #E5E7EB, #F3F4F6)',
          border: `2px solid ${isUnlocked ? rarityConfig.color : '#D1D5DB'}`,
        }}
      >
        {/* Holographic overlay for unlocked cards */}
        {isUnlocked && <div className="card-holo-overlay" />}
        
        {/* Lock overlay for locked cards */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-xs text-gray-300 font-medium">
                {card.milestone}回で解放
              </div>
            </div>
          </div>
        )}

        {/* Card content */}
        <div className="relative h-full p-3 flex flex-col">
          {/* Rarity indicator */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              {[...Array(rarityConfig.stars)].map((_, i) => (
                <Star 
                  key={i} 
                  className="h-3 w-3 fill-current"
                  style={{ color: isUnlocked ? rarityConfig.color : '#9CA3AF' }}
                />
              ))}
            </div>
            <span 
              className="text-xs font-bold"
              style={{ color: isUnlocked ? rarityConfig.color : '#9CA3AF' }}
            >
              {rarityConfig.labelEn}
            </span>
          </div>

          {/* Card image area */}
          <div className={`
            flex-1 rounded-xl mb-2 flex items-center justify-center
            ${isUnlocked 
              ? 'bg-gradient-to-b from-white/90 to-white/70' 
              : 'bg-gradient-to-b from-gray-200/90 to-gray-300/70'
            }
          `}>
            {isUnlocked ? (
              <div className="text-center">
                <Heart className="h-8 w-8 mx-auto mb-1 text-primary-500" />
                <div className="text-xs text-gray-600">#{card.cardNumber.toString().padStart(3, '0')}</div>
              </div>
            ) : (
              <div className="text-center opacity-50">
                <Heart className="h-8 w-8 mx-auto mb-1 text-gray-400" />
                <div className="text-xs text-gray-400">???</div>
              </div>
            )}
          </div>

          {/* Card info */}
          <div className="text-center">
            <div 
              className="font-bold text-xs mb-1 line-clamp-1"
              style={{ color: isUnlocked ? rarityConfig.color : '#9CA3AF' }}
            >
              {isUnlocked ? card.title : "？？？"}
            </div>
            <div className="text-xs text-gray-500 line-clamp-2 h-8">
              {isUnlocked ? card.description : `${card.milestone}回チェックインで解放されます`}
            </div>
          </div>

          {/* New badge for recently unlocked cards */}
          {isUnlocked && card.unlockedAt && (
            (() => {
              const unlockedDate = new Date(card.unlockedAt);
              const now = new Date();
              const hoursSinceUnlock = (now.getTime() - unlockedDate.getTime()) / (1000 * 60 * 60);
              
              if (hoursSinceUnlock <= 24) {
                return (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    NEW
                  </div>
                );
              }
              return null;
            })()
          )}

          {/* Milestone indicator */}
          <div className={`
            absolute bottom-1 right-1 text-xs px-2 py-1 rounded-full font-medium
            ${isUnlocked 
              ? 'bg-amber-100 text-amber-700' 
              : 'bg-gray-100 text-gray-500'
            }
          `}>
            {card.milestone}
          </div>
        </div>
      </div>
    </motion.div>
  );
}