"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, RotateCcw, Download } from "lucide-react";
import { Card, RARITY_CONFIG } from "@/types";

interface CardPhotoCameraProps {
  card: Card;
  onClose: () => void;
  onSave: (base64: string) => void;
}

type CameraState = "loading" | "ready" | "error" | "preview";

export function CardPhotoCamera({ card, onClose, onSave }: CardPhotoCameraProps) {
  const config = RARITY_CONFIG[card.rarity];

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardOverlayRef = useRef<HTMLDivElement>(null);
  const preloadedImageRef = useRef<HTMLImageElement | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("loading");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cardScale, setCardScale] = useState(1);

  // Drag state stored in refs for performance
  const cardPosRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const isDraggingRef = useRef(false);

  // Preload member image for canvas drawing
  useEffect(() => {
    if (card.memberImage) {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = card.memberImage;
      img.onload = () => {
        preloadedImageRef.current = img;
      };
    }
  }, [card.memberImage]);

  // Initialize camera
  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraState("ready");
      } catch {
        // Fallback to user-facing camera
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraState("ready");
        } catch {
          if (!cancelled) {
            setCameraState("error");
          }
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Center the card overlay once camera is ready
  useEffect(() => {
    if (cameraState === "ready" && containerRef.current) {
      // Keep card centered (0,0 = center of container due to our CSS)
      cardPosRef.current = { x: 0, y: 0 };
      if (cardOverlayRef.current) {
        cardOverlayRef.current.style.transform = `translate(0px, 0px) scale(${cardScale})`;
      }
    }
  }, [cameraState, cardScale]);

  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: cardPosRef.current.x,
      posY: cardPosRef.current.y,
    };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const newX = dragStartRef.current.posX + dx;
      const newY = dragStartRef.current.posY + dy;
      cardPosRef.current = { x: newX, y: newY };
      if (cardOverlayRef.current) {
        cardOverlayRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${cardScale})`;
      }
    },
    [cardScale]
  );

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Mouse drag handlers (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: cardPosRef.current.x,
      posY: cardPosRef.current.y,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const newX = dragStartRef.current.posX + dx;
      const newY = dragStartRef.current.posY + dy;
      cardPosRef.current = { x: newX, y: newY };
      if (cardOverlayRef.current) {
        cardOverlayRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${cardScale})`;
      }
    },
    [cardScale]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Update transform when scale changes via slider
  useEffect(() => {
    if (cardOverlayRef.current) {
      const { x, y } = cardPosRef.current;
      cardOverlayRef.current.style.transform = `translate(${x}px, ${y}px) scale(${cardScale})`;
    }
  }, [cardScale]);

  // Draw rounded rect helper
  function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Capture the composite image
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the camera frame
    ctx.drawImage(video, 0, 0);

    // Calculate scale factors from screen to video coordinates
    const scaleX = video.videoWidth / video.clientWidth;
    const scaleY = video.videoHeight / video.clientHeight;

    // Card overlay dimensions in screen pixels
    const cardW = 140 * cardScale;
    const cardH = 196 * cardScale;

    // Card center position on screen: center of container + drag offset
    const containerW = video.clientWidth;
    const containerH = video.clientHeight;
    const screenCX = containerW / 2 + cardPosRef.current.x;
    const screenCY = containerH / 2 + cardPosRef.current.y;

    // Card top-left in video coordinates
    const videoX = (screenCX - cardW / 2) * scaleX;
    const videoY = (screenCY - cardH / 2) * scaleY;
    const videoW = cardW * scaleX;
    const videoH = cardH * scaleY;
    const videoR = 12 * cardScale * Math.min(scaleX, scaleY);

    // Save context and clip to rounded rect
    ctx.save();
    drawRoundedRect(ctx, videoX, videoY, videoW, videoH, videoR);
    ctx.clip();

    // Draw gradient background
    const grad = ctx.createLinearGradient(videoX, videoY, videoX + videoW, videoY + videoH);
    grad.addColorStop(0, card.memberColor + "66");
    grad.addColorStop(1, card.memberColor + "EE");
    ctx.fillStyle = grad;
    ctx.fillRect(videoX, videoY, videoW, videoH);

    // Draw member image if preloaded
    if (preloadedImageRef.current) {
      const img = preloadedImageRef.current;
      // Cover the card area, align to top
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const cardAspect = videoW / videoH;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (imgAspect > cardAspect) {
        drawH = videoH;
        drawW = drawH * imgAspect;
        drawX = videoX + (videoW - drawW) / 2;
        drawY = videoY;
      } else {
        drawW = videoW;
        drawH = drawW / imgAspect;
        drawX = videoX;
        drawY = videoY;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    // Draw holo overlay (semi-transparent gradient)
    const holoGrad = ctx.createLinearGradient(videoX, videoY, videoX + videoW, videoY + videoH);
    holoGrad.addColorStop(0, "rgba(255,255,255,0.12)");
    holoGrad.addColorStop(0.5, "rgba(255,255,255,0.04)");
    holoGrad.addColorStop(1, "rgba(255,255,255,0.12)");
    ctx.fillStyle = holoGrad;
    ctx.fillRect(videoX, videoY, videoW, videoH);

    // Draw bottom gradient for text
    const textGrad = ctx.createLinearGradient(videoX, videoY + videoH * 0.55, videoX, videoY + videoH);
    textGrad.addColorStop(0, "rgba(0,0,0,0)");
    textGrad.addColorStop(0.4, "rgba(0,0,0,0.4)");
    textGrad.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = textGrad;
    ctx.fillRect(videoX, videoY + videoH * 0.55, videoW, videoH * 0.45);

    // Draw member name
    const fontSize = Math.round(16 * cardScale * Math.min(scaleX, scaleY));
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.fillStyle = "white";
    ctx.textBaseline = "bottom";
    const textPadding = 10 * cardScale * Math.min(scaleX, scaleY);
    ctx.fillText(
      card.memberName,
      videoX + textPadding,
      videoY + videoH - textPadding - fontSize * 0.4
    );

    // Draw rarity stars
    const starSize = Math.round(10 * cardScale * Math.min(scaleX, scaleY));
    ctx.font = `${starSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.fillStyle = config.color;
    ctx.fillText(
      "\u2605".repeat(config.stars),
      videoX + textPadding,
      videoY + videoH - textPadding
    );

    ctx.restore();

    // Draw card border (rarity glow color)
    ctx.strokeStyle = config.glowColor + "99";
    ctx.lineWidth = 2 * cardScale * Math.min(scaleX, scaleY);
    drawRoundedRect(ctx, videoX, videoY, videoW, videoH, videoR);
    ctx.stroke();

    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(base64);
    setCameraState("preview");
  }, [card, cardScale, config]);

  // Retake
  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setCameraState("ready");
  }, []);

  // Save
  const handleSave = useCallback(() => {
    if (capturedImage) {
      onSave(capturedImage);
    }
  }, [capturedImage, onSave]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors active:bg-black/60"
      >
        <X className="h-5 w-5" />
      </button>

      <AnimatePresence mode="wait">
        {/* Error state */}
        {cameraState === "error" && (
          <motion.div
            key="error"
            className="flex h-full flex-col items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <X className="h-8 w-8 text-white/60" />
            </div>
            <p className="text-center text-[18px] font-bold text-white">
              カメラにアクセスできません
            </p>
            <p className="mt-2 text-center text-[14px] text-white/60">
              カメラの使用を許可してください
            </p>
            <button
              onClick={onClose}
              className="mt-8 rounded-xl bg-white/10 px-8 py-3 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors active:bg-white/20"
            >
              閉じる
            </button>
          </motion.div>
        )}

        {/* Loading state */}
        {cameraState === "loading" && (
          <motion.div
            key="loading"
            className="flex h-full flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            <p className="mt-4 text-[14px] text-white/60">カメラを起動中...</p>
          </motion.div>
        )}

        {/* Camera / Ready state */}
        {(cameraState === "ready" || cameraState === "preview") && (
          <motion.div
            key="camera"
            className="relative h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Video feed */}
            <div
              ref={containerRef}
              className="relative h-full w-full overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {cameraState === "ready" && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />

                  {/* Draggable card overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div
                      ref={cardOverlayRef}
                      className="pointer-events-auto cursor-grab select-none active:cursor-grabbing"
                      style={{
                        width: 140,
                        height: 196,
                        touchAction: "none",
                        transform: `translate(${cardPosRef.current.x}px, ${cardPosRef.current.y}px) scale(${cardScale})`,
                      }}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleMouseDown}
                    >
                      <div
                        className={`card-glow-${card.rarity} relative h-full w-full overflow-hidden rounded-xl border-2`}
                        style={{
                          background: `linear-gradient(135deg, ${card.memberColor}66 0%, ${card.memberColor}EE 100%)`,
                          borderColor: `${config.glowColor}99`,
                        }}
                      >
                        {card.memberImage && (
                          <Image
                            src={card.memberImage}
                            alt={card.memberName}
                            fill
                            className="pointer-events-none object-cover object-top"
                            sizes="140px"
                            draggable={false}
                          />
                        )}
                        <div
                          className="card-holo-overlay pointer-events-none"
                          style={{ opacity: 0.3 }}
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-8">
                          <p className="text-[12px] font-bold text-white drop-shadow-md">
                            {card.memberName}
                          </p>
                          <p className="text-[10px] leading-none" style={{ color: config.color }}>
                            {"\u2605".repeat(config.stars)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Preview: captured image */}
              {cameraState === "preview" && capturedImage && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedImage}
                    alt="撮影した写真"
                    className="h-full w-full object-cover"
                  />
                </>
              )}
            </div>

            {/* Bottom controls */}
            <div className="absolute inset-x-0 bottom-0 z-40">
              <div className="bg-black/40 px-6 pb-10 pt-5 backdrop-blur-xl">
                {cameraState === "ready" && (
                  <div className="flex items-center justify-between gap-4">
                    {/* Size slider */}
                    <div className="flex flex-1 flex-col items-start gap-1">
                      <span className="text-[10px] text-white/50">カードサイズ</span>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={cardScale}
                        onChange={(e) => setCardScale(parseFloat(e.target.value))}
                        className="w-full accent-purple-500"
                        style={{ height: 20 }}
                      />
                    </div>

                    {/* Shutter button */}
                    <button
                      onClick={handleCapture}
                      className="flex h-[68px] w-[68px] flex-shrink-0 items-center justify-center rounded-full border-4 border-white/50 bg-white shadow-lg transition-transform active:scale-95"
                    >
                      <span className="block h-[58px] w-[58px] rounded-full bg-white transition-colors active:bg-gray-200" />
                    </button>

                    {/* Spacer for centering */}
                    <div className="flex-1" />
                  </div>
                )}

                {cameraState === "preview" && (
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={handleRetake}
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors active:bg-white/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                      もう一度
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-gray-900 transition-colors active:bg-gray-100"
                    >
                      <Download className="h-4 w-4" />
                      保存する
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
