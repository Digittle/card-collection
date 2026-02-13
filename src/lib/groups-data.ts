import { Group, Member } from "@/types";

export const GROUPS: Group[] = [
  {
    id: "snowman",
    name: "Snow Man",
    nameEn: "Snow Man",
    debutYear: 2020,
    description: "圧巻のダンスパフォーマンスとアクロバットで魅せる9人組",
    accentColor: "#60A5FA",
  },
  {
    id: "sixtones",
    name: "SixTONES",
    nameEn: "SixTONES",
    debutYear: 2020,
    description: "6つの音色が重なり合う、唯一無二の音楽性を持つ実力派",
    accentColor: "#EF4444",
  },
  {
    id: "naniwa",
    name: "なにわ男子",
    nameEn: "Naniwa Danshi",
    debutYear: 2021,
    description: "関西発の明るさと元気で日本中を笑顔にする",
    accentColor: "#F59E0B",
  },
  {
    id: "travisjapan",
    name: "Travis Japan",
    nameEn: "Travis Japan",
    debutYear: 2022,
    description: "世界基準のダンススキルを武器にグローバルに活躍",
    accentColor: "#22C55E",
  },
];

export const MEMBERS: Member[] = [
  // Snow Man
  { id: "sm-iwamoto", groupId: "snowman", name: "岩本照", nameEn: "Hikaru Iwamoto", color: "#EAB308", colorName: "黄色", image: "sm-iwamoto.jpg" },
  { id: "sm-fukazawa", groupId: "snowman", name: "深澤辰哉", nameEn: "Tatsuya Fukazawa", color: "#8B5CF6", colorName: "紫", image: "sm-fukazawa.jpg" },
  { id: "sm-raul", groupId: "snowman", name: "ラウール", nameEn: "Raul", color: "#E2E8F0", colorName: "白", image: "sm-raul.jpg" },
  { id: "sm-watanabe", groupId: "snowman", name: "渡辺翔太", nameEn: "Shota Watanabe", color: "#3B82F6", colorName: "青", image: "sm-watanabe.jpg" },
  { id: "sm-mukai", groupId: "snowman", name: "向井康二", nameEn: "Koji Mukai", color: "#F97316", colorName: "オレンジ", image: "sm-mukai.jpg" },
  { id: "sm-abe", groupId: "snowman", name: "阿部亮平", nameEn: "Ryohei Abe", color: "#22C55E", colorName: "緑", image: "sm-abe.jpg" },
  { id: "sm-meguro", groupId: "snowman", name: "目黒蓮", nameEn: "Ren Meguro", color: "#374151", colorName: "黒", image: "sm-meguro.jpg" },
  { id: "sm-miyadate", groupId: "snowman", name: "宮舘涼太", nameEn: "Ryota Miyadate", color: "#EF4444", colorName: "赤", image: "sm-miyadate.jpg" },
  { id: "sm-sakuma", groupId: "snowman", name: "佐久間大介", nameEn: "Daisuke Sakuma", color: "#EC4899", colorName: "ピンク", image: "sm-sakuma.jpg" },

  // SixTONES
  { id: "st-jesse", groupId: "sixtones", name: "ジェシー", nameEn: "Jesse", color: "#EF4444", colorName: "赤", image: "st-jesse.jpg" },
  { id: "st-kyomoto", groupId: "sixtones", name: "京本大我", nameEn: "Taiga Kyomoto", color: "#F472B6", colorName: "ピンク", image: "st-kyomoto.jpg" },
  { id: "st-matsumura", groupId: "sixtones", name: "松村北斗", nameEn: "Hokuto Matsumura", color: "#374151", colorName: "黒", image: "st-matsumura.jpg" },
  { id: "st-kouchi", groupId: "sixtones", name: "髙地優吾", nameEn: "Yugo Kouchi", color: "#EAB308", colorName: "黄色", image: "st-kouchi.jpg" },
  { id: "st-morimoto", groupId: "sixtones", name: "森本慎太郎", nameEn: "Shintaro Morimoto", color: "#22C55E", colorName: "緑", image: "st-morimoto.jpg" },
  { id: "st-tanaka", groupId: "sixtones", name: "田中樹", nameEn: "Juri Tanaka", color: "#3B82F6", colorName: "青", image: "st-tanaka.jpg" },

  // なにわ男子
  { id: "nw-nishihata", groupId: "naniwa", name: "西畑大吾", nameEn: "Daigo Nishihata", color: "#EF4444", colorName: "赤", image: "nw-nishihata.jpg" },
  { id: "nw-onishi", groupId: "naniwa", name: "大西流星", nameEn: "Ryusei Onishi", color: "#F97316", colorName: "オレンジ", image: "nw-onishi.jpg" },
  { id: "nw-michieda", groupId: "naniwa", name: "道枝駿佑", nameEn: "Shunsuke Michieda", color: "#F472B6", colorName: "ピンク", image: "nw-michieda.jpg" },
  { id: "nw-fujiwara", groupId: "naniwa", name: "藤原丈一郎", nameEn: "Joichiro Fujiwara", color: "#3B82F6", colorName: "青", image: "nw-fujiwara.jpg" },
  { id: "nw-ohashi", groupId: "naniwa", name: "大橋和也", nameEn: "Kazuya Ohashi", color: "#EAB308", colorName: "黄色", image: "nw-ohashi.jpg" },
  { id: "nw-takahashi", groupId: "naniwa", name: "高橋恭平", nameEn: "Kyohei Takahashi", color: "#8B5CF6", colorName: "紫", image: "nw-takahashi.jpg" },
  { id: "nw-nagao", groupId: "naniwa", name: "長尾謙杜", nameEn: "Kento Nagao", color: "#22C55E", colorName: "緑", image: "nw-nagao.jpg" },

  // Travis Japan
  { id: "tj-miyachika", groupId: "travisjapan", name: "宮近海斗", nameEn: "Kaito Miyachika", color: "#EF4444", colorName: "赤", image: "tj-miyachika.jpg" },
  { id: "tj-nakamura", groupId: "travisjapan", name: "中村海人", nameEn: "Kaito Nakamura", color: "#F472B6", colorName: "ピンク", image: "tj-nakamura.jpg" },
  { id: "tj-yoshizawa", groupId: "travisjapan", name: "吉澤閑也", nameEn: "Shizuya Yoshizawa", color: "#22C55E", colorName: "緑", image: "tj-yoshizawa.jpg" },
  { id: "tj-matsuda", groupId: "travisjapan", name: "松田元太", nameEn: "Genta Matsuda", color: "#3B82F6", colorName: "青", image: "tj-matsuda.jpg" },
  { id: "tj-matsukura", groupId: "travisjapan", name: "松倉海斗", nameEn: "Kaito Matsukura", color: "#8B5CF6", colorName: "紫", image: "tj-matsukura.jpg" },
  { id: "tj-shimekenryuya", groupId: "travisjapan", name: "七五三掛龍也", nameEn: "Ryuya Shimekake", color: "#EAB308", colorName: "黄色", image: "tj-shimekenryuya.jpg" },
  { id: "tj-kawashima", groupId: "travisjapan", name: "川島如恵留", nameEn: "Noeru Kawashima", color: "#F97316", colorName: "オレンジ", image: "tj-kawashima.jpg" },
];

export function getGroupById(id: string): Group | undefined {
  return GROUPS.find((g) => g.id === id);
}

export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getMembersByGroup(groupId: string): Member[] {
  return MEMBERS.filter((m) => m.groupId === groupId);
}

export function getGroupByMemberId(memberId: string): Group | undefined {
  const member = getMemberById(memberId);
  if (!member) return undefined;
  return getGroupById(member.groupId);
}
