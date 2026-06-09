# 技術提案書サポート — 次回再開用メモ

最終更新: 2026-06-09（承認フローの DB 保存を実装）

## クイックスタート

```powershell
cd C:\Users\haram\src\workspace-ui-kit
npm run dev
```

ブラウザ: http://localhost:3000/proposal

開発サーバーが止まっているとページは開けません。先に `npm run dev` が必要です。

## この機能の場所

| 種別 | パス |
|---|---|
| ルーティング | `app/proposal/` |
| UIコンポーネント | `components/proposal/` |
| 型・ラベル・モック | `lib/proposal/` |
| 再開用メモ（本ファイル） | `docs/proposal-RESUME.md` |

## 主要URL（ローカル）

| 画面 | URL |
|---|---|
| 案件一覧 | http://localhost:3000/proposal |
| 新規案件 | http://localhost:3000/proposal/cases/new |
| 案件詳細（編集中） | http://localhost:3000/proposal/cases/case-1?tab=draft |
| 承認待ち（部長） | ヘッダーでロールを「部長」に切替 → 案件一覧 |
| 承認済み（PDF可） | http://localhost:3000/proposal/cases/case-3?tab=approval |

## モック案件（3件）

| ID | 案件名 | ステータス | 確認用途 |
|---|---|---|---|
| case-1 | ○○地区地質調査業務 | editing | Word再取込・文案タブ |
| case-2 | △△トンネル地質調査 | pending_manager | 部長承認待ち |
| case-3 | □□盛土調査 | approved | PDF出力ボタン |

## 設計上の決定（再開時の前提）

- **2ペイン構成**を採用（4ペインではない）
  - 左: ProgressStepper（6ステップ）
  - 右: 6タブ（基本情報 / チェックリスト / 文案・Word / 適合チェック / 承認 / 履歴）
- **ワンクリック削減**をUI方針とした
- **Supabase 連携（Step 2 完了）** — `proposal_cases` テーブル、`.env.local` 設定済み
- **Step 3 完了**（新規案件の保存→一覧表示→リロードで残ることを API で確認済み）
- PDF/Word生成・承認フローの状態遷移は未実装

## 2026-06-04 までに実装したUI改善

1. ProgressStepper ↔ タブ連動（クリックで移動、ロック理由を常時表示）
2. タブの状態バッジ（未確定 / 未生成 / △× / 部長待ち 等）
3. 「次: ○○」ボタン + 補足文（同一タブでは非表示）
4. 案件一覧: 行クリックで開く、「続きから」カード、現在ステップ列
5. ステータスに応じたデフォルトタブ（`getDefaultTabForCase`）
6. 文案タブ: Phase A/B 分離、無効ボタンの理由表示
7. チェックリスト: 「確定して初稿生成へ」（1ボタンで draft タブへ）
8. 適合チェック: 「申請して承認タブへ」
9. 新規案件作成後 → `?tab=checklist` へ遷移
10. `ReferenceContextBar` / `ResumeCaseCard` コンポーネント追加

### 触った主なファイル

- `lib/proposal/utils.ts` — ナビゲーション・バッジ・次アクション
- `components/proposal/CaseDetailPage.tsx`
- `components/proposal/CaseListPage.tsx`
- `components/proposal/ProgressStepper.tsx`
- `components/proposal/ReferenceContextBar.tsx`
- `components/proposal/ResumeCaseCard.tsx`
- `components/proposal/tabs/*.tsx`
- `components/proposal/NewCaseWizard.tsx`

## 図解（別リポジトリ）

| 内容 | ローカル | 公開URL |
|---|---|---|
| ツール案説明（キャプチャ付き） | `C:\Users\haram\src\creating-visual-explainers\output\proposal-tool-concept.html` | https://diagram-proposal-tool-concept.surge.sh |
| 作業フロー図解 | `...\output\proposal-workflow.html` | 未公開 |
| スクリーンショット | `...\output\proposal-tool-screenshots\` | — |

図解の再公開（PowerShell）:

```powershell
cd C:\Users\haram\src\creating-visual-explainers\output
# HTML + 画像フォルダを一時ディレクトリにまとめて index.html にして surge する
npx --yes surge <一時フォルダ> --domain diagram-proposal-tool-concept.surge.sh
```

公開履歴: `C:\Users\haram\src\creating-visual-explainers\deploy-history.log`

## 教材ステップの進捗（「画面に記憶を持たせる」）

| Step | 内容 | 状態 |
|---|---|---|
| 1 | 何を保存するか決める（`proposal_cases` 設計） | ✅ 完了 |
| 2 | Supabase 準備・テーブル作成・`.env.local` | ✅ 完了 |
| 3 | 登録画面で保存＋一覧表示＋リロードで残る | ✅ 完了（API＋ブラウザ確認済み） |
| 4 | （Step 3 と同時）表示と永続化の確認 | ✅ 完了（ブラウザ確認済み） |
| 5 | Vercel に公開 | ✅ 完了（2026-06-07 案件一覧表示確認済み） |

### Supabase（本番ではない dev 用）

| 項目 | 値 |
|---|---|
| プロジェクト名 | `proposal-support-dev` |
| Project URL | `https://zapadlilqnyaiqbbdcqz.supabase.co` |
| テーブル | `proposal_cases` |
| SQL | `supabase/proposal_cases.sql` |
| 環境変数 | `.env.local`（**`.env.local.example` ではない**） |

### Step 2〜3 で追加したファイル

- `lib/supabase/client.ts` / `server.ts` / `types.ts`
- `lib/proposal/case-repository.ts` — DB 読み書き（`confirmChecklist` 追加）
- `lib/proposal/map-case-row.ts` — DB行 → ProposalCase 変換
- `app/api/proposal/cases/route.ts` — GET一覧 / POST作成
- `app/api/proposal/cases/[id]/confirm-checklist/route.ts` — チェックリスト確定
- `components/proposal/NewCaseWizard.tsx` — フォーム入力→API保存
- `components/proposal/CaseListPage.tsx` — API から一覧取得
- `components/proposal/tabs/ChecklistTab.tsx` — 確定ボタンで API 呼び出し

### チェックリスト確定（2026-06-08 完了）

- Supabase SQL 実行済み（`add_checklist_confirmed.sql`）
- ブラウザ確認済み: 確定 → 文案タブ遷移 → F5 後も「確定済」が残る
- DB: `checklist_confirmed = true`, `status = ready_to_generate`

### 承認フロー（2026-06-09 完了）

- Supabase SQL 実行済み（`add_approval_fields.sql`）
- ブラウザ確認済み: 部長承認 → 支社長承認 → **承認済み** まで到達
- 承認フロー表示: 部長 高橋 → 支社長 伊藤 が記録される
- DB: `status = approved`, `manager_*` / `director_*` カラムに値が入る

追加 API:

- `POST /api/proposal/cases/[id]/request-approval` — 承認申請（`editing` → `pending_manager`）
- `POST /api/proposal/cases/[id]/approve` — 承認（部長/支社長）
- `POST /api/proposal/cases/[id]/return` — 差戻し

### 公開先（Vercel / GitHub）

| 種別 | URL |
|---|---|
| 公開サイト（案件一覧） | https://proposal-support.vercel.app/proposal |
| Vercel プロジェクト | https://vercel.com （左メニュー → proposal-support） |
| GitHub リポジトリ | https://github.com/co24jiko-sketch/proposal-support |
| 環境変数の場所 | Vercel → 左メニュー **Environment Variables**（Settings タブではない） |

※ 環境変数を変更したら必ず **Redeploy** する。

## 次回やること（優先度順）

教材 Step 1〜5 は完了。以降はツールの「中身」を DB とつなぐフェーズ。

1. ~~**チェックリスト確定**~~ ✅ 完了（SQL 実行・ブラウザ確認済み）
2. ~~**承認フロー**~~ ✅ 完了（SQL 実行・部長/支社長承認のブラウザ確認済み）
3. **案件詳細の完全 DB 化** — モック案件（case-1〜3）への依存を減らす ← **次はここ**
4. PDF / Word 生成（Supabase Storage 等）
5. 外観の修正（いつでも可）
6. 図解の更新・再公開

## 再開手順（自分で始める場合）

### ローカル開発

```powershell
cd C:\Users\haram\src\workspace-ui-kit
npm run dev
```

- ローカル: http://localhost:3000/proposal
- `.env.local` があるか確認（`.env.local.example` ではない）

### 公開サイトの確認

- https://proposal-support.vercel.app/proposal

## Cursor で再開するときの依頼例（コピペ用）

```
C:\Users\haram\src\workspace-ui-kit\docs\proposal-RESUME.md を読んで、
技術提案書サポートの続きを進めてください。
教材 Step 1〜5 は完了済みです。
次は「Supabase SQL 実行 → 承認フローの動作確認」からお願いします。
npm run dev も起動してください。
```

## 作業終了時メモ

### 2026-06-09

- **承認フローの DB 保存** — 申請・承認・差戻しの API と UI 連携を実装
- Supabase SQL 実行・ブラウザ確認まで完了（テスト地質調査で部長→支社長承認）
- **次回:** 案件詳細の DB 化、または GitHub push & Vercel redeploy

### 2026-06-08

- **チェックリスト確定の DB 保存** — 実装・Supabase SQL 実行・ブラウザ確認まで完了
- 追加ファイル: `supabase/add_checklist_confirmed.sql`, `app/api/proposal/cases/[id]/confirm-checklist/route.ts`
- 変更ファイル: `ChecklistTab.tsx`, `case-repository.ts`, `map-case-row.ts` ほか
- **次回:** 承認フロー（承認・差戻し）の DB 保存
- 未 push の変更あり → 次回 GitHub push & Vercel redeploy 推奨

### 2026-06-07

- 教材「画面に記憶を持たせる」は **Step 5 まで完了**
- Vercel 初回デプロイ時は環境変数に日本語が混ざりエラー → 入れ直し＋ Redeploy で解消
- Vercel の Settings は左メニューにない。Environment Variables は **左メニュー直下**
