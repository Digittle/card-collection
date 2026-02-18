import { CheckinCard } from "./checkin-store";

export const CHECKIN_MILESTONE_CARDS: CheckinCard[] = [
  {
    id: "checkin_welcome_001",
    memberId: "universal",
    groupId: "starto",
    memberName: "チェックイン記念",
    groupName: "STARTO ENTERTAINMENT",
    memberColor: "#ec6d81",
    title: "ウェルカムカード",
    description: "初回チェックインありがとう！推し活の始まりです♪",
    series: "チェックイン記念",
    rarity: "normal",
    cardNumber: 1,
    totalInSeries: 6,
    milestone: 1,
    unlocked: false,
  },
  {
    id: "checkin_normal_001",
    memberId: "universal",
    groupId: "starto",
    memberName: "継続は力なり",
    groupName: "STARTO ENTERTAINMENT", 
    memberColor: "#3B82F6",
    title: "ノーマルカード",
    description: "5回のチェックイン達成！素晴らしいスタートです！",
    series: "チェックイン記念",
    rarity: "normal",
    cardNumber: 2,
    totalInSeries: 6,
    milestone: 5,
    unlocked: false,
  },
  {
    id: "checkin_rare_001",
    memberId: "universal",
    groupId: "starto",
    memberName: "推し活マスター",
    groupName: "STARTO ENTERTAINMENT",
    memberColor: "#A855F7",
    title: "レアカード",
    description: "10回のチェックイン達成！推し活の習慣化ができています！",
    series: "チェックイン記念",
    rarity: "rare",
    cardNumber: 3,
    totalInSeries: 6,
    milestone: 10,
    unlocked: false,
  },
  {
    id: "checkin_sr_001",
    memberId: "universal",
    groupId: "starto",
    memberName: "推し愛継続者",
    groupName: "STARTO ENTERTAINMENT",
    memberColor: "#A855F7",
    title: "SRカード",
    description: "25回のチェックイン達成！あなたの推し愛は本物です✨",
    series: "チェックイン記念",
    rarity: "sr",
    cardNumber: 4,
    totalInSeries: 6,
    milestone: 25,
    unlocked: false,
  },
  {
    id: "checkin_ssr_001",
    memberId: "universal",
    groupId: "starto",
    memberName: "真の推し",
    groupName: "STARTO ENTERTAINMENT",
    memberColor: "#F59E0B",
    title: "SSRカード",
    description: "50回のチェックイン達成！真の推しファンの証です！",
    series: "チェックイン記念",
    rarity: "ur",
    cardNumber: 5,
    totalInSeries: 6,
    milestone: 50,
    unlocked: false,
  },
  {
    id: "checkin_legend_001",
    memberId: "universal",
    groupId: "starto",
    memberName: "伝説のファン",
    groupName: "STARTO ENTERTAINMENT",
    memberColor: "#EF4444",
    title: "限定カード",
    description: "100回のチェックイン達成！あなたは伝説のファンです！！",
    series: "チェックイン記念",
    rarity: "legend",
    cardNumber: 6,
    totalInSeries: 6,
    milestone: 100,
    unlocked: false,
  },
];

export function getNextMilestone(currentCount: number): CheckinCard | null {
  return CHECKIN_MILESTONE_CARDS.find(card => card.milestone > currentCount) || null;
}

export function getUnlockedCards(currentCount: number): CheckinCard[] {
  return CHECKIN_MILESTONE_CARDS.filter(card => currentCount >= card.milestone);
}

export function getLockedCards(currentCount: number): CheckinCard[] {
  return CHECKIN_MILESTONE_CARDS.filter(card => currentCount < card.milestone);
}