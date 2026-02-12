import { Badge } from "@/types";

export const DEMO_BADGES: Badge[] = [
  {
    id: "badge-001",
    title: "はじめの一歩",
    description: "最初のカードを手に入れた！コレクターへの第一歩を踏み出そう。",
    iconName: "Footprints",
    tier: "bronze",
    accentColor: "#CD7F32",
    trigger: { type: "card_count", threshold: 1 },
    sortOrder: 1,
  },
  {
    id: "badge-002",
    title: "コレクター",
    description: "4枚のカードを集めた！立派なコレクターの仲間入り。",
    iconName: "LayoutGrid",
    tier: "silver",
    accentColor: "#C0C0C0",
    trigger: { type: "card_count", threshold: 4 },
    sortOrder: 2,
  },
  {
    id: "badge-003",
    title: "コンプリートマスター",
    description: "全8枚のカードをコンプリート！真のマスターコレクターの証。",
    iconName: "Trophy",
    tier: "platinum",
    accentColor: "#E5E4E2",
    trigger: { type: "card_count", threshold: 8 },
    sortOrder: 3,
  },
  {
    id: "badge-004",
    title: "STARS マスター",
    description:
      "STARTO STARS コンプリートミッションを達成！STARSの全カードの権利を使いこなした証。",
    iconName: "Star",
    tier: "gold",
    accentColor: "#FFD700",
    trigger: { type: "program_complete", programId: "program-001" },
    sortOrder: 4,
  },
  {
    id: "badge-005",
    title: "レジェンドの証",
    description:
      "レジェンダリーチャレンジを達成！伝説のカードの力を証明した。",
    iconName: "Crown",
    tier: "gold",
    accentColor: "#FFD700",
    trigger: { type: "program_complete", programId: "program-002" },
    sortOrder: 5,
  },
  {
    id: "badge-006",
    title: "クロスシリーズ",
    description:
      "クロスシリーズ・エクスチェンジを達成！シリーズを超えた絆を証明した。",
    iconName: "ArrowLeftRight",
    tier: "silver",
    accentColor: "#C0C0C0",
    trigger: { type: "program_complete", programId: "program-003" },
    sortOrder: 6,
  },
  {
    id: "badge-007",
    title: "権利の使い手",
    description: "合計5回以上の権利を消費した！プログラムを活用するエキスパート。",
    iconName: "Zap",
    tier: "bronze",
    accentColor: "#CD7F32",
    trigger: { type: "rights_consumed", threshold: 5 },
    sortOrder: 7,
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return DEMO_BADGES.find((b) => b.id === id);
}

export function getAllBadges(): Badge[] {
  return DEMO_BADGES;
}
