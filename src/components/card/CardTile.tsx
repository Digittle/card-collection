"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, RARITY_CONFIG } from "@/types";

interface CardTileProps {
  card: Card;
  owned: boolean;
  size?: "sm" | "md";
}

export function CardTile({ card, owned, size = "md" }: CardTileProps) {
  const config = RARITY_CONFIG[card.rarity];

  if (!owned) {
    return (
      <div className="relative aspect-[5/7] w-full overflow-hidden rounded-xl border border-white/8 bg-white/[0.04]">
        <div className="flex h-full flex-col items-center justify-center gap-1">
          <span className="text-2xl text-white/15">?</span>
          <Lock className="h-4 w-4 text-white/10" />
        </div>
      </div>
    );
  }

  const nameSize = size === "sm" ? "text-[10px]" : "text-[12px]";
  const starSize = size === "sm" ? "text-[8px]" : "text-[10px]";

  return (
    <Link href={`/card/${card.id}`}>
      <div
        className={`card-glow-${card.rarity} relative aspect-[5/7] w-full overflow-hidden rounded-xl border-2`}
        style={{
          background: `linear-gradient(135deg, ${card.memberColor}40 0%, ${card.memberColor}90 100%)`,
          borderColor: `${card.memberColor}66`,
        }}
      >
        {card.memberImage && (
          <Image
            src={card.memberImage}
            alt={card.memberName}
            fill
            className="object-cover object-top"
            sizes="(max-width: 448px) 33vw, 150px"
          />
        )}
        <div className="card-holo-overlay" style={{ opacity: 0.3 }} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-8">
          <p className={`${nameSize} font-bold text-white drop-shadow-md`}>
            {card.memberName}
          </p>
          <p className={`${starSize} leading-none`} style={{ color: config.color }}>
            {"★".repeat(config.stars)}
          </p>
        </div>
      </div>
    </Link>
  );
}
