"use client";

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Coins, Check, ShoppingBag, Camera, X, BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { ALL_CARDS } from "@/lib/cards-data";
import { GROUPS } from "@/lib/groups-data";
import {
  getUser,
  getCoins,
  deductCoins,
  addCard,
  ownsCard,
  getCards,
  updateCardMemo,
  addCardImage,
} from "@/lib/store";
import { Card, RARITY_CONFIG, Rarity, RARITY_ORDER } from "@/types";

type RarityFilter = "all" | Rarity;

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712]" />}>
      <ShopInner />
    </Suspense>
  );
}

function ShopInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<RarityFilter>("all");
  const [coins, setCoinsState] = useState(0);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [purchaseCard, setPurchaseCard] = useState<Card | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    const groupParam = searchParams.get("group");
    if (groupParam && GROUPS.some((g) => g.id === groupParam)) {
      setSelectedGroup(groupParam);
    }
    setCoinsState(getCoins());
    setOwnedIds(new Set(getCards().map((c) => c.id)));
    setMounted(true);
  }, [router, searchParams]);

  const filteredCards = useMemo(() => {
    let cards = ALL_CARDS;
    if (selectedGroup !== "all") {
      cards = cards.filter((c) => c.groupId === selectedGroup);
    }
    if (selectedRarity !== "all") {
      cards = cards.filter((c) => c.rarity === selectedRarity);
    }
    return cards;
  }, [selectedGroup, selectedRarity]);

  const handlePurchase = useCallback(
    (card: Card) => {
      const price = RARITY_CONFIG[card.rarity].shopPrice;
      if (coins < price) return;

      const success = deductCoins(price);
      if (!success) return;

      addCard(card);
      setCoinsState(getCoins());
      setOwnedIds(new Set(getCards().map((c) => c.id)));
      setPurchaseSuccess(true);
    },
    [coins]
  );

  const handleHistoryComplete = useCallback(() => {
    setPurchaseSuccess(false);
    setPurchaseCard(null);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]" />;
  }

  const rarityTabs: { key: RarityFilter; label: string }[] = [
    { key: "all", label: "すべて" },
    ...RARITY_ORDER.map((r) => ({
      key: r as RarityFilter,
      label: RARITY_CONFIG[r].labelEn,
    })),
  ];

  return (
    <AppShell>
      <Header title="ショップ" coins={coins} />

      <div className="px-4 pb-8">
        {/* Group filter pills */}
        <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedGroup("all")}
            className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors"
            style={
              selectedGroup === "all"
                ? { backgroundColor: "#ec6d81", color: "#fff" }
                : {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.4)",
                  }
            }
          >
            すべて
          </button>
          {GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors"
              style={
                selectedGroup === group.id
                  ? { backgroundColor: group.accentColor, color: "#fff" }
                  : {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.4)",
                    }
              }
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Rarity filter tabs */}
        <div className="scrollbar-hide mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {rarityTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedRarity(tab.key)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                selectedRarity === tab.key
                  ? "bg-white/15 text-white"
                  : "bg-white/[0.04] text-white/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        {filteredCards.length > 0 ? (
          <motion.div
            className="mt-4 grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredCards.map((card, i) => {
              const config = RARITY_CONFIG[card.rarity];
              const owned = ownedIds.has(card.id);

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                >
                  <button
                    onClick={() => !owned && setPurchaseCard(card)}
                    disabled={owned}
                    className={`card-glow-${card.rarity} relative aspect-[5/7] w-full overflow-hidden rounded-xl border-2 text-left`}
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
                        sizes="(max-width: 448px) 50vw, 200px"
                      />
                    )}
                    <div className="card-holo-overlay" style={{ opacity: 0.3 }} />

                    {/* Owned overlay */}
                    {owned && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                        <div className="rounded-full bg-white/20 px-3 py-1">
                          <span className="text-[12px] font-bold text-white">
                            取得済み
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bottom info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-10">
                      <p className="text-[13px] font-bold text-white drop-shadow-md">
                        {card.memberName}
                      </p>
                      <p
                        className="text-[10px] leading-none"
                        style={{ color: config.color }}
                      >
                        {"★".repeat(config.stars)}
                      </p>
                      {!owned && (
                        <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gold-300/10 px-2 py-0.5">
                          <Coins className="h-3 w-3 text-gold-300" />
                          <span className="text-[11px] font-bold tabular-nums text-gold-300">
                            {config.shopPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <ShoppingBag className="h-7 w-7 text-white/30" />
            </div>
            <p className="mb-1 text-[15px] font-bold text-white/60">
              カードが見つかりません
            </p>
            <p className="text-center text-[13px] text-white/30">
              フィルターを変更してお試しください
            </p>
          </motion.div>
        )}
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchaseCard && (
          <PurchaseModal
            card={purchaseCard}
            coins={coins}
            purchaseSuccess={purchaseSuccess}
            onPurchase={handlePurchase}
            onClose={() => {
              if (!purchaseSuccess) {
                setPurchaseCard(null);
              }
            }}
            onHistoryComplete={handleHistoryComplete}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function PurchaseModal({
  card,
  coins,
  purchaseSuccess,
  onPurchase,
  onClose,
  onHistoryComplete,
}: {
  card: Card;
  coins: number;
  purchaseSuccess: boolean;
  onPurchase: (card: Card) => void;
  onClose: () => void;
  onHistoryComplete: () => void;
}) {
  const config = RARITY_CONFIG[card.rarity];
  const price = config.shopPrice;
  const canAfford = coins >= price;

  const [step, setStep] = useState<"confirm" | "success" | "history">("confirm");
  const [memo, setMemo] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When purchase succeeds, move to success step
  useEffect(() => {
    if (purchaseSuccess && step === "confirm") {
      setStep("success");
    }
  }, [purchaseSuccess, step]);

  // Auto-transition from success → history after animation
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => setStep("history"), 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxW = 800;
          const scale = Math.min(1, maxW / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL("image/jpeg", 0.8);
          addCardImage(card.id, base64);
          setAttachedImages((prev) => [...prev, base64]);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [card.id]
  );

  const handleSave = useCallback(() => {
    if (memo.trim()) {
      updateCardMemo(card.id, memo.trim());
    }
    onHistoryComplete();
  }, [card.id, memo, onHistoryComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={step === "confirm" ? onClose : undefined}
      />

      {/* Modal content */}
      <motion.div
        className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-[#0a0f1a]/95 backdrop-blur-xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          {step === "success" && (
            <motion.div
              key="success"
              className="flex flex-col items-center px-6 py-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <motion.div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                  delay: 0.1,
                }}
              >
                <Check className="h-8 w-8 text-emerald-400" />
              </motion.div>
              <p className="text-[18px] font-bold text-white">購入完了!</p>
              <p className="mt-1 text-[13px] text-white/50">
                {card.memberName}のカードを獲得しました
              </p>
            </motion.div>
          )}

          {step === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="px-5 pb-5 pt-6"
            >
              {/* Header */}
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-400" />
                <h3 className="text-[16px] font-bold text-white">
                  思い出を記録
                </h3>
              </div>

              {/* Card mini preview */}
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
                <div
                  className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border"
                  style={{
                    background: `linear-gradient(135deg, ${card.memberColor}40 0%, ${card.memberColor}90 100%)`,
                    borderColor: `${card.memberColor}44`,
                  }}
                >
                  {card.memberImage && (
                    <Image
                      src={card.memberImage}
                      alt={card.memberName}
                      fill
                      className="object-cover object-top"
                      sizes="48px"
                    />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">
                    {card.memberName}
                  </p>
                  <p className="text-[11px] text-white/50">{card.title}</p>
                  <p className="text-[11px]" style={{ color: config.color }}>
                    {"★".repeat(config.stars)}
                  </p>
                </div>
              </div>

              {/* Date */}
              <p className="mb-3 text-[12px] text-white/40">
                取得日: {new Date().toLocaleDateString("ja-JP")}
              </p>

              {/* Memo */}
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="この日の思い出を書き留めよう..."
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none transition-all focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30"
              />

              {/* Image attachment */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] py-3 text-[13px] text-white/50 transition-colors active:bg-white/[0.06]"
              >
                <Camera className="h-4 w-4" />
                写真を追加
              </button>

              {/* Attached images preview */}
              {attachedImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {attachedImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={img}
                        alt={`添付${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setAttachedImages((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 py-3 text-[14px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97]"
              >
                保存する
              </button>

              {/* Skip */}
              <button
                onClick={onHistoryComplete}
                className="mt-2 w-full py-2 text-[12px] text-white/30 transition-colors active:text-white/50"
              >
                スキップ
              </button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Card preview */}
              <div className="relative mx-auto mt-6 aspect-[5/7] w-48 overflow-hidden rounded-xl border-2"
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
                    sizes="200px"
                  />
                )}
                <div className="card-holo-overlay" style={{ opacity: 0.3 }} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-8">
                  <p className="text-[14px] font-bold text-white drop-shadow-md">
                    {card.memberName}
                  </p>
                  <p
                    className="text-[11px] leading-none"
                    style={{ color: config.color }}
                  >
                    {"★".repeat(config.stars)}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-4 flex flex-col items-center gap-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-300/10 px-3 py-1">
                  <Coins className="h-4 w-4 text-gold-300" />
                  <span className="text-[15px] font-bold tabular-nums text-gold-300">
                    {price.toLocaleString()}
                  </span>
                </div>
                {!canAfford && (
                  <p className="text-[12px] text-red-400">コインが不足しています</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 px-6 pb-6 pt-4">
                <button
                  onClick={() => onPurchase(card)}
                  disabled={!canAfford}
                  className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 py-3 text-[14px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
                >
                  購入する
                </button>
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-white/[0.06] py-3 text-[14px] font-bold text-white/60 transition-all active:scale-[0.97]"
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
