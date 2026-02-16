# STARTO Card Collection - アプリケーション仕様書

> **バージョン**: v1.0.0
> **最終更新日**: 2026-02-13
> **デプロイ先**: https://cardtest-iota.vercel.app

---

## 目次

1. [アプリケーション概要](#1-アプリケーション概要)
2. [技術スタック](#2-技術スタック)
3. [データモデル](#3-データモデル)
4. [画面一覧・ルーティング](#4-画面一覧ルーティング)
5. [画面遷移フロー](#5-画面遷移フロー)
6. [各画面の詳細仕様](#6-各画面の詳細仕様)
7. [UIコンポーネント設計](#7-uiコンポーネント設計)
8. [ガチャシステム](#8-ガチャシステム)
9. [コインエコノミー](#9-コインエコノミー)
10. [カードショップ](#10-カードショップ)
11. [カード履歴・メモ機能](#11-カード履歴メモ機能)
12. [状態管理・データ永続化](#12-状態管理データ永続化)
13. [PWA対応](#13-pwa対応)
14. [認証・セキュリティ](#14-認証セキュリティ)
15. [デザインシステム](#15-デザインシステム)
16. [アセット管理](#16-アセット管理)
17. [既知の制約・注意事項](#17-既知の制約注意事項)

---

## 1. アプリケーション概要

### コンセプト

**STARTO Card Collection** は、STARTO ENTERTAINMENT 所属アイドルグループのデジタルカードを収集するモバイル向け Web アプリケーションである。ガチャ（ランダム抽選）とショップ（個別購入）の2つの手段でカードを入手し、自分だけのコレクションを構築する。

### 世界観 -「聖別された距離」

カードのレアリティは「アイドルとの距離」をコンセプトとして設計されている。レアリティが高いほど、アイドルとの心理的・物理的距離が近いカードとなる。

| レアリティ | 距離ラベル | 意味 |
|-----------|-----------|------|
| Normal | 遠景 | 遠くから見ている |
| Rare | パフォーマンス | ステージ上の姿 |
| SR | ソロショット | 個人にフォーカス |
| UR | ファンサ | ファンサービスの瞬間 |
| Legend | 伝説の瞬間 | 二度とない特別な瞬間 |

### 対象グループ（4グループ・29名）

| グループ | メンバー数 | デビュー年 | アクセントカラー |
|---------|-----------|-----------|----------------|
| Snow Man | 9人 | 2020 | #60A5FA（水色） |
| SixTONES | 6人 | 2020 | #EF4444（赤） |
| なにわ男子 | 7人 | 2021 | #F59E0B（黄色） |
| Travis Japan | 7人 | 2022 | #22C55E（緑） |

---

## 2. 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 16.1.6 |
| 言語 | TypeScript | ^5 |
| UI ライブラリ | React | 19.2.3 |
| スタイリング | Tailwind CSS | v4 |
| アニメーション | Framer Motion | ^12.33.0 |
| アイコン | Lucide React | ^0.563.0 |
| データ永続化 | localStorage | ブラウザ標準 |
| デプロイ | Vercel | - |
| PWA | Service Worker（手動管理） | - |

### アーキテクチャ特性

- **完全クライアントサイド**: サーバーサイド DB / API は存在しない
- **SSR 安全設計**: 全ストア関数で `typeof window === "undefined"` チェックを実装
- **全ページが `"use client"`**: Next.js App Router のクライアントコンポーネントとして実装
- **外部状態管理ライブラリ不使用**: localStorage への直接読み書き関数群で管理

---

## 3. データモデル

### 3.1 型定義一覧

#### Rarity（レアリティ）

```typescript
type Rarity = "normal" | "rare" | "sr" | "ur" | "legend"
```

#### RarityConfig（レアリティ設定）

| フィールド | 型 | 説明 |
|-----------|------|------|
| label | string | 日本語表示名（ノーマル, レア, Sレア, Uレア, レジェンド） |
| labelEn | string | 英語略称（N, R, SR, UR, LG） |
| stars | number | 星の数（1〜5） |
| color | string | メインカラーコード |
| glowColor | string | グロー（発光）エフェクト用カラー |
| probability | number | ガチャ排出確率 |
| distanceLabel | string | 距離コンセプトのラベル |
| shopPrice | number | ショップ購入価格 |

#### User（ユーザー）

| フィールド | 型 | 説明 |
|-----------|------|------|
| id | string | ユーザーID |
| displayName | string | 表示名（最大20文字） |
| tanmouMemberId | string \| null | 担当（推し）メンバーID |
| tanmouGroupId | string \| null | 担当グループID |
| createdAt | string | 作成日時 |

#### Group（グループ）

| フィールド | 型 | 説明 |
|-----------|------|------|
| id | string | 一意識別子（例: "snowman"） |
| name | string | 日本語名 |
| nameEn | string | 英語名 |
| debutYear | number | デビュー年 |
| description | string | グループ説明 |
| accentColor | string | UIアクセントカラー |

#### Member（メンバー）

| フィールド | 型 | 説明 |
|-----------|------|------|
| id | string | 一意識別子（例: "sm-iwamoto"） |
| groupId | string | 所属グループID |
| name / nameEn | string | 日本語名 / 英語名 |
| color / colorName | string | メンバーカラー（16進数 / 日本語名） |
| image? | string | メンバー画像ファイル名 |

#### Card（カード）

| フィールド | 型 | 説明 |
|-----------|------|------|
| id | string | 一意識別子（例: "sm-tour-01"） |
| memberId / groupId | string | メンバー・グループへの参照 |
| memberName / groupName | string | 表示用の名前（非正規化） |
| memberColor | string | メンバーカラー |
| memberImage? | string | メンバー画像パス |
| title | string | カードタイトル |
| description | string | カード説明文 |
| series | string | シリーズ名 |
| rarity | Rarity | レアリティ |
| cardNumber / totalInSeries | number | シリーズ内番号 / 総数 |

#### OwnedCard（所有カード）

`Card` を継承し、以下を追加:

| フィールド | 型 | 説明 |
|-----------|------|------|
| obtainedAt | string | 取得日時（ISO文字列） |
| isNew | boolean | 未閲覧フラグ |
| memo? | string | ユーザーメモ |
| attachedImages? | string[] | base64エンコード画像配列 |

### 3.2 カードデータ構造

**総カード数: 58枚**

#### グループ別・シリーズ別内訳

| グループ | LIVE TOUR シリーズ | ファンサコレクション | 合計 |
|---------|-------------------|-------------------|------|
| Snow Man | 9枚 | 9枚 | 18枚 |
| SixTONES | 6枚 | 6枚 | 12枚 |
| なにわ男子 | 7枚 | 7枚 | 14枚 |
| Travis Japan | 7枚 | 7枚 | 14枚 |

#### レアリティ分布

| レアリティ | 枚数 | 出典シリーズ |
|-----------|------|------------|
| Normal | 14枚 | LIVE TOUR |
| Rare | 12枚 | LIVE TOUR |
| SR | 8枚 | LIVE TOUR |
| UR | 20枚 | ファンサコレクション |
| Legend | 4枚 | ファンサコレクション（各グループ1枚） |

#### Legend カード（最高レアリティ）

| カードID | メンバー | グループ |
|---------|---------|---------|
| sm-fans-07 | 目黒蓮 | Snow Man |
| st-fans-03 | 松村北斗 | SixTONES |
| nw-fans-03 | 道枝駿佑 | なにわ男子 |
| tj-fans-05 | 松倉海斗 | Travis Japan |

#### カードID命名規則

`{グループ略称}-{シリーズ略称}-{番号}`

- `sm` = Snow Man, `st` = SixTONES, `nw` = なにわ男子, `tj` = Travis Japan
- `tour` = LIVE TOUR, `fans` = ファンサコレクション

---

## 4. 画面一覧・ルーティング

| URLパス | ページ名 | レイアウト | 認証要否 |
|---------|---------|----------|---------|
| `/` | ランディング | 独立（フルスクリーン） | 不要 |
| `/login` | ログイン（ユーザー登録） | 独立（フルスクリーン） | 不要 |
| `/home` | ホーム | AppShell（BottomNav付き） | 必要 |
| `/gacha` | ガチャ | AppShell | 必要 |
| `/collection` | コレクション | AppShell | 必要 |
| `/card/[id]` | カード詳細 | 独立（max-w-md） | 必要 |
| `/shop` | ショップ | AppShell | 必要 |
| `/history` | ヒストリー | AppShell | 必要 |
| `/settings` | 設定 | AppShell | 必要 |

---

## 5. 画面遷移フロー

```
[/] ランディング
 ├── (ユーザー存在) ──────────────────→ [/home]
 └── 「はじめる」 → [/login] ログイン
                      ├── (ユーザー存在) → [/home]
                      └── 登録完了 ──────→ [/home]

[/home] ホーム ←── AppShell BottomNav で相互遷移 ──→
 ├── ヒストリーリンク → [/history]
 ├── (BottomNav) ガチャ → [/gacha]
 ├── (BottomNav) ショップ → [/shop]
 ├── (BottomNav) コレクション → [/collection]
 └── (BottomNav) 設定 → [/settings]

[/gacha] ガチャ
 ├── 「コレクションへ」 → [/collection]
 └── 「もう一回」 → ガチャ再実行

[/collection] コレクション
 ├── カードタップ → [/card/[id]]
 └── 空状態「ガチャを引く」 → [/gacha]

[/card/[id]] カード詳細
 └── 戻るボタン → router.back()

[/shop] ショップ
 └── カード購入 → 思い出記録 → ショップに戻る

[/history] ヒストリー
 ├── カードタップ → [/card/[id]]
 └── 空状態「ガチャを引く」 → [/gacha]

[/settings] 設定
 ├── 「担当を変更」 → [/login]
 ├── 「ログアウト」 → [/]
 └── 「データの全削除」 → [/]
```

---

## 6. 各画面の詳細仕様

### 6.1 ランディングページ (`/`)

- 「STARTO Card Collection」タイトルと「推しのカードを集めよう」サブタイトル
- 背景にメンバーカラーの浮遊するオーブアニメーション
- 「はじめる」ボタンで `/login` へ遷移
- ユーザーが既に登録済みの場合、自動的に `/home` へリダイレクト

### 6.2 ログインページ (`/login`)

2ステップ式の登録フォーム:

**Step 1 - ニックネーム入力**
- テキスト入力（最大20文字）
- 「次へ」ボタンで Step 2 へ

**Step 2 - 担当メンバー選択**
- グループタブ切り替え（横スクロール）
- メンバーグリッド表示（画像付き）
- 選択はオプション（「スキップ」可能）
- 「はじめる」ボタンで登録完了、`/home` へ遷移

### 6.3 ホームページ (`/home`)

- **Header**: コイン残高表示
- **FeaturedBanner**: UR/Legend カードの自動スライドショー（5秒間隔）、ガチャへの誘導
- **GroupCarousel**: グループ一覧の横スクロール、各グループの所持数表示、タップでコレクションへ
- **CollectionProgress**: 各グループの収集進捗を円形プログレスリングで表示（2カラムグリッド）
- **ヒストリーリンク**: `/history` への導線カード
- **ActivityFeed**: 「みんなの活動」フェイクデータによるソーシャルフィード表示（時間帯ベースのシード乱数で生成）

### 6.4 ガチャページ (`/gacha`)

- ガチャバナー表示
- 排出確率表示（折りたたみ式アコーディオン）
- 3種のガチャボタン:
  - **無料1回**: 1日1回無料（日付判定）
  - **1回ガチャ**: 300コイン
  - **10連ガチャ**: 2,700コイン（SR以上1枚確定）
- 状態遷移: `select` → `drawing`（演出） → `reveal`（結果表示）
- 重複カードは50コイン返還
- 10連結果はグリッド表示 + タップで個別表示

### 6.5 コレクションページ (`/collection`)

- 所持カード数 / 全カード数の表示
- グループフィルタータブ
- 表示モード切替: 所持のみ / 図鑑モード（未所持はシルエット表示）
- 3列カードグリッド
- カードタップでカード詳細へ遷移
- クエリパラメータ `?group=xxx` でグループ初期選択対応
- 空状態: 「ガチャを引く」リンク表示

### 6.6 カード詳細ページ (`/card/[id]`)

- カードビジュアル（メンバー画像 + ホログラムオーバーレイ）
- 閲覧者数表示（ランダム5〜30人、演出用）
- レアリティバッジ
- カード情報パネル（グループ、メンバー、シリーズ、カード番号、取得日）
- **所持カード限定機能**:
  - **メモ機能**: テキストエリア、フォーカス外で自動保存
  - **写真添付**: 画像アップロード（最大幅800px、JPEG 80%品質、base64保存）
  - フルスクリーン表示、削除確認モーダル
- Web Share API によるシェア機能
- 未所持カードはカタログから表示（閲覧のみ）

### 6.7 ショップページ (`/shop`)

- ヘッダーにコイン残高表示
- グループフィルター + レアリティフィルター（N/R/SR/UR/LG）
- 2列カードグリッド（メンバー画像・価格表示）
- 取得済みカードは「取得済み」オーバーレイ、タップ不可
- 購入フロー: 確認画面 → 成功画面（1.2秒） → 思い出記録画面（メモ+写真） → 保存/スキップ
- クエリパラメータ `?group=xxx` 対応

### 6.8 ヒストリーページ (`/history`)

- 取得日ごとにグルーピング（新しい順）
- 各カード: サムネイル、タイトル、メンバー名、レアリティ、メモプレビュー（50文字）、添付画像数
- カードタップでカード詳細へ遷移
- 空状態: 「ガチャを引く」リンク

### 6.9 設定ページ (`/settings`)

- ユーザープロフィールカード（名前、担当メンバー、カード枚数、コイン数）
- **担当を変更**: `/login` へ遷移
- **ホーム画面に追加**: PWA インストール案内
- **アプリについて**: バージョン情報（v1.0.0）
- **ログアウト**: 確認ダイアログ → ユーザー情報のみ削除 → `/` へ
- **データの全削除**: 確認ダイアログ → 全データ削除 → `/` へ

---

## 7. UIコンポーネント設計

### 7.1 レイアウトコンポーネント

#### AppShell

アプリの全体レイアウトシェル。`max-w-md`（448px）で画面幅を制限し、`BottomNav` を固定表示する。背景色 `#030712`。

#### Header

| Prop | 型 | 説明 |
|------|------|------|
| title | string | ページタイトル |
| showBack? | boolean | 戻るボタン表示 |
| rightAction? | ReactNode | 右側カスタムアクション |
| coins? | number | コイン残高表示 |
| variant? | "default" \| "transparent" | ヘッダースタイル |

- `default`: ガラスモーフィズム風、スクロール追従（sticky）
- `transparent`: 透過、コンテンツ上にオーバーレイ

#### BottomNav

5タブの固定下部ナビゲーション:

| パス | ラベル | アイコン |
|------|--------|---------|
| `/home` | ホーム | Home |
| `/gacha` | ガチャ | Sparkles |
| `/shop` | ショップ | ShoppingBag |
| `/collection` | コレクション | LayoutGrid |
| `/settings` | 設定 | Settings |

### 7.2 ホーム画面コンポーネント

| コンポーネント | 役割 |
|--------------|------|
| FeaturedBanner | UR/Legend カードの自動スライドショー（5秒間隔切替） |
| GroupCarousel | グループの横スクロールカルーセル（所持数バッジ付き） |
| CollectionProgress | 円形プログレスリングによる収集進捗表示 |
| ActivityFeed | フェイクデータによるソーシャル活動フィード |

### 7.3 ガチャコンポーネント

#### DrawAnimation（ガチャ演出）

3段階のアニメーションフェーズ:

| フェーズ | 時間 | 演出 |
|---------|------|------|
| spin | 0〜1400ms | 6色オーブが円形に回転 + 背景パーティクル20個 |
| converge | 1400〜2100ms | オーブが中央に収束、白い光のグロウ拡大 |
| flash | 2100〜2600ms | 画面全体が白くフラッシュ → 完了コールバック |

オーブカラー: `#60A5FA`, `#EF4444`, `#F59E0B`, `#22C55E`, `#EC4899`, `#8B5CF6`

#### GachaCardReveal（カードリビール）

- カード登場アニメーション: 3D回転（`rotateY: 90° → 0°`）+ スケール（`0.5 → 1`）
- レアリティ別グロウエフェクト
- NEW! バッジ（spring アニメーション）
- タップで次のカードまたは結果画面へ

### 7.4 CardTile（カードタイル）

| 状態 | 表示 |
|------|------|
| 所持 | メンバー画像 + ホログラムオーバーレイ + レアリティグロウ + タップで詳細遷移 |
| 未所持 | 「?」+ ロックアイコン + グレー背景 |

サイズバリアント: `sm` / `md`

### 7.5 PWARegister

UI なし。マウント時に `/sw.js` を Service Worker として登録。

---

## 8. ガチャシステム

### 8.1 排出確率

| レアリティ | 確率 | 累積確率 |
|-----------|------|---------|
| Legend | 1% | 1% |
| UR | 4% | 5% |
| SR | 15% | 20% |
| Rare | 30% | 50% |
| Normal | 50% | 100% |

### 8.2 ガチャ種類

| 種類 | コスト | 特典 |
|------|--------|------|
| 無料1回 | 0コイン | 1日1回限定 |
| 1回ガチャ | 300コイン | - |
| 10連ガチャ | 2,700コイン | 最低1枚 Rare 以上保証 |

### 8.3 ロジック詳細

1. `drawGacha(count)` で `count` 回ループ
2. 各回で `rollRarity()` により確率テーブルに基づきレアリティ決定
3. 決定されたレアリティの全カード（全グループ混合）から均等ランダムに1枚選出
4. 10連の最後の1枚（10枚目）で Normal が出た場合、Rare に引き上げ（天井保証）
5. グループフィルタリングはなし

### 8.4 重複処理

- 既に所持しているカードが排出された場合、重複として扱う
- 重複カードは50コインとして返還
- `addCards()` は `newCount` と `dupeCount` を返し、UIに新規/重複数を通知

### 8.5 無料ガチャ

- `canDoFreeGacha()`: 最終無料ガチャ日と今日の日付を比較
- `markFreeGachaUsed()`: 使用日時を記録
- 日付が変わるとリセットされる

---

## 9. コインエコノミー

### 9.1 定数

| 項目 | 値 |
|------|------|
| 初期所持コイン | 100,000 |
| 単発ガチャコスト | 300 |
| 10連ガチャコスト | 2,700（10回分 3,000 から 300 割引） |
| 重複カード返還 | 50 |

### 9.2 ショップ価格

| レアリティ | 価格 |
|-----------|------|
| Normal | 100コイン |
| Rare | 300コイン |
| SR | 800コイン |
| UR | 2,000コイン |
| Legend | 5,000コイン |

### 9.3 コイン獲得手段

- 初期付与: 100,000コイン
- 重複カード返還: 50コイン / 枚
- ログインボーナス等のコイン獲得ロジックは未実装

---

## 10. カードショップ

### 10.1 概要

- 全58枚のカードを個別に指定購入可能
- レアリティに応じた固定価格設定
- 取得済みカードは「取得済み」表示で購入不可

### 10.2 フィルタリング

- グループフィルター: 全体 / Snow Man / SixTONES / なにわ男子 / Travis Japan
- レアリティフィルター: N / R / SR / UR / LG

### 10.3 購入フロー

```
カード選択 → 購入確認モーダル → 購入処理 → 成功画面（1.2秒表示）
  → 思い出記録画面（メモ入力 + 写真添付） → 保存 or スキップ
```

---

## 11. カード履歴・メモ機能

### 11.1 カード履歴

- `OwnedCard.obtainedAt` で取得日時を記録
- ヒストリーページで取得日ごとにグルーピング表示（新しい順）
- `isNew` フラグで未閲覧状態を管理、`markCardSeen()` で閲覧済みに変更

### 11.2 メモ機能

- カード詳細ページでテキストメモを入力可能
- フォーカス外（blur）時に自動保存（`updateCardMemo`）
- ヒストリーページでメモプレビュー表示（50文字まで）

### 11.3 写真添付機能

- カード詳細ページまたはショップ購入後の思い出記録画面で画像アップロード
- 画像処理: 最大幅800pxにリサイズ、JPEG 80%品質
- base64エンコードで `OwnedCard.attachedImages` 配列に保存
- フルスクリーン表示対応
- 削除確認モーダル付き

---

## 12. 状態管理・データ永続化

### 12.1 ストレージキー

| キー | 用途 | 型 |
|------|------|------|
| `starto_user` | ユーザー情報 | `User \| null` |
| `starto_cards` | 所有カード一覧 | `OwnedCard[]` |
| `starto_coins` | コイン残高 | `number` |
| `starto_last_free_gacha` | 最後の無料ガチャ日時 | `string \| null` |
| `starto_activity_log` | アクティビティログ | （定義あり、読み書き関数未実装） |

### 12.2 ストア関数一覧

**ユーザー管理**:
- `getUser()` / `setUser(user)` / `clearUser()` / `clearAllData()`

**コイン管理**:
- `getCoins()` / `setCoins(coins)` / `deductCoins(amount)` / `addCoins(amount)`
- `deductCoins` は残高不足時に `false` を返し処理中止

**カード管理**:
- `getCards()` / `addCard(card)` / `addCards(cards)` / `ownsCard(cardId)`
- `addCard` は重複時に追加しない（`isNew: false` を返す）
- `addCards` は `{ newCount, dupeCount }` を返す

**カード詳細**:
- `updateCardMemo(cardId, memo)` / `addCardImage(cardId, base64)` / `removeCardImage(cardId, index)`
- `markCardSeen(cardId)` / `getCollectionStats()`

**ガチャ管理**:
- `canDoFreeGacha()` / `markFreeGachaUsed()`

### 12.3 設計特性

- `getItem<T>()` / `setItem()` のジェネリックヘルパーで JSON シリアライズ/デシリアライズ
- SSR安全: 全関数で `typeof window === "undefined"` チェック
- ページ間のデータはリアルタイム同期しない（再読み込み時に反映）

---

## 13. PWA対応

### 13.1 マニフェスト設定

| 項目 | 値 |
|------|------|
| name | Digital Card Collection |
| short_name | Card Collect |
| description | デジタルカードを受け取り、コレクションしよう |
| start_url | / |
| display | standalone |
| orientation | portrait（縦画面固定） |
| background_color | #030712 |
| theme_color | #030712 |
| icons | 192x192, 512x512（any + maskable） |

### 13.2 Service Worker (`sw.js`)

- キャッシュ名: `dcc-v1`
- **install**: ルート URL (`/`) のみを事前キャッシュ、`skipWaiting()` で即座にアクティブ化
- **activate**: 古いキャッシュ（`dcc-v1` 以外）を自動削除、`clients.claim()` で即座に制御
- **fetch**: ナビゲーションリクエストのみ対象、ネットワーク優先でフォールバックキャッシュ
- アセットの個別キャッシュ戦略は未実装

### 13.3 Apple Web App対応

- `apple-mobile-web-app-capable: yes`
- `apple-mobile-web-app-status-bar-style: black-translucent`
- ビューポート: `userScalable: false`（ピンチズーム無効）

---

## 14. 認証・セキュリティ

### 14.1 サーバーレベル認証（Middleware）

- **方式**: HTTP Basic認証
- **環境変数**: `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`
- 未設定時はスキップ（開発環境）
- 除外パス: `_next/static`, `_next/image`, `favicon.ico`, `icons/`, `sw.js`, `manifest.json`

### 14.2 アプリ内認証

- localStorage ベースのユーザー存在チェック
- 全認証必要ページで `useEffect` 内の `getUser()` null チェック → 未登録なら `/` へリダイレクト
- `mounted` state で初回レンダリング制御（データ読み込み完了前は空 div 表示）

---

## 15. デザインシステム

### 15.1 カラーパレット

**ベースカラー**:

| 用途 | カラー |
|------|--------|
| 背景 | #030712（ほぼ黒） |
| テキスト（最高） | white |
| テキスト（高） | white/70 |
| テキスト（中） | white/50 |
| テキスト（低） | white/30 |

**アクセントカラー**:

| 名前 | カラー | 用途 |
|------|--------|------|
| Primary（Pink） | #ec6d81 | BottomNav アクティブ、メインアクション |
| Gold | #f6ab00 | コイン表示、Legend グロウ |
| Matcha（Green） | #90c31f | 完了状態 |
| Rose（Purple） | #b08bbe | Epic グロウ |

**レアリティ別グローカラー**:

| レアリティ | グローカラー |
|-----------|------------|
| Normal | rgba(191,191,191,0.6) — 白系 |
| Rare | rgba(100,129,192,0.6) — 青系 |
| SR（Epic） | rgba(176,139,190,0.7) — 紫系 |
| UR | （中間色） |
| Legend | rgba(246,171,0,0.8) — 金系 |

### 15.2 デザインパターン

**ガラスモーフィズム**:
- `glass-dark`: Header デフォルトスタイル（半透明背景 + backdrop-blur）
- `glass-dark-strong`: BottomNav
- コンテナ: `bg-white/[0.04]` + `border-white/[0.08]`

**カスタム CSS クラス**:
- `card-glow-{rarity}`: レアリティ別カードグロウエフェクト
- `card-holo-overlay`: ホログラムシマーエフェクト
- `nav-indicator`: BottomNav アクティブインジケーター
- `scrollbar-hide`: スクロールバー非表示
- `pb-safe`: セーフエリアパディング

### 15.3 アニメーションパターン

| パターン | 使用箇所 |
|---------|---------|
| スタガードアニメーション（`delay: i * 0.08`） | GroupCarousel, CollectionProgress, ActivityFeed |
| `AnimatePresence mode="wait"` | FeaturedBanner の切替 |
| フェーズ管理（useState + setTimeout） | DrawAnimation |
| spring アニメーション | NEW! バッジ |
| 3D回転（rotateY） | GachaCardReveal |

### 15.4 レイアウト原則

- モバイルファースト: `max-w-md`（448px）で全体制限
- 縦画面固定（orientation: portrait）
- 一貫した左右パディング: `px-4`
- セクション間スペース: `mt-6`

---

## 16. アセット管理

### 16.1 カード画像（`/public/cards/`）

**実写画像（JPG） - 8枚**:
snowman.jpg, sixtones.jpg, kingandprince.jpg, naniwa.jpg, travisjapan.jpg, heysayjump.jpg, supereight.jpg, kismyft2.jpg

**レガシー SVG - 8枚**（旧デザイン/プレースホルダー）:
phoenix.svg, dragon.svg, spirit.svg, golem.svg, wolf.svg, unicorn.svg, hawk.svg, turtle.svg

### 16.2 メンバー画像（`/public/members/`）

合計29枚（JPG形式）。プレフィックスでグループを識別:

| プレフィックス | グループ | 人数 |
|--------------|---------|------|
| `sm-` | Snow Man | 9名 |
| `st-` | SixTONES | 6名 |
| `nw-` | なにわ男子 | 7名 |
| `tj-` | Travis Japan | 7名 |

> **注意**: King & Prince, Hey! Say! JUMP, SUPER EIGHT, Kis-My-Ft2 のメンバー画像は未提供。

### 16.3 アイコン（`/public/icons/`）

| ファイル | 用途 |
|---------|------|
| icon-192.svg | SVG版ソース |
| icon-192.png | PWAアイコン（192x192） |
| icon-512.png | PWAアイコン（512x512） |

---

## 17. 既知の制約・注意事項

### データの脆弱性

- localStorage はユーザーが DevTools 等で直接編集可能
- ブラウザのストレージクリアで全データ消失
- base64 画像を localStorage に保存しているため、大量の画像添付で容量上限（通常 5〜10MB）に達する可能性がある

### 仕様書間の不整合

- `specification.md` ではライトモード（#F4F5F6 背景）と記載されているが、実際の実装はダークテーマ（#030712 背景）
- `specification.md` ではプログラム・バッジ機能の記載があるが、現在の実装には含まれていない
- `specification.md` では BottomNav が4タブ（コレクション/プログラム/ショップ/設定）だが、実装は5タブ（ホーム/ガチャ/ショップ/コレクション/設定）

### 未実装機能

- コイン獲得手段（ログインボーナス等）
- プログラム・バッジシステム
- サーバーサイドデータ永続化
- アセットキャッシュ戦略（Service Worker）
- King & Prince, Hey! Say! JUMP, SUPER EIGHT, Kis-My-Ft2 のメンバー画像
- `starto_activity_log` の読み書き関数

### ページ間データ同期

- ページ間でのリアルタイムデータ同期は行われない
- あるページでデータ更新後、他のページでは再読み込み時にのみ反映される
