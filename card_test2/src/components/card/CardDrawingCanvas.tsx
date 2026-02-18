"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  X,
  Undo2,
  Redo2,
  Pen,
  Highlighter,
  Eraser,
  Check,
} from "lucide-react";
import { Card, RARITY_CONFIG } from "@/types";
import getStroke from "perfect-freehand";

interface CardDrawingCanvasProps {
  card: Card;
  onClose: () => void;
  onSave: (base64: string) => void;
}

type ToolType = "pen" | "marker" | "eraser";

interface StrokeData {
  points: number[][]; // [x, y, pressure][]
  color: string;
  size: number;
  tool: ToolType;
}

const PRESET_COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#00C7BE",
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
  "#A2845E",
  "#000000",
  "#FFFFFF",
];

// Convert perfect-freehand outline points to SVG path string
function getSvgPathFromStroke(points: number[][]): string {
  if (!points.length) return "";

  const d = points.reduce(
    (acc: (string | number)[], [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...points[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}

function getStrokeOptions(tool: ToolType, size: number) {
  switch (tool) {
    case "pen":
      return {
        size,
        thinning: 0.6,
        smoothing: 0.5,
        streamline: 0.5,
        easing: (t: number) => t,
        start: { taper: 0, cap: true as const },
        end: { taper: 0, cap: true as const },
      };
    case "marker":
      return {
        size: size * 3,
        thinning: 0,
        smoothing: 0.7,
        streamline: 0.5,
        easing: (t: number) => t,
        start: { taper: 0, cap: true as const },
        end: { taper: 0, cap: true as const },
      };
    case "eraser":
      return {
        size: size * 3,
        thinning: 0,
        smoothing: 0.5,
        streamline: 0.5,
        easing: (t: number) => t,
        start: { taper: 0, cap: true as const },
        end: { taper: 0, cap: true as const },
      };
  }
}

export function CardDrawingCanvas({
  card,
  onClose,
  onSave,
}: CardDrawingCanvasProps) {
  const config = RARITY_CONFIG[card.rarity];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardAreaRef = useRef<HTMLDivElement>(null);
  const preloadedImageRef = useRef<HTMLImageElement | null>(null);

  // Stroke state stored in refs for performance
  const strokesRef = useRef<StrokeData[]>([]);
  const undoneRef = useRef<StrokeData[]>([]);
  const currentStrokeRef = useRef<StrokeData | null>(null);
  const isDrawingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const dprRef = useRef(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  );

  const [selectedColor, setSelectedColor] = useState("#FF3B30");
  const [selectedSize, setSelectedSize] = useState(5);
  const [selectedTool, setSelectedTool] = useState<ToolType>("pen");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  // Preload card image for export
  useEffect(() => {
    if (card.memberImage) {
      const img = document.createElement("img");
      img.src = card.memberImage;
      img.onload = () => {
        preloadedImageRef.current = img;
      };
    }
  }, [card.memberImage]);

  // Redraw all strokes on the canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = dprRef.current;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const allStrokes = [...strokesRef.current];
    if (currentStrokeRef.current) {
      allStrokes.push(currentStrokeRef.current);
    }

    for (const stroke of allStrokes) {
      if (stroke.points.length < 2) continue;

      const outlinePoints = getStroke(
        stroke.points,
        getStrokeOptions(stroke.tool, stroke.size)
      );
      const pathData = getSvgPathFromStroke(outlinePoints);
      if (!pathData) continue;

      const path = new Path2D(pathData);

      ctx.save();
      if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000000";
        ctx.globalAlpha = 1;
      } else if (stroke.tool === "marker") {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = stroke.color;
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = stroke.color;
        ctx.globalAlpha = 1;
      }
      ctx.fill(path);
      ctx.restore();
    }

    ctx.restore();
  }, []);

  // Initialize canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    const cardArea = cardAreaRef.current;
    if (!canvas || !cardArea) return;

    const resize = () => {
      const rect = cardArea.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      redraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(cardArea);
    return () => observer.disconnect();
  }, [redraw]);

  // Pointer handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const canvas = canvasRef.current;
      if (!canvas) return;

      (e.target as Element).setPointerCapture(e.pointerId);

      const rect = canvas.getBoundingClientRect();
      const point = [
        e.clientX - rect.left,
        e.clientY - rect.top,
        e.pressure || 0.5,
      ];

      isDrawingRef.current = true;
      currentStrokeRef.current = {
        points: [point],
        color: selectedColor,
        size: selectedSize,
        tool: selectedTool,
      };

      // Clear redo stack on new stroke
      undoneRef.current = [];
      setCanRedo(false);

      redraw();
    },
    [selectedColor, selectedSize, selectedTool, redraw]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current || !currentStrokeRef.current) return;
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const point = [
        e.clientX - rect.left,
        e.clientY - rect.top,
        e.pressure || 0.5,
      ];

      currentStrokeRef.current.points.push(point);

      // Throttle redraws to rAF
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => redraw());
    },
    [redraw]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;

    isDrawingRef.current = false;

    if (currentStrokeRef.current.points.length >= 2) {
      strokesRef.current.push(currentStrokeRef.current);
      setCanUndo(true);
      setHasStrokes(true);
    }

    currentStrokeRef.current = null;
    redraw();
  }, [redraw]);

  // Undo
  const handleUndo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    const last = strokesRef.current.pop()!;
    undoneRef.current.push(last);
    setCanUndo(strokesRef.current.length > 0);
    setCanRedo(true);
    setHasStrokes(strokesRef.current.length > 0);
    redraw();
  }, [redraw]);

  // Redo
  const handleRedo = useCallback(() => {
    if (undoneRef.current.length === 0) return;
    const last = undoneRef.current.pop()!;
    strokesRef.current.push(last);
    setCanUndo(true);
    setCanRedo(undoneRef.current.length > 0);
    setHasStrokes(true);
    redraw();
  }, [redraw]);

  // Helper: draw rounded rect
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

  // Export composite image
  const handleSave = useCallback(async () => {
    if (!hasStrokes) {
      onClose();
      return;
    }

    setIsExporting(true);

    try {
      const cardArea = cardAreaRef.current;
      const drawCanvas = canvasRef.current;
      if (!cardArea || !drawCanvas) return;

      const rect = cardArea.getBoundingClientRect();
      const exportScale = 2;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = rect.width * exportScale;
      exportCanvas.height = rect.height * exportScale;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(exportScale, exportScale);

      // Clip to rounded rect
      const radius = 16;
      drawRoundedRect(ctx, 0, 0, rect.width, rect.height, radius);
      ctx.clip();

      // Draw gradient background
      const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, card.memberColor + "40");
      grad.addColorStop(1, card.memberColor + "90");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw member image (object-cover, object-top)
      if (preloadedImageRef.current) {
        const img = preloadedImageRef.current;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const areaAspect = rect.width / rect.height;
        let drawW: number, drawH: number, drawX: number, drawY: number;
        if (imgAspect > areaAspect) {
          // Image wider: height fills, width cropped
          drawH = rect.height;
          drawW = drawH * imgAspect;
          drawX = (rect.width - drawW) / 2;
          drawY = 0;
        } else {
          // Image taller: width fills, height cropped from bottom (object-top)
          drawW = rect.width;
          drawH = drawW / imgAspect;
          drawX = 0;
          drawY = 0; // object-top
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }

      // Holo overlay subtle effect
      const holoGrad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      holoGrad.addColorStop(0, "rgba(255,255,255,0.08)");
      holoGrad.addColorStop(0.5, "rgba(255,255,255,0)");
      holoGrad.addColorStop(1, "rgba(255,255,255,0.08)");
      ctx.fillStyle = holoGrad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Bottom gradient for text
      const textGrad = ctx.createLinearGradient(
        0,
        rect.height * 0.55,
        0,
        rect.height
      );
      textGrad.addColorStop(0, "rgba(0,0,0,0)");
      textGrad.addColorStop(0.4, "rgba(0,0,0,0.4)");
      textGrad.addColorStop(1, "rgba(0,0,0,0.8)");
      ctx.fillStyle = textGrad;
      ctx.fillRect(0, rect.height * 0.55, rect.width, rect.height * 0.45);

      // Member name
      const padding = 20;
      const nameSize = 28;
      ctx.font = `bold ${nameSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = "white";
      ctx.textBaseline = "alphabetic";
      const starSize = 14;
      const titleSize = 13;
      const starY = rect.height - padding;
      const titleY = starY - starSize - 4;
      const nameY = titleY - titleSize - 4;
      ctx.fillText(card.memberName, padding, nameY);

      // Title
      ctx.font = `${titleSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(card.title, padding, titleY);

      // Rarity stars
      ctx.font = `${starSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = config.color;
      ctx.fillText("\u2605".repeat(config.stars), padding, starY);

      // Draw the strokes canvas on top
      ctx.drawImage(drawCanvas, 0, 0, rect.width, rect.height);

      // Draw card border
      ctx.strokeStyle = config.glowColor + "66";
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, 0, 0, rect.width, rect.height, radius);
      ctx.stroke();

      const base64 = exportCanvas.toDataURL("image/jpeg", 0.9);
      onSave(base64);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [hasStrokes, card, config, onSave, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-[#030712]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between px-4 pt-safe">
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors active:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-white/10 ${
              canUndo ? "text-white" : "text-white/20"
            }`}
          >
            <Undo2 className="h-5 w-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-white/10 ${
              canRedo ? "text-white" : "text-white/20"
            }`}
          >
            <Redo2 className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isExporting}
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-gray-900 transition-colors active:bg-gray-200 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          {isExporting ? "保存中..." : "完了"}
        </button>
      </div>

      {/* Card area with drawing canvas */}
      <div className="flex flex-1 items-center justify-center px-8">
        <div
          ref={cardAreaRef}
          className="relative aspect-[5/7] w-full max-w-[300px] overflow-hidden rounded-2xl border-2"
          style={{
            borderColor: `${config.glowColor}66`,
          }}
        >
          {/* Card visual background */}
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
                sizes="300px"
                priority
              />
            )}
            <div
              className="card-holo-overlay pointer-events-none"
              style={{ opacity: 0.3 }}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-20">
              <p className="text-[28px] font-bold leading-tight text-white drop-shadow-lg">
                {card.memberName}
              </p>
              <p className="mt-1 text-[13px] text-white/70 drop-shadow-md">
                {card.title}
              </p>
              <p className="mt-1 text-[14px]" style={{ color: config.color }}>
                {"\u2605".repeat(config.stars)}
              </p>
            </div>
          </div>

          {/* Drawing canvas overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 touch-none"
            style={{ cursor: "crosshair" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="px-4 pb-8 pt-3">
        {/* Color palette */}
        <div className="scrollbar-hide mb-4 flex justify-center gap-2.5 overflow-x-auto px-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                if (selectedTool === "eraser") setSelectedTool("pen");
              }}
              className="relative flex-shrink-0"
            >
              <span
                className={`block h-7 w-7 rounded-full border-2 transition-all ${
                  selectedColor === color && selectedTool !== "eraser"
                    ? "scale-125 border-white shadow-lg"
                    : "border-white/20"
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow:
                    color === "#FFFFFF"
                      ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
                      : undefined,
                }}
              />
            </button>
          ))}
        </div>

        {/* Tool selector */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setSelectedTool("pen")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all ${
              selectedTool === "pen"
                ? "bg-white text-gray-900 shadow-lg"
                : "bg-white/10 text-white/60"
            }`}
          >
            <Pen className="h-4 w-4" />
            ペン
          </button>
          <button
            onClick={() => setSelectedTool("marker")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all ${
              selectedTool === "marker"
                ? "bg-white text-gray-900 shadow-lg"
                : "bg-white/10 text-white/60"
            }`}
          >
            <Highlighter className="h-4 w-4" />
            マーカー
          </button>
          <button
            onClick={() => setSelectedTool("eraser")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all ${
              selectedTool === "eraser"
                ? "bg-white text-gray-900 shadow-lg"
                : "bg-white/10 text-white/60"
            }`}
          >
            <Eraser className="h-4 w-4" />
            消しゴム
          </button>
        </div>

        {/* Size slider */}
        <div className="flex items-center gap-3 px-6">
          <div
            className="flex-shrink-0 rounded-full bg-white/60"
            style={{ width: 4, height: 4 }}
          />
          <input
            type="range"
            min="2"
            max="20"
            value={selectedSize}
            onChange={(e) => setSelectedSize(parseInt(e.target.value))}
            className="flex-1 accent-white"
            style={{ height: 20 }}
          />
          <div
            className="flex-shrink-0 rounded-full bg-white/60"
            style={{ width: 16, height: 16 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
