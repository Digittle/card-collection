"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, Share2, Users, Hash, Layers, Calendar, User } from "lucide-react";
import { Card, OwnedCard, RARITY_CONFIG } from "@/types";
import { getCardById as storeGetCardById, getUser } from "@/lib/store";
import { getCardById as catalogGetCardById } from "@/lib/cards-data";

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<Card | OwnedCard | null>(null);
  const [mounted, setMounted] = useState(false);

  const viewerCount = useMemo(() => Math.floor(Math.random() * 26) + 5, []);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const id = params.id as string;
    const ownedCard = storeGetCardById(id);
    const catalogCard = catalogGetCardById(id);
    const foundCard = ownedCard || catalogCard;

    if (!foundCard) {
      router.replace("/collection");
      return;
    }

    setCard(foundCard);
    setMounted(true);
  }, [params.id, router]);

  const handleShare = async () => {
    if (!card) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.title} - STARTO Card Collection`,
          text: `「${card.title}」をゲットしました！`,
          url: window.location.href,
        });
      } catch {
        // cancelled
      }
    }
  };

  if (!mounted || !card) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  const config = RARITY_CONFIG[card.rarity];
  const isOwned = "obtainedAt" in card;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#030712]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${card.memberColor}18 0%, transparent 70%)`,
        }}
      />

      {/* Transparent nav */}
      <div className="absolute inset-x-0 top-0 z-50 mx-auto max-w-md">
        <div className="flex h-14 items-center justify-between px-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-colors active:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-colors active:bg-white/20"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-5 pb-24 pt-20">
        {/* Card visual */}
        <motion.div
          className={`card-glow-${card.rarity} relative aspect-[5/7] w-full max-w-[280px] overflow-hidden rounded-2xl border-2`}
          style={{
            background: `linear-gradient(135deg, ${card.memberColor}40 0%, ${card.memberColor}90 100%)`,
            borderColor: `${config.glowColor}66`,
          }}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {card.memberImage && (
            <Image
              src={card.memberImage}
              alt={card.memberName}
              fill
              className="object-cover object-top"
              sizes="280px"
              priority
            />
          )}
          <div className="card-holo-overlay" style={{ opacity: 0.4 }} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-20">
            <p className="text-[28px] font-bold leading-tight text-white drop-shadow-lg">
              {card.memberName}
            </p>
            <p className="mt-1 text-[13px] text-white/70 drop-shadow-md">{card.title}</p>
            <p className="mt-1 text-[14px]" style={{ color: config.color }}>
              {"★".repeat(config.stars)}
            </p>
          </div>
        </motion.div>

        {/* Viewer count */}
        <motion.div
          className="mt-4 flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[12px] text-white/50">
            今{viewerCount}人が見ています
          </span>
        </motion.div>

        {/* Glass info panel */}
        <motion.div
          className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Rarity badge */}
          <div className="text-center">
            <span
              className="mb-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: `${config.glowColor}22`,
                color: config.glowColor,
              }}
            >
              {config.label}
            </span>
            <h2 className="mt-2 text-[26px] font-bold text-white">
              {card.title}
            </h2>
          </div>

          {/* Description */}
          <p className="mt-3 text-center text-[14px] leading-relaxed text-white/50">
            {card.description}
          </p>

          {/* Meta grid */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <Users className="mb-1 h-4 w-4 text-white/30" />
              <p className="text-[11px] text-white/30">グループ</p>
              <p className="text-[13px] font-semibold text-white">
                {card.groupName}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <User className="mb-1 h-4 w-4 text-white/30" />
              <p className="text-[11px] text-white/30">メンバー</p>
              <p className="text-[13px] font-semibold text-white">
                {card.memberName}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <Layers className="mb-1 h-4 w-4 text-white/30" />
              <p className="text-[11px] text-white/30">シリーズ</p>
              <p className="text-[13px] font-semibold text-white">
                {card.series}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <Hash className="mb-1 h-4 w-4 text-white/30" />
              <p className="text-[11px] text-white/30">カード番号</p>
              <p className="text-[13px] font-semibold text-white">
                #{card.cardNumber}/{card.totalInSeries}
              </p>
            </div>
            {isOwned && (
              <div className="col-span-2 rounded-xl bg-white/5 p-3">
                <Calendar className="mb-1 h-4 w-4 text-white/30" />
                <p className="text-[11px] text-white/30">取得日</p>
                <p className="text-[13px] font-semibold text-white">
                  {new Date((card as OwnedCard).obtainedAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
