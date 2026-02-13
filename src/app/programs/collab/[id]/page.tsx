"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, Users, Crown, Coins } from "lucide-react";
import { Card, CollaborativeProgram, CollabProgramProgress, CollabFeedItem } from "@/types";
import { getUser, getCards, getCoins } from "@/lib/store";
import { getCollabProgramById } from "@/lib/collab-data";
import { getCollabProgress, getCollabFeed, computeLeaderboard, getCollabBadgesForProgram } from "@/lib/collab-store";
import { executeCollabContribution, claimCollabRewards, getEligibleCollabPrograms } from "@/lib/collab-engine";
import { getCardRightsSummary } from "@/lib/rights-engine";
import { useCollabSimulator } from "@/hooks/useCollabSimulator";
import { AppShell } from "@/components/layout/AppShell";
import { GlobalProgressBar } from "@/components/collab/GlobalProgressBar";
import { Leaderboard } from "@/components/collab/Leaderboard";
import { ActivityFeed } from "@/components/collab/ActivityFeed";
import { ContributeModal } from "@/components/collab/ContributeModal";
import { CollabCelebration } from "@/components/collab/CollabCelebration";
import { CollabBadgeDisplay } from "@/components/collab/CollabBadgeDisplay";
import { LiveDot } from "@/components/collab/LiveDot";

const ICON_MAP: Record<string, React.ComponentType<any>> = { Users, Crown };

export default function CollabProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [program, setProgram] = useState<CollaborativeProgram | null>(null);
  const [localProgress, setLocalProgress] = useState<CollabProgramProgress | null>(null);
  const [feedItems, setFeedItems] = useState<CollabFeedItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ userName: string; totalPoints: number; rank: number; isCurrentUser: boolean }[]>([]);
  const [eligibleCards, setEligibleCards] = useState<Card[]>([]);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [coins, setCoinsState] = useState(0);
  const [rewardsClaimed, setRewardsClaimed] = useState(false);

  const refreshState = useCallback(() => {
    const p = getCollabProgress(programId);
    setLocalProgress(p || null);
    setFeedItems(getCollabFeed(programId));
    const user = getUser();
    setLeaderboard(computeLeaderboard(programId, user?.displayName || ""));
    setCoinsState(getCoins());
    setRewardsClaimed(p?.rewardsClaimed || false);

    // Eligible cards
    const ownedCards = getCards();
    const prog = getCollabProgramById(programId);
    if (prog) {
      const eligible = ownedCards.filter((card) => {
        const summary = getCardRightsSummary(card.id);
        if (summary.available <= 0) return false;
        if (prog.filter) {
          if (prog.filter.rarities && !prog.filter.rarities.includes(card.rarity)) return false;
          if (prog.filter.themeIds && !prog.filter.themeIds.includes(card.themeId)) return false;
          if (prog.filter.cardIds && !prog.filter.cardIds.includes(card.id)) return false;
        }
        return true;
      });
      setEligibleCards(eligible);
    }
  }, [programId]);

  // Simulator
  const simulator = useCollabSimulator({
    program,
    enabled: mounted && program != null && localProgress?.status !== "completed",
  });

  // Sync simulator state
  useEffect(() => {
    if (simulator.progress) {
      setLocalProgress(simulator.progress);
    }
  }, [simulator.progress]);

  useEffect(() => {
    if (simulator.latestFeedItems.length > 0) {
      setFeedItems(getCollabFeed(programId));
      const user = getUser();
      setLeaderboard(computeLeaderboard(programId, user?.displayName || ""));
    }
  }, [simulator.latestFeedItems, programId]);

  useEffect(() => {
    if (simulator.goalReached) {
      setShowCelebration(true);
    }
  }, [simulator.goalReached]);

  // Initial load
  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const prog = getCollabProgramById(programId);
    if (!prog) {
      router.replace("/programs");
      return;
    }

    setProgram(prog);
    refreshState();
    setMounted(true);
  }, [programId, router, refreshState]);

  // Focus refresh
  useEffect(() => {
    const handleFocus = () => refreshState();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshState]);

  const handleContribute = async () => {
    if (!selectedCard || !program) return;
    setIsConfirming(true);

    const result = executeCollabContribution(selectedCard.id, program.id);

    if (result.success) {
      setShowContributeModal(false);
      setSelectedCard(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2000);
      refreshState();

      if (result.goalReached) {
        setTimeout(() => setShowCelebration(true), 500);
      }
    }

    setIsConfirming(false);
  };

  const handleClaimRewards = () => {
    if (!program) return;
    const result = claimCollabRewards(program.id);
    if (result.success) {
      setRewardsClaimed(true);
      setCoinsState(getCoins());
      refreshState();
    }
  };

  if (!mounted || !program) {
    return <div className="min-h-screen bg-[#F4F5F6]" />;
  }

  const current = (localProgress?.realPoints || 0) + (localProgress?.simulatedPoints || 0);
  const isCompleted = localProgress?.status === "completed";
  const hasContributed = (localProgress?.realPoints || 0) > 0;
  const IconComponent = ICON_MAP[program.iconName] || Users;

  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="rounded-full p-1 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="flex-1 text-sm font-bold text-gray-900">共闘プログラム</span>
          {!isCompleted && <LiveDot />}
          {isCompleted && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">達成</span>
          )}
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Program Info */}
        <motion.div
          className="mt-4 rounded-2xl bg-white p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${program.accentColor}15` }}
            >
              <IconComponent className="h-6 w-6" style={{ color: program.accentColor }} />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900">{program.title}</h1>
              <p className="text-xs text-gray-500">{program.description}</p>
            </div>
          </div>

          <GlobalProgressBar
            current={current}
            goal={program.goalPoints}
            accentColor={program.accentColor}
            size="lg"
          />
        </motion.div>

        {/* Contribute Button */}
        {!isCompleted && (
          <motion.button
            className="mt-4 w-full rounded-2xl py-4 text-center text-base font-bold text-white shadow-lg"
            style={{ backgroundColor: program.accentColor }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowContributeModal(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            共闘に参加する
          </motion.button>
        )}

        {/* Rewards Section */}
        <motion.div
          className="mt-4 rounded-2xl bg-white p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
            <Gift className="h-4 w-4" style={{ color: program.accentColor }} />
            報酬
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-600">参加者全員</span>
              <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                <Coins className="h-3.5 w-3.5" />
                {program.participationRewardCoins}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
              <span className="text-xs text-amber-700">トップ貢献者</span>
              <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                <Coins className="h-3.5 w-3.5" />
                +{program.topContributorBonusCoins}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2">
              <span className="text-xs text-purple-700">MVP</span>
              <span className="flex items-center gap-1 text-sm font-bold text-purple-600">
                <Coins className="h-3.5 w-3.5" />
                +{program.mvpBonusCoins}
              </span>
            </div>
          </div>

          {/* Claim button */}
          {isCompleted && hasContributed && !rewardsClaimed && (
            <motion.button
              className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ backgroundColor: program.accentColor }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClaimRewards}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              報酬を受け取る
            </motion.button>
          )}
          {rewardsClaimed && (
            <div className="mt-3 rounded-lg bg-green-50 p-2 text-center text-xs font-bold text-green-600">
              受取済み
            </div>
          )}

          {/* Badges */}
          {rewardsClaimed && (
            <div className="mt-4">
              <CollabBadgeDisplay badges={getCollabBadgesForProgram(program.id)} />
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          className="mt-4 rounded-2xl bg-white p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-3 text-sm font-bold text-gray-900">
            貢献者ランキング
          </h2>
          <Leaderboard entries={leaderboard} />
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          className="mt-4 rounded-2xl bg-white p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="mb-3 text-sm font-bold text-gray-900">
            アクティビティ
          </h2>
          <ActivityFeed items={feedItems} />
        </motion.div>
      </div>

      {/* Contribute Modal */}
      <ContributeModal
        isOpen={showContributeModal}
        onClose={() => { setShowContributeModal(false); setSelectedCard(null); }}
        program={program}
        eligibleCards={eligibleCards}
        onSelectCard={setSelectedCard}
        selectedCard={selectedCard}
        onConfirm={handleContribute}
        isConfirming={isConfirming}
      />

      {/* Celebration */}
      <CollabCelebration
        isVisible={showCelebration}
        programTitle={program.title}
        accentColor={program.accentColor}
        onDismiss={() => setShowCelebration(false)}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <motion.div
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          権利を投じました
        </motion.div>
      )}
    </AppShell>
  );
}
