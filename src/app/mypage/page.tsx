"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Crown, Award, Diamond, Medal, Shield,
  Sparkles, Heart, Share2, Settings, ChevronRight,
  Coins, LayoutGrid
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { getUser, getCards, getCoins, getGachaCount, getPurchaseCount } from "@/lib/store";
import { getMemberById } from "@/lib/groups-data";
import { getTierInfo, TierInfo } from "@/lib/tier";
import { RARITY_CONFIG, RARITY_ORDER, OwnedCard, TierLevel } from "@/types";

const TIER_ICONS: Record<TierLevel, React.ComponentType<{ className?: string }>> = {
  bronze: Shield,
  silver: Medal,
  gold: Award,
  platinum: Crown,
  diamond: Diamond,
};

export default function MyPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [userName, setUserName] = useState("");
  const [coins, setCoinsState] = useState(0);
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [tanmouName, setTanmouName] = useState<string | null>(null);
  const [daysSinceReg, setDaysSinceReg] = useState(0);
  const [gachaCount, setGachaCountState] = useState(0);
  const [purchaseCount, setPurchaseCountState] = useState(0);
  const [shareStatus, setShareStatus] = useState<"idle" | "generating" | "done">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.replace("/"); return; }

    setUserName(user.displayName);
    setCoinsState(getCoins());
    const cards = getCards();
    setOwnedCards(cards);

    const gc = getGachaCount();
    const pc = getPurchaseCount();
    setGachaCountState(gc);
    setPurchaseCountState(pc);

    const info = getTierInfo({ gachaCount: gc, purchaseCount: pc, ownedCards: cards });
    setTierInfo(info);

    const days = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    setDaysSinceReg(days === 0 ? 1 : days);

    if (user.tanmouMemberId) {
      const member = getMemberById(user.tanmouMemberId);
      if (member) {
        setTanmouName(member.name);
      }
    }
    setMounted(true);
  }, [router]);

  // Rare cards (SR以上)
  const rareCards = ownedCards.filter(c => ["sr", "ur", "legend"].includes(c.rarity))
    .sort((a, b) => {
      const order = ["legend", "ur", "sr"];
      return order.indexOf(a.rarity) - order.indexOf(b.rarity);
    });

  // Rarity breakdown counts
  const rarityCounts = {
    normal: ownedCards.filter(c => c.rarity === "normal").length,
    rare: ownedCards.filter(c => c.rarity === "rare").length,
    sr: ownedCards.filter(c => c.rarity === "sr").length,
    ur: ownedCards.filter(c => c.rarity === "ur").length,
    legend: ownedCards.filter(c => c.rarity === "legend").length,
  };

  // Share handler
  const handleShare = useCallback(async () => {
    if (!tierInfo || shareStatus === "generating") return;
    setShareStatus("generating");

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;
      canvas.width = 600;
      canvas.height = 400;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 600, 400);
      gradient.addColorStop(0, tierInfo.gradientFrom);
      gradient.addColorStop(1, tierInfo.gradientTo);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 400);

      // Dark overlay for readability
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, 600, 400);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(userName, 40, 60);

      // Tier badge
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = tierInfo.color;
      ctx.fillText(`${tierInfo.labelEn} Tier`, 40, 90);

      // Divider
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 110);
      ctx.lineTo(560, 110);
      ctx.stroke();

      // Stats
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "14px sans-serif";
      ctx.fillText("推し活日数", 40, 145);
      ctx.fillText("ガチャ回数", 220, 145);
      ctx.fillText("購入回数", 400, 145);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(`${daysSinceReg}`, 40, 185);
      ctx.fillText(`${gachaCount}`, 220, 185);
      ctx.fillText(`${purchaseCount}`, 400, 185);

      // Card counts
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "14px sans-serif";
      ctx.fillText("所持カード", 40, 230);
      ctx.fillText("レアカード", 220, 230);
      ctx.fillText("コイン", 400, 230);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(`${ownedCards.length}`, 40, 270);
      ctx.fillText(`${tierInfo.rareCardCount}`, 220, 270);
      ctx.fillText(`${coins.toLocaleString()}`, 400, 270);

      // Tanmou
      if (tanmouName) {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "14px sans-serif";
        ctx.fillText("担当", 40, 315);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(tanmouName, 40, 345);
      }

      // Watermark
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("STARTO Card Collection", 560, 380);

      // Convert to blob for sharing
      canvas.toBlob(async (blob) => {
        if (!blob) { setShareStatus("idle"); return; }

        const shareText = `【STARTO Card Collection】\n${tierInfo.labelEn} Tier | ${userName}\n推し活${daysSinceReg}日目 | カード${ownedCards.length}枚\nガチャ${gachaCount}回 | 購入${purchaseCount}回${tanmouName ? `\n担当: ${tanmouName}` : ""}`;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "starto-status.png", { type: "image/png" });
          const shareData = { text: shareText, files: [file] };
          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
            } catch { /* user cancelled */ }
          } else {
            // fallback: share text only
            try { await navigator.share({ text: shareText }); } catch { /* cancelled */ }
          }
        } else {
          // Clipboard fallback
          try {
            await navigator.clipboard.writeText(shareText);
            alert("ステータスをクリップボードにコピーしました");
          } catch {
            // last resort
          }
        }
        setShareStatus("done");
        setTimeout(() => setShareStatus("idle"), 2000);
      }, "image/png");
    } catch {
      setShareStatus("idle");
    }
  }, [tierInfo, shareStatus, userName, daysSinceReg, gachaCount, purchaseCount, ownedCards.length, coins, tanmouName]);

  if (!mounted || !tierInfo) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  const TierIcon = TIER_ICONS[tierInfo.tier];

  return (
    <AppShell>
      <Header title="マイページ" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="px-4 py-5 space-y-5">
        {/* Tier Hero Card */}
        <motion.div
          className="relative overflow-hidden rounded-2xl shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${tierInfo.gradientFrom}, ${tierInfo.gradientTo})`,
            }}
          />
          {/* Overlay pattern for premium feel */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
            }}
          />

          <div className="relative z-10 p-5">
            {/* Top row: tier badge + icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <TierIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-white/70 uppercase tracking-wider">Tier</p>
                  <p className="text-[18px] font-black text-white leading-tight">{tierInfo.labelEn}</p>
                </div>
              </div>
              {/* Days badge */}
              <div className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                <span className="text-[12px] font-bold text-white">推し活 {daysSinceReg}日目</span>
              </div>
            </div>

            {/* User name */}
            <p className="mt-4 text-[24px] font-black text-white leading-tight">{userName}</p>
            {tanmouName && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <Heart className="h-3 w-3 text-white/80" fill="currentColor" />
                <span className="text-[12px] font-medium text-white/80">担当: {tanmouName}</span>
              </div>
            )}

            {/* Next tier progress */}
            {tierInfo.nextTier && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/50">次のTier</span>
                  <span className="text-[11px] font-bold text-white/80">{tierInfo.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${tierInfo.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
            {!tierInfo.nextTier && (
              <div className="mt-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-white/80" />
                <span className="text-[11px] font-bold text-white/80">最高ランク到達</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid 2x2 */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard label="ガチャ回数" value={gachaCount} icon={<Sparkles className="h-4 w-4" />} color="#ec6d81" />
          <StatCard label="購入回数" value={purchaseCount} icon={<Coins className="h-4 w-4" />} color="#f6ab00" />
          <StatCard label="所持カード" value={ownedCards.length} icon={<LayoutGrid className="h-4 w-4" />} color="#3B82F6" />
          <StatCard label="レアカード" value={tierInfo.rareCardCount} icon={<Award className="h-4 w-4" />} color="#A855F7" />
        </motion.div>

        {/* Rarity Breakdown */}
        <motion.div
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-[14px] font-bold text-gray-900 mb-3">レアリティ内訳</h3>
          <div className="space-y-2">
            {RARITY_ORDER.map((rarity) => {
              const cfg = RARITY_CONFIG[rarity];
              const count = rarityCounts[rarity];
              return (
                <div key={rarity} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-20">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-[12px] font-medium text-gray-500">{cfg.labelEn}</span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: cfg.color,
                        width: ownedCards.length > 0 ? `${(count / ownedCards.length) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-bold tabular-nums text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Rare Card Collection */}
        {rareCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[14px] font-bold text-gray-900">レアカードコレクション</h3>
              <span className="text-[12px] text-gray-400">{rareCards.length}枚</span>
            </div>
            <div className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1">
              {rareCards.map((card) => {
                const cfg = RARITY_CONFIG[card.rarity];
                return (
                  <Link key={card.id} href={`/card/${card.id}`}>
                    <div
                      className={`relative flex-shrink-0 w-[120px] aspect-[5/7] rounded-xl overflow-hidden card-glow-${card.rarity}`}
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
                      <div className="card-holo-overlay" style={{ opacity: 0.3 }} />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-8">
                        <p className="text-[11px] font-bold text-white truncate">{card.memberName}</p>
                        <p className="text-[9px]" style={{ color: cfg.color }}>
                          {"★".repeat(cfg.stars)}
                        </p>
                      </div>
                      {/* Rarity badge */}
                      <div className="absolute right-1.5 top-1.5">
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                          style={{ backgroundColor: `${cfg.color}33`, color: cfg.color }}
                        >
                          {cfg.labelEn}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Share Button */}
        <motion.button
          onClick={handleShare}
          disabled={shareStatus === "generating"}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-primary-500/20 transition-all active:scale-[0.97] disabled:opacity-60"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Share2 className="h-4 w-4" />
          {shareStatus === "done" ? "シェアしました！" : shareStatus === "generating" ? "画像生成中..." : "ステータスをシェア"}
        </motion.button>

        {/* Settings Link */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/settings">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all active:bg-gray-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Settings className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-gray-900">設定</p>
                <p className="text-[12px] text-gray-400">アカウント・データ管理</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
        <span className="text-[11px] text-gray-400">{label}</span>
      </div>
      <p className="text-[28px] font-black tabular-nums text-gray-900 leading-none">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
