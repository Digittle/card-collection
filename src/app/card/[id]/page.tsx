"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, Share2, Users, Hash, Layers, Calendar, User, BookOpen, Camera, X, Palette } from "lucide-react";
import { Card, OwnedCard, RARITY_CONFIG } from "@/types";
import { getCardById as storeGetCardById, getUser, updateCardMemo, addCardImage, removeCardImage } from "@/lib/store";
import { getCardById as catalogGetCardById } from "@/lib/cards-data";
import { CardPhotoCamera } from "@/components/card/CardPhotoCamera";
import { CardDrawingCanvas } from "@/components/card/CardDrawingCanvas";

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<Card | OwnedCard | null>(null);
  const [mounted, setMounted] = useState(false);
  const [memo, setMemo] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (ownedCard) {
      setMemo(ownedCard.memo || "");
      setAttachedImages(ownedCard.attachedImages || []);
    }
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

  const reloadCard = useCallback(() => {
    const id = params.id as string;
    const ownedCard = storeGetCardById(id);
    if (ownedCard) {
      setCard(ownedCard);
      setAttachedImages(ownedCard.attachedImages || []);
    }
  }, [params.id]);

  const handleMemoBlur = useCallback(() => {
    if (!card) return;
    updateCardMemo(card.id, memo);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  }, [card, memo]);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!card || !e.target.files?.[0]) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL("image/jpeg", 0.8);
            addCardImage(card.id, base64);
            reloadCard();
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [card, reloadCard]
  );

  const handleDeleteImage = useCallback(
    (index: number) => {
      if (!card) return;
      removeCardImage(card.id, index);
      reloadCard();
      setDeleteConfirm(null);
    },
    [card, reloadCard]
  );

  if (!mounted || !card) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  const config = RARITY_CONFIG[card.rarity];
  const isOwned = "obtainedAt" in card;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F4F5F6]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${card.memberColor}10 0%, transparent 70%)`,
        }}
      />

      {/* Transparent nav */}
      <div className="absolute inset-x-0 top-0 z-50 mx-auto max-w-md">
        <div className="flex h-14 items-center justify-between px-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-gray-600 backdrop-blur-md transition-colors active:bg-black/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-gray-600 backdrop-blur-md transition-colors active:bg-black/10"
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
          className="mt-4 flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[12px] text-gray-500">
            今{viewerCount}人が見ています
          </span>
        </motion.div>

        {/* Glass info panel */}
        <motion.div
          className="mt-6 w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
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
            <h2 className="mt-2 text-[26px] font-bold text-gray-900">
              {card.title}
            </h2>
          </div>

          {/* Description */}
          <p className="mt-3 text-center text-[14px] leading-relaxed text-gray-500">
            {card.description}
          </p>

          {/* Meta grid */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <Users className="mb-1 h-4 w-4 text-gray-400" />
              <p className="text-[11px] text-gray-400">グループ</p>
              <p className="text-[13px] font-semibold text-gray-900">
                {card.groupName}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <User className="mb-1 h-4 w-4 text-gray-400" />
              <p className="text-[11px] text-gray-400">メンバー</p>
              <p className="text-[13px] font-semibold text-gray-900">
                {card.memberName}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <Layers className="mb-1 h-4 w-4 text-gray-400" />
              <p className="text-[11px] text-gray-400">シリーズ</p>
              <p className="text-[13px] font-semibold text-gray-900">
                {card.series}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <Hash className="mb-1 h-4 w-4 text-gray-400" />
              <p className="text-[11px] text-gray-400">カード番号</p>
              <p className="text-[13px] font-semibold text-gray-900">
                #{card.cardNumber}/{card.totalInSeries}
              </p>
            </div>
            {isOwned && (
              <div className="col-span-2 rounded-xl bg-gray-50 p-3">
                <Calendar className="mb-1 h-4 w-4 text-gray-400" />
                <p className="text-[11px] text-gray-400">取得日</p>
                <p className="text-[13px] font-semibold text-gray-900">
                  {new Date((card as OwnedCard).obtainedAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Memories section - owned cards only */}
        {isOwned && (
          <motion.div
            className="mt-6 w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {/* Section header */}
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <h3 className="text-[16px] font-bold text-gray-900">思い出</h3>
              <AnimatePresence>
                {savedIndicator && (
                  <motion.span
                    className="ml-auto text-[12px] text-green-600"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    保存しました
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Memo textarea */}
            <textarea
              className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-primary-400 focus:bg-white"
              rows={4}
              placeholder="この日の思い出を書き留めよう..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onBlur={handleMemoBlur}
            />

            {/* Image attachment */}
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] text-gray-600 transition-colors active:bg-gray-100"
                >
                  <Camera className="h-4 w-4" />
                  写真を追加
                </button>
                <button
                  onClick={() => setShowDrawing(true)}
                  className="flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-[13px] font-bold text-primary-600 transition-colors active:bg-primary-100"
                >
                  <Palette className="h-4 w-4" />
                  カードにお絵描きする
                </button>
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors active:opacity-90"
                >
                  <Camera className="h-4 w-4" />
                  カードと記念写真を撮る
                </button>
              </div>

              {/* Thumbnail grid */}
              {attachedImages.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {attachedImages.map((img, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`思い出 ${index + 1}`}
                        className="h-full w-full cursor-pointer object-cover"
                        onClick={() => setFullscreenImage(img)}
                      />
                      <button
                        onClick={() => setDeleteConfirm(index)}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm transition-colors active:bg-black/80"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Delete confirmation modal */}
        <AnimatePresence>
          {deleteConfirm !== null && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                className="mx-6 w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-5"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-center text-[15px] font-semibold text-gray-900">
                  この写真を削除しますか？
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-[13px] text-gray-600 transition-colors active:bg-gray-100"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    キャンセル
                  </button>
                  <button
                    className="flex-1 rounded-xl bg-red-50 py-2.5 text-[13px] font-semibold text-red-500 transition-colors active:bg-red-100"
                    onClick={() => handleDeleteImage(deleteConfirm)}
                  >
                    削除
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen image viewer */}
        <AnimatePresence>
          {fullscreenImage && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFullscreenImage(null)}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fullscreenImage}
                  alt="思い出"
                  className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain"
                />
              </motion.div>
              <button
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition-colors active:bg-white/20"
                onClick={() => setFullscreenImage(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCamera && card && (
            <CardPhotoCamera
              card={card}
              onClose={() => setShowCamera(false)}
              onSave={(base64) => {
                addCardImage(card.id, base64);
                reloadCard();
                setShowCamera(false);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDrawing && card && (
            <CardDrawingCanvas
              card={card}
              onClose={() => setShowDrawing(false)}
              onSave={(base64) => {
                addCardImage(card.id, base64);
                reloadCard();
                setShowDrawing(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
