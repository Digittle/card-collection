"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Hash, Layers, Share2, ChevronLeft } from "lucide-react";
import { Card, RARITY_CONFIG } from "@/types";
import { getCardById, getUser } from "@/lib/store";
import { LiveViewerBadge } from "@/components/community/LiveViewerBadge";
import { RelatedCards } from "@/components/card/RelatedCards";

const GLOW_CLASS: Record<string, string> = {
  common: "card-glow-common",
  rare: "card-glow-rare",
  epic: "card-glow-epic",
  legendary: "card-glow-legendary",
};

const AMBIENT_GLOW: Record<string, string> = {
  common: "radial-gradient(ellipse at 50% 20%, rgba(191,191,191,0.06) 0%, transparent 70%)",
  rare: "radial-gradient(ellipse at 50% 20%, rgba(100,129,192,0.10) 0%, transparent 70%)",
  epic: "radial-gradient(ellipse at 50% 20%, rgba(176,139,190,0.12) 0%, transparent 70%)",
  legendary: "radial-gradient(ellipse at 50% 20%, rgba(246,171,0,0.15) 0%, transparent 70%)",
};

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const id = params.id as string;
    const foundCard = getCardById(id);

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
          title: `${card.title} - Digital Card Collection`,
          text: `「${card.title}」をゲットしました！ #DigitalCardCollection`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  if (!mounted || !card) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  const config = RARITY_CONFIG[card.rarity];

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#030712]">
      {/* Ambient rarity glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: AMBIENT_GLOW[card.rarity] }}
      />

      {/* Transparent navigation bar */}
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
        {/* Card Image */}
        <motion.div
          className={`relative aspect-[5/7] w-full max-w-[280px] overflow-hidden rounded-2xl border-2 ${GLOW_CLASS[card.rarity]}`}
          style={{ borderColor: config.glowColor }}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="card-holo-overlay" style={{ opacity: 0.4 }} />
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Live viewer badge */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <LiveViewerBadge cardId={card.id} rarity={card.rarity} />
        </motion.div>

        {/* Glass Info Panel */}
        <motion.div
          className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Rarity badge & title */}
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
            {card.claimedAt && (
              <div className="col-span-2 rounded-xl bg-white/5 p-3">
                <Calendar className="mb-1 h-4 w-4 text-white/30" />
                <p className="text-[11px] text-white/30">取得日</p>
                <p className="text-[13px] font-semibold text-white">
                  {new Date(card.claimedAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Cards */}
        <div className="-mx-5 w-[calc(100%+40px)]">
          <RelatedCards cardId={card.id} />
        </div>
      </div>
    </div>
  );
}
