"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Star,
  Crown,
  ArrowLeftRight,
  Target,
  Award,
  Check,
  ChevronRight,
  Coins,
  Sparkles,
  Lock,
} from "lucide-react";
import {
  Card,
  Program,
  ProgramRequirement,
  UserProgramProgress,
  RARITY_CONFIG,
} from "@/types";
import {
  getUser,
  getCoins,
  getCards,
  getProgramProgress,
  setProgramProgress,
} from "@/lib/store";
import { getProgramById } from "@/lib/programs-data";
import {
  getCardRightsSummary,
  executeAllocation,
} from "@/lib/rights-engine";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Star,
  Crown,
  ArrowLeftRight,
  Target,
  Award,
};

interface EligibleCard extends Card {
  availableRights: number;
  totalRights: number;
}

function getEligibleCardsForRequirement(
  requirement: ProgramRequirement,
  ownedCards: Card[]
): EligibleCard[] {
  const results: EligibleCard[] = [];

  for (const card of ownedCards) {
    // Check filter match
    if (requirement.filter) {
      const { themeIds, rarities, cardIds } = requirement.filter;
      if (themeIds && !themeIds.includes(card.themeId)) continue;
      if (rarities && !rarities.includes(card.rarity)) continue;
      if (cardIds && !cardIds.includes(card.id)) continue;
    }

    // Check available rights
    const summary = getCardRightsSummary(card.id);
    if (summary.available > 0) {
      results.push({
        ...card,
        availableRights: summary.available,
        totalRights: summary.total,
      });
    }
  }

  return results;
}

function getFilledCount(
  requirement: ProgramRequirement,
  progress?: UserProgramProgress
): number {
  if (!progress) return 0;
  const allocated = progress.allocations[requirement.id] || [];
  return allocated.length;
}

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [coins, setCoinsState] = useState(0);
  const [program, setProgram] = useState<Program | null>(null);
  const [progress, setProgress] = useState<UserProgramProgress | undefined>();
  const [ownedCards, setOwnedCards] = useState<Card[]>([]);

  // Card selection UI state
  const [selectingReqId, setSelectingReqId] = useState<string | null>(null);
  const [eligibleCards, setEligibleCards] = useState<EligibleCard[]>([]);

  // Confirmation modal state
  const [confirmCard, setConfirmCard] = useState<EligibleCard | null>(null);
  const [confirmReqId, setConfirmReqId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Reward claim state
  const [claimingRewards, setClaimingRewards] = useState(false);

  const refreshState = useCallback(() => {
    setCoinsState(getCoins());
    setOwnedCards(getCards());
    const p = getProgramProgress(programId);
    setProgress(p);
  }, [programId]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const prog = getProgramById(programId);
    if (!prog) {
      router.replace("/programs");
      return;
    }

    setProgram(prog);
    refreshState();
    setMounted(true);
  }, [router, programId, refreshState]);

  useEffect(() => {
    const handleFocus = () => refreshState();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshState]);

  if (!mounted || !program) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  const Icon = ICON_MAP[program.iconName] || Target;

  // Calculate overall progress
  const filledRequirements = program.requirements.filter((req) => {
    const filled = getFilledCount(req, progress);
    return filled >= req.rightPointsNeeded;
  }).length;
  const totalRequirements = program.requirements.length;
  const isCompleted = progress?.isCompleted ?? false;
  const rewardsClaimed = progress?.rewardsClaimed ?? false;

  const handleOpenCardSelection = (requirement: ProgramRequirement) => {
    const eligible = getEligibleCardsForRequirement(requirement, ownedCards);
    setEligibleCards(eligible);
    setSelectingReqId(requirement.id);
  };

  const handleSelectCard = (card: EligibleCard, requirementId: string) => {
    setConfirmCard(card);
    setConfirmReqId(requirementId);
    setSelectingReqId(null);
  };

  const handleConfirmAllocation = () => {
    if (!confirmCard || !confirmReqId) return;
    setIsProcessing(true);

    // Small delay for UX feel
    setTimeout(() => {
      const result = executeAllocation(
        confirmCard.id,
        program.id,
        confirmReqId
      );

      if (result.success) {
        // Refresh state
        refreshState();

        // Check if program just completed
        const updatedProgress = getProgramProgress(program.id);
        if (updatedProgress?.isCompleted && !isCompleted) {
          setShowCompletion(true);
        } else {
          setShowSuccess(true);
        }

      }

      setIsProcessing(false);
      setConfirmCard(null);
      setConfirmReqId(null);
    }, 400);
  };

  const handleCancelConfirmation = () => {
    if (isProcessing) return;
    setConfirmCard(null);
    setConfirmReqId(null);
  };

  const handleClaimRewards = () => {
    if (!progress || rewardsClaimed) return;
    setClaimingRewards(true);

    setTimeout(() => {
      const updated: UserProgramProgress = {
        ...progress,
        rewardsClaimed: true,
      };
      setProgramProgress(updated);
      refreshState();
      setClaimingRewards(false);
    }, 500);
  };

  // Get the requirement being confirmed for display
  const confirmRequirement = confirmReqId
    ? program.requirements.find((r) => r.id === confirmReqId)
    : null;

  return (
    <AppShell>
      <Header showBack title={program.title} coins={coins} />

      {/* Program Header Section */}
      <motion.div
        className="px-4 pt-5 pb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="rounded-2xl border border-gray-200 bg-white p-5"
          style={{
            borderTopWidth: 3,
            borderTopColor: program.accentColor,
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${program.accentColor}20`,
                color: program.accentColor,
              }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-[16px] font-bold text-gray-900">
                {program.title}
              </h2>
              <p className="mt-0.5 text-[12px] leading-relaxed text-gray-400">
                {program.description}
              </p>
            </div>
          </div>

          <ProgressBar
            current={filledRequirements}
            total={totalRequirements}
            label="達成状況"
          />
        </div>
      </motion.div>

      {/* Requirements List */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="mb-3 text-[14px] font-bold text-gray-700">
          必要条件
        </h3>
        <div className="flex flex-col gap-3">
          {program.requirements.map((req, index) => {
            const filled = getFilledCount(req, progress);
            const isFilled = filled >= req.rightPointsNeeded;
            const eligible = getEligibleCardsForRequirement(req, ownedCards);
            const hasEligibleCards = eligible.length > 0;
            const isSelecting = selectingReqId === req.id;

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.08,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {isFilled ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-matcha-400/15">
                          <Check className="h-4 w-4 text-matcha-500" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <Target className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p
                          className={`text-[14px] font-semibold ${
                            isFilled ? "text-matcha-500" : "text-gray-800"
                          }`}
                        >
                          {req.label}
                        </p>
                        <p className="text-[12px] tabular-nums text-gray-400">
                          {filled}/{req.rightPointsNeeded} ポイント
                        </p>
                      </div>
                    </div>

                    {/* Right side action */}
                    {isFilled ? (
                      <span className="rounded-full bg-matcha-400/10 px-2.5 py-1 text-[11px] font-bold text-matcha-500">
                        達成
                      </span>
                    ) : hasEligibleCards ? (
                      <button
                        onClick={() => handleOpenCardSelection(req)}
                        className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-3 py-2 text-[12px] font-bold text-white shadow-sm shadow-primary-400/15 transition-all active:scale-[0.97]"
                      >
                        権利を消費する
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-[12px] text-gray-400">
                        対象カードがありません
                      </span>
                    )}
                  </div>

                  {/* Card Selection UI */}
                  <AnimatePresence>
                    {isSelecting && (
                      <motion.div
                        className="mt-3 border-t border-gray-100 pt-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="mb-2.5 text-[12px] font-medium text-gray-500">
                          カードを選択してください:
                        </p>
                        <div className="flex flex-col gap-2">
                          {eligibleCards.map((card) => {
                            const config = RARITY_CONFIG[card.rarity];
                            return (
                              <motion.button
                                key={card.id}
                                onClick={() =>
                                  handleSelectCard(card, req.id)
                                }
                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-left transition-all active:scale-[0.98] active:bg-gray-100"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {/* Card Thumbnail */}
                                <div
                                  className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg border-2"
                                  style={{
                                    borderColor: config.glowColor,
                                  }}
                                >
                                  <Image
                                    src={card.imageUrl}
                                    alt={card.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>

                                {/* Card Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-[13px] font-semibold text-gray-800">
                                    {card.title}
                                  </p>
                                  <div className="mt-0.5 flex items-center gap-2">
                                    <span
                                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${config.textColor} bg-gradient-to-r ${config.bgGradient}`}
                                    >
                                      {config.label}
                                    </span>
                                    <span className="text-[11px] text-gray-400">
                                      残り権利: {card.availableRights}/
                                      {card.totalRights}
                                    </span>
                                  </div>
                                </div>

                                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                              </motion.button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setSelectingReqId(null)}
                          className="mt-2.5 w-full rounded-lg py-2 text-center text-[12px] font-medium text-gray-500 transition-colors active:bg-gray-100"
                        >
                          閉じる
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reward Section */}
      <motion.div
        className="px-4 pt-4 pb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.3 + program.requirements.length * 0.08,
        }}
      >
        <h3 className="mb-3 text-[14px] font-bold text-gray-700">報酬</h3>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col items-center gap-4">
            {/* Reward Coins */}
            {program.rewardCoins && (
              <div className="flex items-center gap-2 rounded-full bg-gold-400/10 px-4 py-2">
                <Coins className="h-4 w-4 text-gold-400" />
                <span className="text-[14px] font-bold text-gold-400">
                  +{program.rewardCoins.toLocaleString()} コイン
                </span>
              </div>
            )}

            {/* Claim / Claimed Button */}
            {isCompleted && !rewardsClaimed && (
              <motion.button
                onClick={handleClaimRewards}
                disabled={claimingRewards}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98] disabled:opacity-60"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Sparkles className="h-5 w-5" />
                報酬を受け取る
              </motion.button>
            )}

            {isCompleted && rewardsClaimed && (
              <div className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 py-3.5 text-[14px] font-medium text-gray-400">
                <Check className="h-4 w-4" />
                受取済み
              </div>
            )}

            {!isCompleted && (
              <div className="flex items-center gap-2 text-[12px] text-gray-400">
                <Lock className="h-3.5 w-3.5" />
                すべての条件を達成すると報酬を受け取れます
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmCard && confirmRequirement && (
          <ConfirmationModal
            title="権利の消費"
            description={`「${confirmCard.title}」の権利を「${program.title}」に消費します`}
            warning="この操作は取り消せません"
            confirmLabel="消費する"
            variant="warning"
            onConfirm={handleConfirmAllocation}
            onCancel={handleCancelConfirmation}
            isProcessing={isProcessing}
          >
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
              <p className="text-[13px] text-gray-500">
                残り権利:{" "}
                <span className="font-bold text-gray-700">
                  {confirmCard.availableRights}
                </span>
                {" → "}
                <span className="font-bold text-amber-500">
                  {confirmCard.availableRights - 1}
                </span>
              </p>
            </div>
          </ConfirmationModal>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-x-0 top-20 z-[110] flex justify-center px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onAnimationComplete={() => {
              setTimeout(() => setShowSuccess(false), 1500);
            }}
          >
            <div className="flex items-center gap-2.5 rounded-2xl border border-matcha-400/20 bg-white px-5 py-3.5 shadow-lg shadow-matcha-400/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-matcha-400/15">
                <Check className="h-4 w-4 text-matcha-500" />
              </div>
              <p className="text-[14px] font-semibold text-matcha-600">
                権利を消費しました
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Program Completion Celebration */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Glow Ring */}
              <motion.div
                className="relative mb-6"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <div
                  className="absolute -inset-3 rounded-full opacity-30 blur-lg"
                  style={{ backgroundColor: program.accentColor }}
                />
                <div
                  className="relative flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${program.accentColor}20` }}
                >
                  <Sparkles
                    className="h-10 w-10"
                    style={{ color: program.accentColor }}
                  />
                </div>
              </motion.div>

              <motion.h2
                className="mb-2 text-[20px] font-bold text-gray-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                プログラム完了！
              </motion.h2>

              <motion.p
                className="mb-2 text-[15px] font-semibold"
                style={{ color: program.accentColor }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                「{program.title}」
              </motion.p>

              <motion.p
                className="mb-6 text-[13px] text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                すべての条件を達成しました！
              </motion.p>

              <motion.button
                onClick={() => {
                  setShowCompletion(false);
                  refreshState();
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-primary-400/15 transition-all active:scale-[0.98]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                報酬を確認する
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
