"use client";

import { Card, RARITY_CONFIG } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SeriesBinderProps {
  seriesName: string;
  cards: Card[];
  ownedIds: Set<string>;
  accentColor: string;
  index: number;
}

function BinderSlot({
  card,
  owned,
}: {
  card: Card;
  owned: boolean;
}) {
  const config = RARITY_CONFIG[card.rarity];

  if (owned) {
    return (
      <Link href={`/card/${card.id}`}>
        <div
          className="aspect-[5/7] relative overflow-hidden rounded-xl border"
          style={{ borderColor: config.glowColor + "66" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${card.memberColor}40 0%, ${card.memberColor}90 100%)`,
            }}
          >
            {card.memberImage && (
              <Image
                src={card.memberImage}
                alt={card.memberName}
                fill
                className="object-cover object-top"
                sizes="120px"
              />
            )}
            <div className="card-holo-overlay" style={{ opacity: 0.25 }} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-6">
              <p className="text-[10px] font-bold leading-tight text-white drop-shadow">
                {card.memberName}
              </p>
              <p className="text-[8px]" style={{ color: config.color }}>
                {"★".repeat(config.stars)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="aspect-[5/7] rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1">
      <Lock className="w-5 h-5 text-gray-300" />
      <p className="text-[10px] text-gray-400 font-medium leading-tight text-center px-1">
        {card.memberName}
      </p>
      <p className="text-[8px] text-gray-300">
        {"★".repeat(config.stars)}
      </p>
    </div>
  );
}

export function SeriesBinder({
  seriesName,
  cards,
  ownedIds,
  accentColor,
  index,
}: SeriesBinderProps) {
  const ownedCount = cards.filter((c) => ownedIds.has(c.id)).length;
  const totalCount = cards.length;
  const isComplete = totalCount > 0 && ownedCount === totalCount;
  const progressPercent = totalCount > 0 ? (ownedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`rounded-2xl bg-white border shadow-sm p-4 ${
        isComplete
          ? "border-2"
          : "border-gray-200"
      }`}
      style={
        isComplete
          ? {
              borderImage: "linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B) 1",
              borderImageSlice: 1,
            }
          : undefined
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">{seriesName}</h3>
        <div className="flex items-center gap-1.5">
          {isComplete && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-amber-700 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300">
              <Sparkles className="w-3 h-3" />
              COMPLETE
            </span>
          )}
          <span className="text-xs font-semibold text-gray-500">
            {ownedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: isComplete ? "#F59E0B" : accentColor,
          }}
        />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {cards.map((card) => (
          <BinderSlot key={card.id} card={card} owned={ownedIds.has(card.id)} />
        ))}
      </div>
    </motion.div>
  );
}
