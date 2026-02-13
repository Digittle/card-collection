"use client";

import {
  RightAllocation,
  RARITY_RIGHTS,
  CollabContribution,
  CollabFeedItem,
  CollabBadge,
  CollaborativeProgram,
  CollabProgramProgress,
} from "@/types";
import { getCards, getAllocations, addAllocation, getCoins, setCoins, getUser } from "./store";
import {
  getCollabProgress,
  setCollabProgress,
  addCollabContribution,
  addCollabFeedItem,
  addCollabBadge,
  computeLeaderboard,
} from "./collab-store";
import { getCollabProgramById, getAllCollabPrograms } from "./collab-data";
import { DEMO_CARDS } from "./cards-data";
import { getCardRightsSummary } from "./rights-engine";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Execute a contribution to a collaborative program
export function executeCollabContribution(
  cardId: string,
  collabProgramId: string
): { success: true; allocationId: string; goalReached: boolean } | { success: false; reason: string } {
  const user = getUser();
  if (!user) return { success: false, reason: "ログインしてください" };

  const program = getCollabProgramById(collabProgramId);
  if (!program) return { success: false, reason: "共同プログラムが見つかりません" };

  // Check program status
  let progress = getCollabProgress(collabProgramId);
  if (progress?.status === "completed") {
    return { success: false, reason: "このプログラムは既に達成されています" };
  }

  // Card ownership
  const ownedCards = getCards();
  const ownedCard = ownedCards.find((c) => c.id === cardId);
  if (!ownedCard) return { success: false, reason: "このカードを所有していません" };

  // Filter check
  if (program.filter) {
    if (program.filter.rarities && !program.filter.rarities.includes(ownedCard.rarity)) {
      return { success: false, reason: "このカードのレアリティは要件に一致しません" };
    }
    if (program.filter.themeIds && !program.filter.themeIds.includes(ownedCard.themeId)) {
      return { success: false, reason: "このカードのテーマは要件に一致しません" };
    }
    if (program.filter.cardIds && !program.filter.cardIds.includes(ownedCard.id)) {
      return { success: false, reason: "このカードは要件に一致しません" };
    }
  }

  // Find available right
  const summary = getCardRightsSummary(cardId);
  if (summary.available <= 0) {
    return { success: false, reason: "このカードに利用可能な権利がありません" };
  }

  const usedIndices = new Set(summary.allocations.map((a) => a.rightIndex));
  let nextIndex = -1;
  for (let i = 0; i < summary.total; i++) {
    if (!usedIndices.has(i)) { nextIndex = i; break; }
  }
  if (nextIndex === -1) return { success: false, reason: "利用可能な権利インデックスがありません" };

  // Double-spend check
  const allAllocations = getAllocations();
  const alreadyUsed = allAllocations.some(
    (a) => a.cardId === cardId && a.rightIndex === nextIndex
  );
  if (alreadyUsed) return { success: false, reason: "この権利は既に使用されています" };

  // Record allocation in localStorage (prevents individual program double-spend)
  const allocationId = `${cardId}_${nextIndex}_collab:${collabProgramId}`;
  const allocation: RightAllocation = {
    id: allocationId,
    cardId,
    rightIndex: nextIndex,
    programId: `collab:${collabProgramId}`,
    allocatedAt: new Date().toISOString(),
  };
  addAllocation(allocation);

  // Record contribution
  const contribution: CollabContribution = {
    id: generateId(),
    programId: collabProgramId,
    userName: user.displayName,
    cardTitle: ownedCard.title,
    cardRarity: ownedCard.rarity,
    points: 1,
    isReal: true,
    createdAt: new Date().toISOString(),
  };
  addCollabContribution(contribution);

  // Add feed item
  const feedItem: CollabFeedItem = {
    id: generateId(),
    programId: collabProgramId,
    type: "contribution",
    userName: user.displayName,
    message: `あなたが「${ownedCard.title}」の権利を投じました`,
    isReal: true,
    createdAt: new Date().toISOString(),
  };
  addCollabFeedItem(feedItem);

  // Update progress
  if (!progress) {
    progress = {
      programId: collabProgramId,
      realPoints: 0,
      simulatedPoints: 0,
      status: "active",
      completedAt: null,
      startedAt: new Date().toISOString(),
      lastSimulatedAt: new Date().toISOString(),
      rewardsClaimed: false,
      myRank: 1,
    };
  }
  progress.realPoints += 1;

  // Check goal
  const totalPoints = progress.realPoints + progress.simulatedPoints;
  const goalReached = totalPoints >= program.goalPoints;

  if (goalReached && progress.status !== "completed") {
    progress.status = "completed";
    progress.completedAt = new Date().toISOString();

    // Add completion feed item
    const leaderboard = computeLeaderboard(collabProgramId, user.displayName);
    const contributorCount = leaderboard.length;
    addCollabFeedItem({
      id: generateId(),
      programId: collabProgramId,
      type: "completion",
      userName: null,
      message: `プログラム達成！${contributorCount}人の力で目標を達成しました！`,
      isReal: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Update rank
  const leaderboard = computeLeaderboard(collabProgramId, user.displayName);
  const myEntry = leaderboard.find((e) => e.isCurrentUser);
  progress.myRank = myEntry?.rank || leaderboard.length + 1;

  setCollabProgress(progress);

  return { success: true, allocationId, goalReached };
}

// Claim rewards for a completed collaborative program
export function claimCollabRewards(collabProgramId: string): {
  success: boolean;
  coinsAwarded: number;
  badgeTier: string;
} {
  const user = getUser();
  if (!user) return { success: false, coinsAwarded: 0, badgeTier: "" };

  const program = getCollabProgramById(collabProgramId);
  if (!program) return { success: false, coinsAwarded: 0, badgeTier: "" };

  const progress = getCollabProgress(collabProgramId);
  if (!progress || progress.status !== "completed" || progress.rewardsClaimed) {
    return { success: false, coinsAwarded: 0, badgeTier: "" };
  }

  // Determine tier based on rank
  const leaderboard = computeLeaderboard(collabProgramId, user.displayName);
  const myEntry = leaderboard.find((e) => e.isCurrentUser);

  if (!myEntry) return { success: false, coinsAwarded: 0, badgeTier: "" };

  const totalContributors = leaderboard.length;
  const top10Cutoff = Math.max(1, Math.ceil(totalContributors * 0.1));

  let coinsAwarded = program.participationRewardCoins;
  let badgeTier: "participant" | "top_contributor" | "mvp" = "participant";

  if (myEntry.rank === 1) {
    badgeTier = "mvp";
    coinsAwarded += program.topContributorBonusCoins + program.mvpBonusCoins;
  } else if (myEntry.rank <= top10Cutoff) {
    badgeTier = "top_contributor";
    coinsAwarded += program.topContributorBonusCoins;
  }

  // Award coins
  setCoins(getCoins() + coinsAwarded);

  // Award badge
  const badge: CollabBadge = {
    id: `${collabProgramId}_${badgeTier}`,
    programId: collabProgramId,
    tier: badgeTier,
    earnedAt: new Date().toISOString(),
  };
  addCollabBadge(badge);

  // Mark as claimed
  progress.rewardsClaimed = true;
  setCollabProgress(progress);

  return { success: true, coinsAwarded, badgeTier };
}

// Get eligible collaborative programs for a card
export function getEligibleCollabPrograms(cardId: string): CollaborativeProgram[] {
  const card = DEMO_CARDS.find((c) => c.id === cardId);
  if (!card) return [];

  const ownedCards = getCards();
  if (!ownedCards.some((c) => c.id === cardId)) return [];

  const summary = getCardRightsSummary(cardId);
  if (summary.available <= 0) return [];

  return getAllCollabPrograms().filter((program) => {
    const progress = getCollabProgress(program.id);
    if (progress?.status === "completed") return false;

    if (program.filter) {
      if (program.filter.rarities && !program.filter.rarities.includes(card.rarity)) return false;
      if (program.filter.themeIds && !program.filter.themeIds.includes(card.themeId)) return false;
      if (program.filter.cardIds && !program.filter.cardIds.includes(card.id)) return false;
    }

    return true;
  });
}
