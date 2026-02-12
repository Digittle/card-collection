import { CollaborativeProgram } from "@/types";

export const VIRTUAL_USER_NAMES = [
  "ゆうき", "はるか", "そうた", "みさき", "りょう", "あおい", "けんた", "さくら",
  "たくみ", "ひなた", "かいと", "もも", "しょうた", "ゆい", "れん", "あかり",
];

export const COLLAB_PROGRAMS: CollaborativeProgram[] = [
  {
    id: "collab-001",
    title: "みんなで集めよう！STARTO 50ポイント",
    description: "ユーザー全員で合計50ポイントの権利を消費して、コミュニティの結束を証明しよう！全カード対象。",
    iconName: "Users",
    accentColor: "#ec6d81",
    goalPoints: 50,
    participationRewardCoins: 500,
    topContributorBonusCoins: 300,
    mvpBonusCoins: 500,
    sortOrder: 1,
  },
  {
    id: "collab-002",
    title: "レジェンダリー・コレクティブ",
    description: "レジェンダリーカードの権利だけで達成する伝説の共同プログラム。選ばれし者たちよ、集結せよ！",
    iconName: "Crown",
    accentColor: "#f6ab00",
    goalPoints: 20,
    filter: {
      rarities: ["legendary"],
    },
    participationRewardCoins: 300,
    topContributorBonusCoins: 200,
    mvpBonusCoins: 400,
    sortOrder: 2,
  },
];

export function getCollabProgramById(id: string): CollaborativeProgram | undefined {
  return COLLAB_PROGRAMS.find((p) => p.id === id);
}

export function getAllCollabPrograms(): CollaborativeProgram[] {
  return COLLAB_PROGRAMS;
}
