import { Card, CardTheme, ClaimToken, RARITY_PRICE } from "@/types";

export const CARD_THEMES: CardTheme[] = [
  {
    id: "theme-stars",
    name: "STARTO STARS",
    description: "新世代を牽引するSTARTOの精鋭たち",
    coverImageUrl: "/cards/snowman.jpg",
    accentColor: "#ec6d81",
  },
  {
    id: "theme-legends",
    name: "STARTO LEGENDS",
    description: "エンタメの頂点を極めた伝説のグループ",
    coverImageUrl: "/cards/heysayjump.jpg",
    accentColor: "#6481c0",
  },
];

// Demo cards for MVP
export const DEMO_CARDS: Card[] = [
  {
    id: "card-001",
    title: "Snow Man",
    description:
      "圧巻のダンスパフォーマンスとアクロバットで魅せる9人組。ドーム公演を次々と成功させ、新時代のトップアイドルとして君臨する。",
    imageUrl: "/cards/snowman.jpg",
    rarity: "legendary",
    series: "STARTO STARS",
    themeId: "theme-stars",
    cardNumber: 1,
    totalInSeries: 4,
    price: RARITY_PRICE.legendary,
  },
  {
    id: "card-002",
    title: "SixTONES",
    description:
      "6つの音色が重なり合うハーモニー。独自の音楽性とパフォーマンスで、国内外に熱狂的なファンを持つ実力派グループ。",
    imageUrl: "/cards/sixtones.jpg",
    rarity: "epic",
    series: "STARTO STARS",
    themeId: "theme-stars",
    cardNumber: 2,
    totalInSeries: 4,
    price: RARITY_PRICE.epic,
  },
  {
    id: "card-003",
    title: "King & Prince",
    description:
      "キラキラとした王道アイドルの輝き。ポップでキャッチーな楽曲と華やかなステージで多くのファンを魅了し続ける。",
    imageUrl: "/cards/kingandprince.jpg",
    rarity: "rare",
    series: "STARTO STARS",
    themeId: "theme-stars",
    cardNumber: 3,
    totalInSeries: 4,
    price: RARITY_PRICE.rare,
  },
  {
    id: "card-004",
    title: "なにわ男子",
    description:
      "関西発の明るさと元気で日本中を笑顔にする7人組。バラエティからドラマまで幅広く活躍するマルチな才能の持ち主たち。",
    imageUrl: "/cards/naniwa.jpg",
    rarity: "common",
    series: "STARTO STARS",
    themeId: "theme-stars",
    cardNumber: 4,
    totalInSeries: 4,
    price: RARITY_PRICE.common,
  },
  {
    id: "card-005",
    title: "Travis Japan",
    description:
      "世界基準のダンススキルを持つグローバルグループ。海外での活動経験を活かし、ワールドワイドに活躍の場を広げている。",
    imageUrl: "/cards/travisjapan.jpg",
    rarity: "rare",
    series: "STARTO LEGENDS",
    themeId: "theme-legends",
    cardNumber: 1,
    totalInSeries: 4,
    price: RARITY_PRICE.rare,
  },
  {
    id: "card-006",
    title: "Hey! Say! JUMP",
    description:
      "デビューから長年にわたりトップを走り続ける実力派。圧倒的なライブパフォーマンスと楽曲の質で、世代を超えて愛される。",
    imageUrl: "/cards/heysayjump.jpg",
    rarity: "epic",
    series: "STARTO LEGENDS",
    themeId: "theme-legends",
    cardNumber: 2,
    totalInSeries: 4,
    price: RARITY_PRICE.epic,
  },
  {
    id: "card-007",
    title: "SUPER EIGHT",
    description:
      "関西の笑いとエンターテインメントを極めたグループ。バラエティ、音楽、演技すべてにおいて唯一無二の存在感を放つ。",
    imageUrl: "/cards/supereight.jpg",
    rarity: "common",
    series: "STARTO LEGENDS",
    themeId: "theme-legends",
    cardNumber: 3,
    totalInSeries: 4,
    price: RARITY_PRICE.common,
  },
  {
    id: "card-008",
    title: "Kis-My-Ft2",
    description:
      "ローラースケートを使った華麗なパフォーマンスが代名詞。長年のキャリアで培った圧倒的なエンタメ力で観客を魅了する。",
    imageUrl: "/cards/kismyft2.jpg",
    rarity: "legendary",
    series: "STARTO LEGENDS",
    themeId: "theme-legends",
    cardNumber: 4,
    totalInSeries: 4,
    price: RARITY_PRICE.legendary,
  },
];

// Demo claim tokens
export const DEMO_TOKENS: ClaimToken[] = [
  {
    token: "SNOWMAN-2024",
    cardId: "card-001",
    used: false,
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    token: "SIXTONES-2024",
    cardId: "card-002",
    used: false,
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    token: "KINGPRINCE-2024",
    cardId: "card-003",
    used: false,
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    token: "NANIWA-2024",
    cardId: "card-004",
    used: false,
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    token: "TRAVIS-2024",
    cardId: "card-005",
    used: false,
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    token: "HEYSAY-2024",
    cardId: "card-006",
    used: false,
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    token: "SUPEREIGHT-2024",
    cardId: "card-007",
    used: false,
    expiresAt: "2026-12-31T23:59:59Z",
  },
  {
    token: "KISMYFT2-2024",
    cardId: "card-008",
    used: false,
    expiresAt: "2026-12-31T23:59:59Z",
  },
];

export function findCardByToken(token: string): Card | undefined {
  const claimToken = DEMO_TOKENS.find(
    (t) => t.token.toUpperCase() === token.toUpperCase()
  );
  if (!claimToken) return undefined;
  return DEMO_CARDS.find((c) => c.id === claimToken.cardId);
}

export function validateToken(
  token: string
): { valid: true; card: Card } | { valid: false; reason: string } {
  const claimToken = DEMO_TOKENS.find(
    (t) => t.token.toUpperCase() === token.toUpperCase()
  );

  if (!claimToken) {
    return { valid: false, reason: "コードが見つかりませんでした。正しいコード（例: SNOWMAN-2024）をご確認ください" };
  }

  if (new Date(claimToken.expiresAt) < new Date()) {
    return { valid: false, reason: "このコードは有効期限が切れています。新しいコードをお持ちの場合は、そちらをお試しください" };
  }

  const card = DEMO_CARDS.find((c) => c.id === claimToken.cardId);
  if (!card) {
    return { valid: false, reason: "カード情報の読み込みに失敗しました。しばらく時間をおいて再度お試しください" };
  }

  return { valid: true, card };
}

export function getCardsByTheme(themeId: string): Card[] {
  return DEMO_CARDS.filter((c) => c.themeId === themeId);
}

export function getThemeById(themeId: string): CardTheme | undefined {
  return CARD_THEMES.find((t) => t.id === themeId);
}

export function getAllThemes(): CardTheme[] {
  return CARD_THEMES;
}
