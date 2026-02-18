# Digital Card Collection - 仕様書

## 概要

デジタルカードを収集し、カードに紐づく「パワー」をリソースとしてプログラムに消費することで、バッジを獲得していくゲーミフィケーション・プラットフォーム。

- **URL**: https://cardtest-iota.vercel.app
- **GitHub**: https://github.com/Digittle/card-collection
- **技術スタック**: Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React
- **データ永続化**: localStorage (クライアントサイドのみ)
- **認証**: Vercel 環境変数による Basic 認証

---

## 1. ユーザーフロー

```
ランディング (/) → ログイン (/login) → オンボーディング (/onboarding)
  → ギフト (/gift) → コレクション (/collection)
  → ショップ (/shop) / プログラム (/programs) / 設定 (/settings)
```

### 1.1 ランディングページ (/)
- ログイン済みの場合は `/collection` に自動リダイレクト
- 「はじめる」ボタンで `/login` に遷移
- アンビエントグロー背景 + フローティングカードイラスト

### 1.2 ログイン (/login)
- 名前入力 or ゲストログイン
- ユーザー作成時に初期コイン (500枚) を付与
- `hasReceivedFreeCard: false` で作成
- オンボーディング未完了 → `/onboarding`、完了済み → `/collection`

### 1.3 オンボーディング (/onboarding)
- 3ステップのチュートリアルモーダル
  1. 「カードを受け取ろう」(Gift アイコン)
  2. 「開封の瞬間を楽しもう」(Sparkles アイコン)
  3. 「コレクションしよう」(LayoutGrid アイコン)
- スキップ可能
- 完了後: 無料カード未受取 → `/gift`、受取済み → `/collection`

### 1.4 ギフト (/gift) — 初回限定
- 全カードから1枚を無料で選択
- テーマ別にカードをグリッド表示
- 選択 → 確認モーダル → CardFlip 開封演出 → コレクションへ
- ガード: `hasReceivedFreeCard()` が true なら `/collection` にリダイレクト

### 1.5 コレクション (/collection)
- テーマ別にカードをグリッド表示
- 全体進捗バー (X/8枚)
- 図鑑モード (未所持カードをシルエット表示)
- バッジサマリーバー (獲得バッジ数表示)
- カードタップで詳細ページ (`/card/[id]`) に遷移

### 1.6 ショップ (/shop)
- 2階層: テーマ一覧 → テーマ内カード一覧
- カード購入フロー: 選択 → 確認モーダル (価格・残高表示) → CardFlip 開封 → 完了
- コイン不足時はエラー表示
- 購入後に `evaluateBadges()` を呼び出し

### 1.7 カード詳細 (/card/[id])
- カード画像 (ホログラフィックオーバーレイ + レアリティグロー)
- メタ情報: シリーズ、カード番号、取得日
- **パワーセクション**: RightsDots による消費状況表示、消費先プログラム一覧
- 「プログラムにパワーを使う」ボタン → `/programs` に遷移
- Web Share API によるシェア機能

### 1.8 プログラム一覧 (/programs)
- バッジサマリーバー (全バッジアイコン横スクロール)
- ProgramCard のリスト (進捗バー、報酬表示、完了状態)
- タップでプログラム詳細へ

### 1.9 プログラム詳細 (/programs/[id])
- プログラム情報 (アイコン、タイトル、説明、全体進捗バー)
- 要件リスト: 各要件の充足状況、「パワーを使う」ボタン
- パワー消費フロー:
  1. 対象カードの選択 (残りパワー数表示)
  2. ConfirmationModal (warning variant) で確認
  3. `executeAllocation()` 実行
  4. 成功トースト表示
  5. `evaluateBadges()` 呼び出し
- プログラム完了時: 全画面セレブレーション演出
- 報酬セクション: バッジ + コイン報酬の受取ボタン

### 1.10 コード引換 (/claim)
- コード入力 → バリデーション → CardFlip 開封 → コレクション追加
- 引換後に `evaluateBadges()` を呼び出し

### 1.11 設定 (/settings)
- ユーザープロフィール (名前、カード枚数)
- バッジコレクション (獲得/未獲得の全バッジ表示)
- ログアウト (確認ダイアログ)
- データ削除 (確認ダイアログ、プログラム進捗・バッジも含む旨を警告)

---

## 2. ナビゲーション

### ボトムナビ (4タブ)

| タブ | パス | アイコン |
|------|------|---------|
| コレクション | `/collection` | LayoutGrid |
| プログラム | `/programs` | Target |
| ショップ | `/shop` | ShoppingBag |
| 設定 | `/settings` | Settings |

### ヘッダー
- ページタイトル
- 戻るボタン (オプション)
- コイン表示 (オプション)
- 右アクション (オプション)

---

## 3. カードシステム

### 3.1 カードテーマ

| テーマID | テーマ名 | 説明 | カバー画像 | アクセントカラー |
|---------|---------|------|-----------|----------------|
| theme-stars | STARTO STARS | 新世代を牽引するSTARTOの精鋭たち | snowman.jpg | #ec6d81 |
| theme-legends | STARTO LEGENDS | エンタメの頂点を極めた伝説のグループ | heysayjump.jpg | #6481c0 |

### 3.2 カード一覧

| ID | タイトル | テーマ | レアリティ | 価格 | パワー数 |
|----|---------|--------|-----------|------|--------|
| card-001 | Snow Man | STARTO STARS | Legendary | 1200 | 5 |
| card-002 | SixTONES | STARTO STARS | Epic | 600 | 3 |
| card-003 | King & Prince | STARTO STARS | Rare | 300 | 2 |
| card-004 | なにわ男子 | STARTO STARS | Common | 100 | 1 |
| card-005 | Travis Japan | STARTO LEGENDS | Rare | 300 | 2 |
| card-006 | Hey! Say! JUMP | STARTO LEGENDS | Epic | 600 | 3 |
| card-007 | SUPER EIGHT | STARTO LEGENDS | Common | 100 | 1 |
| card-008 | Kis-My-Ft2 | STARTO LEGENDS | Legendary | 1200 | 5 |

### 3.3 レアリティ設定

| レアリティ | ラベル | 価格 | パワー数 | グローカラー | パーティクル数 | バイブレーション |
|-----------|--------|------|--------|-------------|--------------|----------------|
| Common | Common | 100 | 1 | rgba(191,191,191,0.6) | 0 | なし |
| Rare | Rare | 300 | 2 | rgba(100,129,192,0.6) | 0 | なし |
| Epic | Epic | 600 | 3 | rgba(176,139,190,0.7) | 6 | なし |
| Legendary | Legendary | 1200 | 5 | rgba(246,171,0,0.8) | 10 | あり |

### 3.4 引換コード

| コード | 対象カード | 有効期限 |
|--------|-----------|---------|
| SNOWMAN-2024 | Snow Man | 2026-12-31 |
| SIXTONES-2024 | SixTONES | 2026-12-31 |
| KINGPRINCE-2024 | King & Prince | 2026-12-31 |
| NANIWA-2024 | なにわ男子 | 2026-12-31 |
| TRAVIS-2024 | Travis Japan | 2026-12-31 |
| HEYSAY-2024 | Hey! Say! JUMP | 2026-12-31 |
| SUPEREIGHT-2024 | SUPER EIGHT | 2026-12-31 |
| KISMYFT2-2024 | Kis-My-Ft2 | 2026-12-31 |

---

## 4. コイン経済

| 項目 | 値 |
|------|-----|
| 初期付与 | 500コイン |
| Common カード購入 | -100 |
| Rare カード購入 | -300 |
| Epic カード購入 | -600 |
| Legendary カード購入 | -1200 |
| プログラム報酬 (program-001) | +300 |
| プログラム報酬 (program-002) | +500 |
| プログラム報酬 (program-003) | +200 |

---

## 5. パワー (Power) システム

### 5.1 概要
- 各カードはレアリティに応じた数の「パワーポイント」を保持する
- パワーはプログラムの要件を満たすために消費できる
- **消費は不可逆** (一度消費したパワーは取り消せない)
- 1つのパワーは1つのプログラムにのみ消費可能 (排他性)

### 5.2 パワー数

| レアリティ | パワーポイント数 |
|-----------|--------------|
| Common | 1 |
| Rare | 2 |
| Epic | 3 |
| Legendary | 5 |

### 5.3 消費フロー
1. カード詳細画面またはプログラム詳細画面から開始
2. 対象カードを選択 (フィルタ条件に合致するもののみ表示)
3. 確認モーダル表示:
   - 「この操作は取り消せません」警告
   - 消費前後のパワー残量 (例: 残りパワー: 3 → 2)
4. 消費実行: グローバル台帳に記録 → プログラム進捗更新
5. バッジ判定の自動実行

### 5.4 二重消費防止
- 各パワーは `cardId + rightIndex` の複合キーで一意に識別
- グローバル消費台帳 (`dcc_right_allocations`) で全消費履歴を管理
- 消費前に必ず台帳を検索し、既存の消費がないことを検証

### 5.5 バリデーション項目
1. カード所有権の確認
2. パワーインデックスの範囲チェック (0 〜 RARITY_RIGHTS[rarity]-1)
3. 二重消費の防止 (グローバル台帳チェック)
4. プログラムの存在・有効性確認
5. 要件フィルタの一致確認 (テーマ/レアリティ/カードID)
6. 要件の容量チェック (既に充足されていないか)

---

## 6. プログラムシステム

### 6.1 プログラム一覧

#### STARTO STARS コンプリートミッション (program-001)
- **カテゴリ**: collection
- **アクセントカラー**: #ec6d81
- **説明**: STARTO STARSシリーズの全カードからパワーを1つずつ使って、コレクションを完成させよう！
- **要件**:
  | 要件ID | ラベル | 必要ポイント | フィルタ |
  |--------|--------|-------------|---------|
  | req-001-1 | Snow Man のパワー | 1 | card-001 のみ |
  | req-001-2 | SixTONES のパワー | 1 | card-002 のみ |
  | req-001-3 | King & Prince のパワー | 1 | card-003 のみ |
  | req-001-4 | なにわ男子 のパワー | 1 | card-004 のみ |
- **報酬**: badge-004 (STARS マスター) + 300コイン

#### レジェンダリーチャレンジ (program-002)
- **カテゴリ**: challenge
- **アクセントカラー**: #F6AB00
- **説明**: レジェンダリーレアリティのカードから合計3ポイント分のパワーを使って、伝説の証を手に入れよう！
- **要件**:
  | 要件ID | ラベル | 必要ポイント | フィルタ |
  |--------|--------|-------------|---------|
  | req-002-1 | レジェンダリーカードのパワー ×3 | 3 | Legendary レアリティのみ |
- **報酬**: badge-005 (レジェンドの証) + 500コイン

#### クロスシリーズ・エクスチェンジ (program-003)
- **カテゴリ**: challenge
- **アクセントカラー**: #8B5CF6
- **説明**: 異なるシリーズのカードからパワーを使って、クロスシリーズの絆を証明しよう！
- **要件**:
  | 要件ID | ラベル | 必要ポイント | フィルタ |
  |--------|--------|-------------|---------|
  | req-003-1 | STARTO STARS のパワー | 1 | theme-stars のみ |
  | req-003-2 | STARTO LEGENDS のパワー | 1 | theme-legends のみ |
- **報酬**: badge-006 (クロスシリーズ) + 200コイン

---

## 7. バッジシステム

### 7.1 バッジ一覧

| ID | タイトル | ティア | トリガー | 条件 |
|----|---------|--------|---------|------|
| badge-001 | はじめの一歩 | Bronze | card_count | カード1枚以上所持 |
| badge-002 | コレクター | Silver | card_count | カード4枚以上所持 |
| badge-003 | コンプリートマスター | Platinum | card_count | カード8枚 (全枚) 所持 |
| badge-004 | STARS マスター | Gold | program_complete | program-001 達成 |
| badge-005 | レジェンドの証 | Gold | program_complete | program-002 達成 |
| badge-006 | クロスシリーズ | Silver | program_complete | program-003 達成 |
| badge-007 | パワーの使い手 | Bronze | rights_consumed | パワーを合計5回以上消費 |

### 7.2 トリガータイプ

| タイプ | 説明 |
|--------|------|
| card_count | 所持カード枚数が閾値以上 |
| theme_complete | 特定テーマの全カードを所持 |
| rarity_collect | 特定レアリティのカードをN枚所持 |
| program_complete | 特定プログラムを達成 |
| first_purchase | 最初のカードを購入 |
| all_programs | 全プログラムを達成 |
| rights_consumed | パワー消費回数が閾値以上 |
| manual | 手動付与 |

### 7.3 バッジ獲得演出
- 全画面オーバーレイ (z-100, black/50 backdrop + blur)
- Spring スケールアニメーション (0 → 1.2 → 1)
- ティア別グラデーション背景 + グローエフェクト
- Gold/Platinum ティアはパーティクルエフェクト付き
- バッジキューによる連続表示対応

### 7.4 バッジ判定タイミング
- カード購入時 (ショップ)
- 無料カード取得時 (ギフト)
- コード引換時 (クレーム)
- パワー消費時 (プログラム)

---

## 8. データ永続化 (localStorage)

### 8.1 ストレージキー

| キー | 型 | 説明 |
|------|-----|------|
| dcc_user | UserProfile | ユーザープロフィール |
| dcc_cards | Card[] | 所持カード一覧 |
| dcc_coins | number | コイン残高 |
| dcc_onboarding_done | boolean | オンボーディング完了フラグ |
| dcc_free_card_received | boolean | 無料カード受取フラグ |
| dcc_claim_history | string[] | 使用済みコード一覧 |
| dcc_right_allocations | RightAllocation[] | パワー消費台帳 (グローバル) |
| dcc_program_progress | UserProgramProgress[] | プログラム進捗一覧 |
| dcc_badges | UserBadge[] | 獲得バッジ一覧 |
| dcc_badge_queue | string[] | バッジ演出待ちキュー |

### 8.2 データ整合性
- localStorage は同期操作のため、単一キーへの書き込みは原子的
- 複数キーの更新は台帳 → 進捗の順序で書き込み
- パワー消費の二重防止はグローバル台帳による単一ソースで保証

---

## 9. ビジュアルデザイン

### 9.1 カラーパレット (famikura テーマ)

| 名前 | 代表色 | 用途 |
|------|--------|------|
| Primary (Pink) | #ec6d81 | メインアクション、ナビゲーターインジケーター |
| Gold (Orange) | #f6ab00 | コイン、Legendary グロー |
| Matcha (Green) | #90c31f | 完了状態、プログレスバー完了 |
| Rose (Purple) | #b08bbe | Epic グロー |

### 9.2 テーマ
- ライトモード: 背景 #F4F5F6、カード白背景、gray-200 ボーダー
- Glass morphism: ヘッダー/ボトムナビに半透明白背景 + backdrop-blur

### 9.3 カードエフェクト
- ホログラフィックシマーオーバーレイ (ホバー/タップ時)
- レアリティ別グローエフェクト (CSS box-shadow)
- Legendary カードのパルスアニメーション
- CardFlip: 3D 回転開封演出 (0.5-0.8秒)
- パーティクルエフェクト (Epic: 6個、Legendary: 10個)

---

## 10. 技術仕様

### 10.1 ファイル構成

```
src/
├── app/
│   ├── page.tsx              # ランディング
│   ├── login/page.tsx        # ログイン
│   ├── onboarding/page.tsx   # オンボーディング
│   ├── gift/page.tsx         # 無料カードギフト
│   ├── collection/page.tsx   # コレクション
│   ├── shop/page.tsx         # ショップ
│   ├── card/[id]/page.tsx    # カード詳細
│   ├── programs/
│   │   ├── page.tsx          # プログラム一覧
│   │   └── [id]/page.tsx     # プログラム詳細
│   ├── claim/page.tsx        # コード引換
│   ├── settings/page.tsx     # 設定
│   ├── layout.tsx            # ルートレイアウト
│   └── globals.css           # グローバルスタイル
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # メインラッパー + BadgeCelebration
│   │   ├── BottomNav.tsx     # 4タブナビゲーション
│   │   └── Header.tsx        # ヘッダー
│   ├── card/
│   │   ├── CardFlip.tsx      # 開封アニメーション
│   │   ├── CardThumbnail.tsx # カードサムネイル
│   │   ├── CardGrid.tsx      # カードグリッド + 図鑑モード
│   │   └── ParticleEffect.tsx # パーティクル演出
│   ├── ui/
│   │   ├── ProgressBar.tsx       # 進捗バー
│   │   ├── ConfirmationModal.tsx # 確認モーダル
│   │   ├── RightsDots.tsx        # パワー消費ドット
│   │   ├── BadgeCelebration.tsx  # バッジ獲得全画面演出
│   │   ├── BadgeIcon.tsx         # バッジアイコン
│   │   └── ProgramCard.tsx       # プログラムカード
│   ├── onboarding/
│   │   └── OnboardingModal.tsx   # オンボーディングモーダル
│   └── PWARegister.tsx           # PWA サービスワーカー登録
├── lib/
│   ├── store.ts              # localStorage ラッパー
│   ├── cards-data.ts         # カード・テーマ定義
│   ├── programs-data.ts      # プログラム定義
│   ├── badges-data.ts        # バッジ定義
│   ├── rights-engine.ts      # パワー消費ロジック
│   ├── badge-engine.ts       # バッジ判定エンジン
│   └── utils.ts              # ユーティリティ (UUID生成)
├── types/
│   └── index.ts              # 全型定義・定数
├── hooks/
│   └── useReducedMotion.ts   # アクセシビリティフック
└── middleware.ts              # Basic 認証ミドルウェア
```

### 10.2 依存パッケージ
- next: 16.1.6
- react / react-dom: 19.x
- framer-motion: アニメーション
- lucide-react: アイコン
- tailwindcss: 4.x (CSS フレームワーク)

### 10.3 PWA
- manifest.json によるホーム画面追加対応
- Service Worker (sw.js) による基本的なオフラインサポート
- アイコン: 192px / 512px

### 10.4 Basic 認証
- Next.js middleware による実装
- 環境変数 `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` で管理
- 静的アセット (`_next/static`, `sw.js`, `manifest.json` 等) は認証除外
