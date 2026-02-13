"use client";

import {
  CollaborativeProgram,
  CollabProgramProgress,
  CollabContribution,
  CollabFeedItem,
  Rarity,
} from "@/types";
import { DEMO_CARDS } from "./cards-data";
import { VIRTUAL_USER_NAMES } from "./collab-data";
import {
  getCollabProgress,
  setCollabProgress,
  addCollabContributions,
  addCollabFeedItems,
  computeLeaderboard,
} from "./collab-store";
import { getUser } from "./store";

function generateId(): string {
  return `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getEligibleCards(program: CollaborativeProgram) {
  return DEMO_CARDS.filter((card) => {
    if (!program.filter) return true;
    if (program.filter.rarities && !program.filter.rarities.includes(card.rarity)) return false;
    if (program.filter.themeIds && !program.filter.themeIds.includes(card.themeId)) return false;
    if (program.filter.cardIds && !program.filter.cardIds.includes(card.id)) return false;
    return true;
  });
}

// Milestones to check
const MILESTONES = [25, 50, 75, 90];

export interface SimulationResult {
  newContributions: CollabContribution[];
  newFeedItems: CollabFeedItem[];
  updatedProgress: CollabProgramProgress;
  goalReached: boolean;
  milestoneReached: number | null;
}

// Run one simulation tick for a program
export function simulateTick(program: CollaborativeProgram): SimulationResult | null {
  let progress = getCollabProgress(program.id);

  // Initialize if needed
  if (!progress) {
    progress = {
      programId: program.id,
      realPoints: 0,
      simulatedPoints: 0,
      status: "active",
      completedAt: null,
      startedAt: new Date().toISOString(),
      lastSimulatedAt: new Date().toISOString(),
      rewardsClaimed: false,
      myRank: 0,
    };
  }

  if (progress.status === "completed") return null;

  const totalBefore = progress.realPoints + progress.simulatedPoints;
  if (totalBefore >= program.goalPoints) return null;

  // Calculate how many points to generate (1 per tick, occasionally 2)
  const remaining = program.goalPoints - totalBefore;
  const progressPct = totalBefore / program.goalPoints;

  // Slow down as we approach goal (creates anticipation)
  const slowdownFactor = progressPct > 0.8 ? 0.3 : progressPct > 0.6 ? 0.6 : 1;
  const shouldGenerate = Math.random() < slowdownFactor;

  if (!shouldGenerate) {
    progress.lastSimulatedAt = new Date().toISOString();
    setCollabProgress(progress);
    return null;
  }

  const pointsToAdd = Math.min(1, remaining);
  const eligibleCards = getEligibleCards(program);
  if (eligibleCards.length === 0) return null;

  const userName = randomChoice(VIRTUAL_USER_NAMES);
  const card = randomChoice(eligibleCards);

  const contribution: CollabContribution = {
    id: generateId(),
    programId: program.id,
    userName,
    cardTitle: card.title,
    cardRarity: card.rarity,
    points: pointsToAdd,
    isReal: false,
    createdAt: new Date().toISOString(),
  };

  const feedItem: CollabFeedItem = {
    id: generateId(),
    programId: program.id,
    type: "contribution",
    userName,
    message: `${userName}さんが「${card.title}」の権利を投じました`,
    isReal: false,
    createdAt: new Date().toISOString(),
  };

  const newFeedItems: CollabFeedItem[] = [feedItem];

  progress.simulatedPoints += pointsToAdd;
  progress.lastSimulatedAt = new Date().toISOString();

  const totalAfter = progress.realPoints + progress.simulatedPoints;
  const pctBefore = Math.floor((totalBefore / program.goalPoints) * 100);
  const pctAfter = Math.floor((totalAfter / program.goalPoints) * 100);

  // Check milestones
  let milestoneReached: number | null = null;
  for (const milestone of MILESTONES) {
    if (pctBefore < milestone && pctAfter >= milestone) {
      milestoneReached = milestone;
      newFeedItems.push({
        id: generateId(),
        programId: program.id,
        type: "milestone",
        userName: null,
        message: `目標の${milestone}%に到達！（${totalAfter}/${program.goalPoints}）`,
        isReal: false,
        createdAt: new Date().toISOString(),
      });
      break; // Only one milestone per tick
    }
  }

  // Check goal
  const goalReached = totalAfter >= program.goalPoints;
  if (goalReached) {
    progress.status = "completed";
    progress.completedAt = new Date().toISOString();

    const user = getUser();
    const leaderboard = computeLeaderboard(program.id, user?.displayName || "");
    const contributorCount = leaderboard.length + 1; // +1 for the sim user

    newFeedItems.push({
      id: generateId(),
      programId: program.id,
      type: "completion",
      userName: null,
      message: `プログラム達成！${contributorCount}人の力で目標を達成しました！`,
      isReal: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Update rank
  const user = getUser();
  if (user) {
    const leaderboard = computeLeaderboard(program.id, user.displayName);
    const myEntry = leaderboard.find((e) => e.isCurrentUser);
    progress.myRank = myEntry?.rank || 0;
  }

  // Persist
  addCollabContributions([contribution]);
  addCollabFeedItems(newFeedItems);
  setCollabProgress(progress);

  return {
    newContributions: [contribution],
    newFeedItems,
    updatedProgress: progress,
    goalReached,
    milestoneReached,
  };
}

// Catch up simulation for time passed while app was closed
export function catchUpSimulation(program: CollaborativeProgram): void {
  let progress = getCollabProgress(program.id);
  if (!progress || progress.status === "completed") return;

  const lastSim = new Date(progress.lastSimulatedAt).getTime();
  const now = Date.now();
  const elapsedSeconds = (now - lastSim) / 1000;

  // Generate ~1 point per 30 seconds while away, capped
  const maxCatchUp = Math.min(Math.floor(elapsedSeconds / 30), 10);
  if (maxCatchUp <= 0) return;

  const remaining = program.goalPoints - (progress.realPoints + progress.simulatedPoints);
  const pointsToAdd = Math.min(maxCatchUp, remaining);
  if (pointsToAdd <= 0) return;

  const eligibleCards = getEligibleCards(program);
  if (eligibleCards.length === 0) return;

  const contributions: CollabContribution[] = [];
  const feedItems: CollabFeedItem[] = [];

  for (let i = 0; i < pointsToAdd; i++) {
    const userName = randomChoice(VIRTUAL_USER_NAMES);
    const card = randomChoice(eligibleCards);
    const timestamp = new Date(lastSim + ((i + 1) * (elapsedSeconds * 1000)) / (pointsToAdd + 1)).toISOString();

    contributions.push({
      id: generateId(),
      programId: program.id,
      userName,
      cardTitle: card.title,
      cardRarity: card.rarity,
      points: 1,
      isReal: false,
      createdAt: timestamp,
    });

    feedItems.push({
      id: generateId(),
      programId: program.id,
      type: "contribution",
      userName,
      message: `${userName}さんが「${card.title}」の権利を投じました`,
      isReal: false,
      createdAt: timestamp,
    });
  }

  const totalBefore = progress.realPoints + progress.simulatedPoints;
  progress.simulatedPoints += pointsToAdd;
  progress.lastSimulatedAt = new Date().toISOString();

  const totalAfter = progress.realPoints + progress.simulatedPoints;
  const pctBefore = Math.floor((totalBefore / program.goalPoints) * 100);
  const pctAfter = Math.floor((totalAfter / program.goalPoints) * 100);

  // Milestones
  for (const milestone of MILESTONES) {
    if (pctBefore < milestone && pctAfter >= milestone) {
      feedItems.push({
        id: generateId(),
        programId: program.id,
        type: "milestone",
        userName: null,
        message: `目標の${milestone}%に到達！（${totalAfter}/${program.goalPoints}）`,
        isReal: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Goal check
  if (totalAfter >= program.goalPoints) {
    progress.status = "completed";
    progress.completedAt = new Date().toISOString();
    feedItems.push({
      id: generateId(),
      programId: program.id,
      type: "completion",
      userName: null,
      message: `プログラム達成！みんなの力で目標を達成しました！`,
      isReal: false,
      createdAt: new Date().toISOString(),
    });
  }

  addCollabContributions(contributions);
  addCollabFeedItems(feedItems);
  setCollabProgress(progress);
}
