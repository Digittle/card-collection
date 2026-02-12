"use client";

import { RightAllocation, RARITY_RIGHTS, Program } from "@/types";
import {
  getCards,
  getAllocations,
  addAllocation,
  getCardAllocations,
  getProgramProgress,
  setProgramProgress,
  getCoins,
  setCoins,
} from "./store";
import { getProgramById, getAllPrograms } from "./programs-data";
import { DEMO_CARDS } from "./cards-data";

// Get summary for a specific card
export function getCardRightsSummary(cardId: string): {
  total: number;
  consumed: number;
  available: number;
  allocations: RightAllocation[];
} {
  const card = DEMO_CARDS.find((c) => c.id === cardId);
  if (!card) {
    return { total: 0, consumed: 0, available: 0, allocations: [] };
  }

  const total = RARITY_RIGHTS[card.rarity];
  const allocations = getCardAllocations(cardId);
  const consumed = allocations.length;
  const available = Math.max(0, total - consumed);

  return { total, consumed, available, allocations };
}

// Validate an allocation before executing
export function validateAllocation(
  cardId: string,
  rightIndex: number,
  programId: string,
  requirementId: string
): { valid: true } | { valid: false; reason: string } {
  // 1. Card ownership
  const ownedCards = getCards();
  const ownedCard = ownedCards.find((c) => c.id === cardId);
  if (!ownedCard) {
    return { valid: false, reason: "このカードを所有していません" };
  }

  // 2. Right index bounds
  const maxRights = RARITY_RIGHTS[ownedCard.rarity];
  if (rightIndex < 0 || rightIndex >= maxRights) {
    return {
      valid: false,
      reason: `権利インデックスが範囲外です（0〜${maxRights - 1}）`,
    };
  }

  // 3. Double-spend prevention
  const allAllocations = getAllocations();
  const alreadyUsed = allAllocations.some(
    (a) => a.cardId === cardId && a.rightIndex === rightIndex
  );
  if (alreadyUsed) {
    return { valid: false, reason: "この権利は既に使用されています" };
  }

  // 4. Program existence and active status
  const program = getProgramById(programId);
  if (!program) {
    return { valid: false, reason: "プログラムが見つかりません" };
  }
  if (!program.isActive) {
    return { valid: false, reason: "このプログラムは現在無効です" };
  }

  // 5. Requirement existence and filter match
  const requirement = program.requirements.find((r) => r.id === requirementId);
  if (!requirement) {
    return { valid: false, reason: "要件が見つかりません" };
  }

  if (requirement.filter) {
    const { themeIds, rarities, cardIds } = requirement.filter;
    if (themeIds && !themeIds.includes(ownedCard.themeId)) {
      return { valid: false, reason: "このカードのテーマは要件に一致しません" };
    }
    if (rarities && !rarities.includes(ownedCard.rarity)) {
      return {
        valid: false,
        reason: "このカードのレアリティは要件に一致しません",
      };
    }
    if (cardIds && !cardIds.includes(ownedCard.id)) {
      return { valid: false, reason: "このカードは要件に一致しません" };
    }
  }

  // 6. Requirement capacity
  const progress = getProgramProgress(programId);
  if (progress) {
    const currentAllocations = progress.allocations[requirementId] || [];
    if (currentAllocations.length >= requirement.rightPointsNeeded) {
      return { valid: false, reason: "この要件は既に満たされています" };
    }
  }

  return { valid: true };
}

// Execute an allocation
export function executeAllocation(
  cardId: string,
  programId: string,
  requirementId: string
): { success: true; allocationId: string } | { success: false; reason: string } {
  // 1. Find the next available rightIndex for this card
  const summary = getCardRightsSummary(cardId);
  if (summary.available <= 0) {
    return { success: false, reason: "このカードに利用可能な権利がありません" };
  }

  const usedIndices = new Set(summary.allocations.map((a) => a.rightIndex));
  let nextIndex = -1;
  for (let i = 0; i < summary.total; i++) {
    if (!usedIndices.has(i)) {
      nextIndex = i;
      break;
    }
  }

  if (nextIndex === -1) {
    return { success: false, reason: "利用可能な権利インデックスがありません" };
  }

  // 2. Validate
  const validation = validateAllocation(cardId, nextIndex, programId, requirementId);
  if (!validation.valid) {
    return { success: false, reason: validation.reason };
  }

  // 3. Create RightAllocation record
  const allocationId = `${cardId}_${nextIndex}_${programId}`;
  const allocation: RightAllocation = {
    id: allocationId,
    cardId,
    rightIndex: nextIndex,
    programId,
    allocatedAt: new Date().toISOString(),
  };

  // 4. Add to global ledger
  addAllocation(allocation);

  // 5. Update program progress
  let progress = getProgramProgress(programId);
  if (!progress) {
    progress = {
      programId,
      allocations: {},
      isCompleted: false,
      completedAt: null,
      startedAt: new Date().toISOString(),
      rewardsClaimed: false,
    };
  }

  if (!progress.allocations[requirementId]) {
    progress.allocations[requirementId] = [];
  }
  progress.allocations[requirementId].push(allocationId);

  // 6. Check if program is now complete
  const program = getProgramById(programId)!;
  const isComplete = program.requirements.every((req) => {
    const reqAllocations = progress!.allocations[req.id] || [];
    return reqAllocations.length >= req.rightPointsNeeded;
  });

  if (isComplete && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date().toISOString();

    // Give coin reward
    if (program.rewardCoins) {
      const currentCoins = getCoins();
      setCoins(currentCoins + program.rewardCoins);
    }
  }

  setProgramProgress(progress);

  // 7. Return result
  return { success: true, allocationId };
}

// Get programs that can accept rights from a specific card
export function getEligiblePrograms(cardId: string): Program[] {
  const card = DEMO_CARDS.find((c) => c.id === cardId);
  if (!card) return [];

  const ownedCards = getCards();
  const isOwned = ownedCards.some((c) => c.id === cardId);
  if (!isOwned) return [];

  const summary = getCardRightsSummary(cardId);
  if (summary.available <= 0) return [];

  const allPrograms = getAllPrograms();

  return allPrograms.filter((program) => {
    if (!program.isActive) return false;

    const progress = getProgramProgress(program.id);
    if (progress?.isCompleted) return false;

    // Check if any requirement can accept this card
    return program.requirements.some((req) => {
      // Check capacity
      const reqAllocations = progress?.allocations[req.id] || [];
      if (reqAllocations.length >= req.rightPointsNeeded) return false;

      // Check filter match
      if (req.filter) {
        const { themeIds, rarities, cardIds } = req.filter;
        if (themeIds && !themeIds.includes(card.themeId)) return false;
        if (rarities && !rarities.includes(card.rarity)) return false;
        if (cardIds && !cardIds.includes(card.id)) return false;
      }

      return true;
    });
  });
}
