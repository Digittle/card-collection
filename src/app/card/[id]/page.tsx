"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Hash, Layers, Share2, ArrowLeft } from "lucide-react";
import { Card, RARITY_CONFIG } from "@/types";
import { getCardById, getUser } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { AppShell } from "@/components/layout/AppShell";

const GLOW_CLASS: Record<string, string> = {
  common: "card-glow-common",
  rare: "card-glow-rare",
  epic: "card-glow-epic",
  legendary: "card-glow-legendary",
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
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  const config = RARITY_CONFIG[card.rarity];

  return (
    <AppShell>
      <Header
        title="カード詳細"
        showBack
        rightAction={
          <button
            onClick={handleShare}
            className="flex h-12 w-12 items-center justify-center rounded-full text-gray-500 transition-colors hover:text-gray-900 active:bg-black/5"
          >
            <Share2 className="h-5 w-5" />
          </button>
        }
      />

      <div className="relative flex flex-col items-center px-4 py-6">
        {/* Background glow matching card rarity */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-10 blur-[100px]"
          style={{ background: config.glowColor }}
        />

        {/* Card Image */}
        <motion.div
          className={`relative mb-6 aspect-[5/7] w-full max-w-[300px] overflow-hidden rounded-2xl border-2 ${GLOW_CLASS[card.rarity]}`}
          style={{ borderColor: config.glowColor }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Holo overlay */}
          <div className="card-holo-overlay" style={{ opacity: 0.4 }} />
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Card Info */}
        <motion.div
          className="relative z-10 w-full max-w-sm space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Rarity badge & title */}
          <div className="text-center">
            <span
              className={`mb-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${config.textColor} bg-gradient-to-r ${config.bgGradient} ${
                card.rarity === "legendary" ? "badge-legendary" : ""
              }`}
            >
              {config.label}
            </span>
            <h2 className="mt-2 text-[24px] font-bold text-gray-900">
              {card.title}
            </h2>
          </div>

          {/* Description */}
          <p className="text-center text-[14px] leading-[1.7] text-gray-500">
            {card.description}
          </p>

          {/* Meta info card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <Layers className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">シリーズ</p>
                  <p className="text-[13px] font-semibold text-gray-700">
                    {card.series}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <Hash className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">カード番号</p>
                  <p className="text-[13px] font-semibold text-gray-700">
                    #{card.cardNumber}/{card.totalInSeries}
                  </p>
                </div>
              </div>
              {card.claimedAt && (
                <div className="col-span-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">取得日</p>
                    <p className="text-[13px] font-semibold text-gray-700">
                      {new Date(card.claimedAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Back to collection */}
          <button
            onClick={() => router.push("/collection")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-[14px] font-medium text-gray-500 transition-all active:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            コレクションに戻る
          </button>
        </motion.div>
      </div>
    </AppShell>
  );
}
