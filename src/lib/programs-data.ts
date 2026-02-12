import { Program, ProgramCategory } from "@/types";

export const DEMO_PROGRAMS: Program[] = [
  {
    id: "program-001",
    title: "STARTO STARS コンプリートミッション",
    description:
      "STARTO STARSシリーズの全カードから権利を1つずつ消費して、コレクションを完成させよう！",
    iconName: "Star",
    accentColor: "#ec6d81",
    category: "collection",
    requirements: [
      {
        id: "req-001-1",
        label: "Snow Man の権利",
        rightPointsNeeded: 1,
        filter: { cardIds: ["card-001"] },
      },
      {
        id: "req-001-2",
        label: "SixTONES の権利",
        rightPointsNeeded: 1,
        filter: { cardIds: ["card-002"] },
      },
      {
        id: "req-001-3",
        label: "King & Prince の権利",
        rightPointsNeeded: 1,
        filter: { cardIds: ["card-003"] },
      },
      {
        id: "req-001-4",
        label: "なにわ男子 の権利",
        rightPointsNeeded: 1,
        filter: { cardIds: ["card-004"] },
      },
    ],
    rewardCoins: 300,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "program-002",
    title: "レジェンダリーチャレンジ",
    description:
      "レジェンダリーレアリティのカードから合計3ポイント分の権利を消費して、伝説の証を手に入れよう！",
    iconName: "Crown",
    accentColor: "#F6AB00",
    category: "challenge",
    requirements: [
      {
        id: "req-002-1",
        label: "レジェンダリーカードの権利 ×3",
        rightPointsNeeded: 3,
        filter: { rarities: ["legendary"] },
      },
    ],
    rewardCoins: 500,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "program-003",
    title: "クロスシリーズ・エクスチェンジ",
    description:
      "異なるシリーズのカードから権利を消費して、クロスシリーズの絆を証明しよう！",
    iconName: "ArrowLeftRight",
    accentColor: "#8B5CF6",
    category: "challenge",
    requirements: [
      {
        id: "req-003-1",
        label: "STARTO STARS の権利",
        rightPointsNeeded: 1,
        filter: { themeIds: ["theme-stars"] },
      },
      {
        id: "req-003-2",
        label: "STARTO LEGENDS の権利",
        rightPointsNeeded: 1,
        filter: { themeIds: ["theme-legends"] },
      },
    ],
    rewardCoins: 200,
    isActive: true,
    sortOrder: 3,
  },
];

export function getProgramById(id: string): Program | undefined {
  return DEMO_PROGRAMS.find((p) => p.id === id);
}

export function getAllPrograms(): Program[] {
  return DEMO_PROGRAMS;
}

export function getProgramsByCategory(category: ProgramCategory): Program[] {
  return DEMO_PROGRAMS.filter((p) => p.category === category);
}
