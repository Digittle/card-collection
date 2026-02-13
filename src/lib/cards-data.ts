import { Card, Rarity, RARITY_CONFIG } from "@/types";
import { MEMBERS, GROUPS } from "./groups-data";

// Helper to create cards efficiently
function makeCard(
  id: string,
  memberId: string,
  title: string,
  description: string,
  series: string,
  rarity: Rarity,
  cardNumber: number,
  totalInSeries: number
): Card {
  const member = MEMBERS.find((m) => m.id === memberId)!;
  const group = GROUPS.find((g) => g.id === member.groupId)!;
  return {
    id,
    memberId,
    groupId: member.groupId,
    memberName: member.name,
    groupName: group.name,
    memberColor: member.color,
    memberImage: member.image ? `/members/${member.image}` : undefined,
    title,
    description,
    series,
    rarity,
    cardNumber,
    totalInSeries,
  };
}

// ===== All Cards =====
export const ALL_CARDS: Card[] = [
  // ──── Snow Man LIVE TOUR Series (9 cards) ────
  makeCard("sm-tour-01", "sm-iwamoto", "岩本照 - LIVE TOUR", "圧倒的なダンスで会場を支配するセンターの輝き", "Snow Man LIVE TOUR", "sr", 1, 9),
  makeCard("sm-tour-02", "sm-fukazawa", "深澤辰哉 - LIVE TOUR", "MCで笑いを届ける、グループのムードメーカー", "Snow Man LIVE TOUR", "normal", 2, 9),
  makeCard("sm-tour-03", "sm-raul", "ラウール - LIVE TOUR", "185cmの長身から繰り出されるダイナミックなダンス", "Snow Man LIVE TOUR", "rare", 3, 9),
  makeCard("sm-tour-04", "sm-watanabe", "渡辺翔太 - LIVE TOUR", "美しいハイトーンボイスが会場に響き渡る瞬間", "Snow Man LIVE TOUR", "rare", 4, 9),
  makeCard("sm-tour-05", "sm-mukai", "向井康二 - LIVE TOUR", "関西弁のトークで会場を温めるバラエティの才能", "Snow Man LIVE TOUR", "normal", 5, 9),
  makeCard("sm-tour-06", "sm-abe", "阿部亮平 - LIVE TOUR", "知性と笑顔で魅せるクイズ王のステージ", "Snow Man LIVE TOUR", "normal", 6, 9),
  makeCard("sm-tour-07", "sm-meguro", "目黒蓮 - LIVE TOUR", "色気と存在感で観客を魅了するパフォーマンス", "Snow Man LIVE TOUR", "sr", 7, 9),
  makeCard("sm-tour-08", "sm-miyadate", "宮舘涼太 - LIVE TOUR", "王子様のような華やかさと気品あるダンス", "Snow Man LIVE TOUR", "normal", 8, 9),
  makeCard("sm-tour-09", "sm-sakuma", "佐久間大介 - LIVE TOUR", "全身全霊のアクロバットで魅せるエンターテイナー", "Snow Man LIVE TOUR", "rare", 9, 9),

  // ──── Snow Man ファンサコレクション (9 cards) ────
  makeCard("sm-fans-01", "sm-iwamoto", "岩本照 - ファンサ", "ファンに向けた力強い指差しで心を撃ち抜く", "Snow Man ファンサ", "ur", 1, 9),
  makeCard("sm-fans-02", "sm-fukazawa", "深澤辰哉 - ファンサ", "投げキッスで会場を沸かせる瞬間", "Snow Man ファンサ", "ur", 2, 9),
  makeCard("sm-fans-03", "sm-raul", "ラウール - ファンサ", "客席に向けたウインクで歓声が止まらない", "Snow Man ファンサ", "ur", 3, 9),
  makeCard("sm-fans-04", "sm-watanabe", "渡辺翔太 - ファンサ", "うちわに反応して微笑む至福の瞬間", "Snow Man ファンサ", "ur", 4, 9),
  makeCard("sm-fans-05", "sm-mukai", "向井康二 - ファンサ", "カメラ目線で手を振る笑顔が眩しい", "Snow Man ファンサ", "ur", 5, 9),
  makeCard("sm-fans-06", "sm-abe", "阿部亮平 - ファンサ", "ファンレターを読み上げる感動の一幕", "Snow Man ファンサ", "ur", 6, 9),
  makeCard("sm-fans-07", "sm-meguro", "目黒蓮 - ファンサ", "客席を見つめる眼差しに心が溶ける", "Snow Man ファンサ", "legend", 7, 9),
  makeCard("sm-fans-08", "sm-miyadate", "宮舘涼太 - ファンサ", "エレガントなお手振りで魅了する王子", "Snow Man ファンサ", "ur", 8, 9),
  makeCard("sm-fans-09", "sm-sakuma", "佐久間大介 - ファンサ", "全力の投げキッスとハートマーク", "Snow Man ファンサ", "ur", 9, 9),

  // ──── SixTONES LIVE TOUR Series (6 cards) ────
  makeCard("st-tour-01", "st-jesse", "ジェシー - LIVE TOUR", "圧巻の歌唱力で会場を震わせるメインボーカル", "SixTONES LIVE TOUR", "sr", 1, 6),
  makeCard("st-tour-02", "st-kyomoto", "京本大我 - LIVE TOUR", "ミュージカルで鍛えた美声が響く", "SixTONES LIVE TOUR", "rare", 2, 6),
  makeCard("st-tour-03", "st-matsumura", "松村北斗 - LIVE TOUR", "クールな表情から一転、情熱的なダンス", "SixTONES LIVE TOUR", "sr", 3, 6),
  makeCard("st-tour-04", "st-kouchi", "髙地優吾 - LIVE TOUR", "温かい笑顔でファンを包み込むMC", "SixTONES LIVE TOUR", "normal", 4, 6),
  makeCard("st-tour-05", "st-morimoto", "森本慎太郎 - LIVE TOUR", "ワイルドなダンスでステージを支配する", "SixTONES LIVE TOUR", "rare", 5, 6),
  makeCard("st-tour-06", "st-tanaka", "田中樹 - LIVE TOUR", "キレのあるラップで会場のボルテージを上げる", "SixTONES LIVE TOUR", "normal", 6, 6),

  // ──── SixTONES ファンサコレクション (6 cards) ────
  makeCard("st-fans-01", "st-jesse", "ジェシー - ファンサ", "満面の笑みで手を振る瞬間に胸が高鳴る", "SixTONES ファンサ", "ur", 1, 6),
  makeCard("st-fans-02", "st-kyomoto", "京本大我 - ファンサ", "美しい投げキッスに会場が沸く", "SixTONES ファンサ", "ur", 2, 6),
  makeCard("st-fans-03", "st-matsumura", "松村北斗 - ファンサ", "クールな視線がこちらに向けられた奇跡の瞬間", "SixTONES ファンサ", "legend", 3, 6),
  makeCard("st-fans-04", "st-kouchi", "髙地優吾 - ファンサ", "うちわを見つけて嬉しそうに反応してくれた", "SixTONES ファンサ", "ur", 4, 6),
  makeCard("st-fans-05", "st-morimoto", "森本慎太郎 - ファンサ", "力強いピースサインで応えてくれた瞬間", "SixTONES ファンサ", "ur", 5, 6),
  makeCard("st-fans-06", "st-tanaka", "田中樹 - ファンサ", "指差しからの笑顔、心臓が止まりそうに", "SixTONES ファンサ", "ur", 6, 6),

  // ──── なにわ男子 LIVE TOUR Series (7 cards) ────
  makeCard("nw-tour-01", "nw-nishihata", "西畑大吾 - LIVE TOUR", "歌とダンスの実力でグループを牽引するセンター", "なにわ男子 LIVE TOUR", "sr", 1, 7),
  makeCard("nw-tour-02", "nw-onishi", "大西流星 - LIVE TOUR", "キュートな笑顔と軽快なダンスで魅了", "なにわ男子 LIVE TOUR", "rare", 2, 7),
  makeCard("nw-tour-03", "nw-michieda", "道枝駿佑 - LIVE TOUR", "甘いルックスと確かな演技力を持つ正統派", "なにわ男子 LIVE TOUR", "sr", 3, 7),
  makeCard("nw-tour-04", "nw-fujiwara", "藤原丈一郎 - LIVE TOUR", "野球愛とトーク力で盛り上げるムードメーカー", "なにわ男子 LIVE TOUR", "normal", 4, 7),
  makeCard("nw-tour-05", "nw-ohashi", "大橋和也 - LIVE TOUR", "天然キャラと歌唱力のギャップが魅力", "なにわ男子 LIVE TOUR", "rare", 5, 7),
  makeCard("nw-tour-06", "nw-takahashi", "高橋恭平 - LIVE TOUR", "スタイル抜群のビジュアルエース", "なにわ男子 LIVE TOUR", "normal", 6, 7),
  makeCard("nw-tour-07", "nw-nagao", "長尾謙杜 - LIVE TOUR", "最年少ながら堂々としたパフォーマンス", "なにわ男子 LIVE TOUR", "normal", 7, 7),

  // ──── なにわ男子 ファンサコレクション (7 cards) ────
  makeCard("nw-fans-01", "nw-nishihata", "西畑大吾 - ファンサ", "力強い指差しで「見つけたよ」の合図", "なにわ男子 ファンサ", "ur", 1, 7),
  makeCard("nw-fans-02", "nw-onishi", "大西流星 - ファンサ", "キラキラの笑顔で手を振ってくれた", "なにわ男子 ファンサ", "ur", 2, 7),
  makeCard("nw-fans-03", "nw-michieda", "道枝駿佑 - ファンサ", "甘い微笑みでこちらを見つめた瞬間", "なにわ男子 ファンサ", "legend", 3, 7),
  makeCard("nw-fans-04", "nw-fujiwara", "藤原丈一郎 - ファンサ", "おちゃめなポーズで笑わせてくれた", "なにわ男子 ファンサ", "ur", 4, 7),
  makeCard("nw-fans-05", "nw-ohashi", "大橋和也 - ファンサ", "天然全開の笑顔にこちらまで幸せに", "なにわ男子 ファンサ", "ur", 5, 7),
  makeCard("nw-fans-06", "nw-takahashi", "高橋恭平 - ファンサ", "モデルのようなウインクにドキッ", "なにわ男子 ファンサ", "ur", 6, 7),
  makeCard("nw-fans-07", "nw-nagao", "長尾謙杜 - ファンサ", "可愛いハートを作って見せてくれた", "なにわ男子 ファンサ", "ur", 7, 7),

  // ──── Travis Japan LIVE TOUR Series (7 cards) ────
  makeCard("tj-tour-01", "tj-miyachika", "宮近海斗 - LIVE TOUR", "世界レベルのダンスでリードするキャプテン", "Travis Japan LIVE TOUR", "sr", 1, 7),
  makeCard("tj-tour-02", "tj-nakamura", "中村海人 - LIVE TOUR", "華やかなビジュアルと柔らかいダンス", "Travis Japan LIVE TOUR", "rare", 2, 7),
  makeCard("tj-tour-03", "tj-yoshizawa", "吉澤閑也 - LIVE TOUR", "緻密な振付と安定したパフォーマンス", "Travis Japan LIVE TOUR", "normal", 3, 7),
  makeCard("tj-tour-04", "tj-matsuda", "松田元太 - LIVE TOUR", "エネルギッシュなダンスで盛り上げる", "Travis Japan LIVE TOUR", "normal", 4, 7),
  makeCard("tj-tour-05", "tj-matsukura", "松倉海斗 - LIVE TOUR", "繊細な表現力が光るダンスパフォーマンス", "Travis Japan LIVE TOUR", "rare", 5, 7),
  makeCard("tj-tour-06", "tj-shimekenryuya", "七五三掛龍也 - LIVE TOUR", "個性的なキャラクターで会場を沸かせる", "Travis Japan LIVE TOUR", "normal", 6, 7),
  makeCard("tj-tour-07", "tj-kawashima", "川島如恵留 - LIVE TOUR", "多才な才能を発揮するオールラウンダー", "Travis Japan LIVE TOUR", "rare", 7, 7),

  // ──── Travis Japan ファンサコレクション (7 cards) ────
  makeCard("tj-fans-01", "tj-miyachika", "宮近海斗 - ファンサ", "キレキレダンスの最中にこちらへウインク", "Travis Japan ファンサ", "ur", 1, 7),
  makeCard("tj-fans-02", "tj-nakamura", "中村海人 - ファンサ", "甘い笑顔で手を振る王子様の瞬間", "Travis Japan ファンサ", "ur", 2, 7),
  makeCard("tj-fans-03", "tj-yoshizawa", "吉澤閑也 - ファンサ", "穏やかな微笑みでファンに応える", "Travis Japan ファンサ", "ur", 3, 7),
  makeCard("tj-fans-04", "tj-matsuda", "松田元太 - ファンサ", "全力の投げキッスでハートを掴む", "Travis Japan ファンサ", "ur", 4, 7),
  makeCard("tj-fans-05", "tj-matsukura", "松倉海斗 - ファンサ", "繊細な指差しで「君だよ」のメッセージ", "Travis Japan ファンサ", "legend", 5, 7),
  makeCard("tj-fans-06", "tj-shimekenryuya", "七五三掛龍也 - ファンサ", "おちゃめなポーズで会場を笑顔にする", "Travis Japan ファンサ", "ur", 6, 7),
  makeCard("tj-fans-07", "tj-kawashima", "川島如恵留 - ファンサ", "知的な笑顔でこちらを見つめる瞬間", "Travis Japan ファンサ", "ur", 7, 7),
];

// ===== Helper Functions =====
export function getCardById(cardId: string): Card | undefined {
  return ALL_CARDS.find((c) => c.id === cardId);
}

export function getCardsByGroup(groupId: string): Card[] {
  return ALL_CARDS.filter((c) => c.groupId === groupId);
}

export function getCardsByMember(memberId: string): Card[] {
  return ALL_CARDS.filter((c) => c.memberId === memberId);
}

export function getCardsBySeries(series: string): Card[] {
  return ALL_CARDS.filter((c) => c.series === series);
}

export function getAllSeries(): string[] {
  return [...new Set(ALL_CARDS.map((c) => c.series))];
}

export function getSeriesByGroup(groupId: string): string[] {
  return [...new Set(ALL_CARDS.filter((c) => c.groupId === groupId).map((c) => c.series))];
}

// ===== Gacha Logic =====
export function drawGacha(count: number): Card[] {
  const results: Card[] = [];
  for (let i = 0; i < count; i++) {
    const rarity = rollRarity(i === count - 1 && count >= 10);
    const cardsOfRarity = ALL_CARDS.filter((c) => c.rarity === rarity);
    const card = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
    results.push(card);
  }
  return results;
}

function rollRarity(guaranteedRareOrAbove: boolean): Rarity {
  const roll = Math.random();
  if (roll < 0.01) return "legend";
  if (roll < 0.05) return "ur";
  if (roll < 0.20) return "sr";
  if (roll < 0.50) return "rare";
  if (guaranteedRareOrAbove) return "rare";
  return "normal";
}
