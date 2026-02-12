"use client";

import { Badge } from "@/types";
import {
  getAllocations,
  getCards,
  getEarnedBadges,
  addEarnedBadge,
  addToBadgeQueue,
  getProgramProgress,
} from "./store";
import { getAllBadges } from "./badges-data";
import { getCardsByTheme } from "./cards-data";
import { getAllPrograms } from "./programs-data";

function checkTrigger(badge: Badge): boolean {
  const { trigger } = badge;

  switch (trigger.type) {
    case "card_count": {
      const count = getCards().length;
      return count >= (trigger.threshold ?? 0);
    }

    case "first_purchase": {
      return getCards().length >= 1;
    }

    case "theme_complete": {
      if (!trigger.targetId) return false;
      const ownedInTheme = getCards().filter(
        (c) => c.themeId === trigger.targetId
      );
      const totalInTheme = getCardsByTheme(trigger.targetId!).length;
      return totalInTheme > 0 && ownedInTheme.length >= totalInTheme;
    }

    case "rarity_collect": {
      // Not used by current badges but implemented for completeness
      const ownedOfRarity = getCards().filter(
        (c) => c.rarity === trigger.targetId
      );
      return ownedOfRarity.length >= (trigger.threshold ?? 0);
    }

    case "program_complete": {
      if (!trigger.programId) return false;
      const progress = getProgramProgress(trigger.programId);
      return progress?.isCompleted === true;
    }

    case "rights_consumed": {
      const allocations = getAllocations();
      return allocations.length >= (trigger.threshold ?? 0);
    }

    case "all_programs": {
      const allPrograms = getAllPrograms();
      if (allPrograms.length === 0) return false;
      return allPrograms.every((program) => {
        const progress = getProgramProgress(program.id);
        return progress?.isCompleted === true;
      });
    }

    case "manual": {
      // Manual badges are awarded externally, never auto-triggered
      return false;
    }

    default:
      return false;
  }
}

// Check all badge triggers, award new badges, return newly awarded badge IDs
export function evaluateBadges(): string[] {
  const earnedBadges = getEarnedBadges();
  const earnedIds = new Set(earnedBadges.map((b) => b.badgeId));
  const allBadges = getAllBadges();
  const newlyAwarded: string[] = [];

  for (const badge of allBadges) {
    // Skip already earned
    if (earnedIds.has(badge.id)) continue;

    // Check trigger
    if (checkTrigger(badge)) {
      addEarnedBadge({
        badgeId: badge.id,
        earnedAt: new Date().toISOString(),
        seen: false,
      });
      addToBadgeQueue(badge.id);
      newlyAwarded.push(badge.id);
    }
  }

  return newlyAwarded;
}
