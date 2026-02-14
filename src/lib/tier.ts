import { OwnedCard, TierLevel } from "@/types";

export interface TierInfo {
  tier: TierLevel;
  label: string;
  labelEn: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  nextTier: TierLevel | null;
  progress: number; // 0-100, 次のtierまでの進捗
  totalActions: number;
  rareCardCount: number;
}

const TIER_THRESHOLDS = {
  silver: { actions: 10, rareCards: 5, rarityMin: "rare" as const },
  gold: { actions: 30, rareCards: 10, rarityMin: "sr" as const },
  platinum: { actions: 60, rareCards: 5, rarityMin: "ur" as const },
  diamond: { actions: 100, rareCards: 3, rarityMin: "legend" as const },
};

export function getTierInfo(stats: {
  gachaCount: number;
  purchaseCount: number;
  ownedCards: OwnedCard[];
}): TierInfo {
  const totalActions = stats.gachaCount + stats.purchaseCount;

  // Count cards by rarity threshold
  const rareCount = stats.ownedCards.filter((c) =>
    ["rare", "sr", "ur", "legend"].includes(c.rarity)
  ).length;
  const srCount = stats.ownedCards.filter((c) =>
    ["sr", "ur", "legend"].includes(c.rarity)
  ).length;
  const urCount = stats.ownedCards.filter((c) =>
    ["ur", "legend"].includes(c.rarity)
  ).length;
  const legendCount = stats.ownedCards.filter(
    (c) => c.rarity === "legend"
  ).length;

  let tier: TierLevel = "bronze";

  if (totalActions >= 100 && legendCount >= 3) {
    tier = "diamond";
  } else if (totalActions >= 60 && urCount >= 5) {
    tier = "platinum";
  } else if (totalActions >= 30 && srCount >= 10) {
    tier = "gold";
  } else if (totalActions >= 10 || rareCount >= 5) {
    tier = "silver";
  }

  // Calculate progress to next tier
  let progress = 0;
  let nextTier: TierLevel | null = null;

  switch (tier) {
    case "bronze": {
      nextTier = "silver";
      const actionProg = Math.min(totalActions / 10, 1);
      const cardProg = Math.min(rareCount / 5, 1);
      progress = Math.max(actionProg, cardProg) * 100;
      break;
    }
    case "silver": {
      nextTier = "gold";
      const actionProg = Math.min(totalActions / 30, 1);
      const cardProg = Math.min(srCount / 10, 1);
      progress = Math.min(actionProg, cardProg) * 100;
      break;
    }
    case "gold": {
      nextTier = "platinum";
      const actionProg = Math.min(totalActions / 60, 1);
      const cardProg = Math.min(urCount / 5, 1);
      progress = Math.min(actionProg, cardProg) * 100;
      break;
    }
    case "platinum": {
      nextTier = "diamond";
      const actionProg = Math.min(totalActions / 100, 1);
      const cardProg = Math.min(legendCount / 3, 1);
      progress = Math.min(actionProg, cardProg) * 100;
      break;
    }
    case "diamond": {
      nextTier = null;
      progress = 100;
      break;
    }
  }

  const rareCardCount = srCount + urCount + legendCount;

  const TIER_STYLES: Record<
    TierLevel,
    {
      label: string;
      labelEn: string;
      color: string;
      gradientFrom: string;
      gradientTo: string;
    }
  > = {
    bronze: {
      label: "ブロンズ",
      labelEn: "BRONZE",
      color: "#CD7F32",
      gradientFrom: "#CD7F32",
      gradientTo: "#A0522D",
    },
    silver: {
      label: "シルバー",
      labelEn: "SILVER",
      color: "#C0C0C0",
      gradientFrom: "#C0C0C0",
      gradientTo: "#808080",
    },
    gold: {
      label: "ゴールド",
      labelEn: "GOLD",
      color: "#FFD700",
      gradientFrom: "#FFD700",
      gradientTo: "#DAA520",
    },
    platinum: {
      label: "プラチナ",
      labelEn: "PLATINUM",
      color: "#E5E4E2",
      gradientFrom: "#E5E4E2",
      gradientTo: "#B0AFA8",
    },
    diamond: {
      label: "ダイヤモンド",
      labelEn: "DIAMOND",
      color: "#B9F2FF",
      gradientFrom: "#B9F2FF",
      gradientTo: "#7EC8E3",
    },
  };

  const style = TIER_STYLES[tier];

  return {
    tier,
    ...style,
    nextTier,
    progress: Math.round(progress),
    totalActions,
    rareCardCount,
  };
}
