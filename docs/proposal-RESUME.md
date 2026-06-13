# 技術提案書サポート — 次回再開用メモ

最終更新: 2026-06-13（Storage 実装・push 待ち / Supabase SQL 2本要実行）

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
| セッション用スライド画像 | `docs/proposal-storage-slide.png` |
| 保存場所の説明図解（HTML） | `docs/proposal-storage-explainer.html` |
| 保存場所の説明図解（画像） | `docs/proposal-storage-explainer.png` |

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
- チェックリスト確定・承認フロー（申請/承認/差戻し）は DB 連携済み
- 採点項目・適合チェック結果の DB 保存は **コード実装済み**
- **Supabase SQL 2本が未実行**（下記「SQL 実行手順」参照）
- PDF/Word は **Supabase Storage にモック保存**（実ファイル生成は簡易版）
- **保存場所の整理:** DB（Supabase）＝案件データ / GitHub＝コード / Storage＝ファイル

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

### 案件詳細 DB 化（2026-06-12 実装）

- Supabase SQL: `supabase/add_case_detail_fields.sql` を **SQL Editor で実行**（未実行だと API が 500）
- 採点項目: チェックリストタブ「サンプル採点項目を追加」→ `checklist_items` に保存
- 初稿生成: 文案タブ「初稿を一括生成」→ `generated_sections` + `status=editing` を保存
- 適合チェック: 「再取込して適合チェックへ」または適合タブ「再チェック実行」→ `compliance_items` に保存
- 追加 API:
  - `POST /api/proposal/cases/[id]/seed-checklist`
  - `POST /api/proposal/cases/[id]/generate-draft`
  - `POST /api/proposal/cases/[id]/run-compliance`
- **次回:** SQL 実行 → ブラウザで F5 永続化確認 → GitHub push & Vercel Redeploy

### 承認フロー（2026-06-09 完了）

- Supabase SQL 実行済み（`add_approval_fields.sql`）
- ブラウザ確認済み: 部長承認 → 支社長承認 → **承認済み** まで到達
- **差戻し確認済み**: 部長ロールで差戻 → `status = returned`、差戻理由が画面に表示、F5 後も残る
- 承認フロー表示: 部長 高橋 → 支社長 伊藤 が記録される
- DB: `status`, `return_reason`, `manager_*` / `director_*` カラムに値が入る

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

**Git push の注意:** GitHub へ push するときは `git push github main`（`origin` ではない。`origin` は Gitea で、push 時にサインイン画面が開くことがある→閉じて OK）

## 次回やること（優先度順）

教材 Step 1〜5 は完了。DB 連携フェーズの進捗:

1. ~~**チェックリスト確定**~~ ✅ 完了
2. ~~**承認フロー（承認・差戻し）**~~ ✅ 完了
3. ~~**Vercel 公開サイトの最終確認**~~ ✅ 2026-06-12 確認（一覧 API 応答・案件データ取得 OK）
4. **Supabase SQL 実行 → 動作確認 → push** ← **次に最初にやること**
   - `supabase/add_case_detail_fields.sql` を実行
   - `supabase/add_storage.sql` を実行
   - ローカルで採点項目追加 → 初稿生成 → Word DL → 適合チェック → F5 確認
   - `git push github main` → Vercel Redeploy
5. ~~PDF / Word 生成（Supabase Storage 等）~~ ✅ モック版実装済み（SQL 実行後に動作）
6. 外観の修正（いつでも可）
7. 図解の更新・再公開

### Supabase SQL 実行手順（必須・未実行だと API が 500）

1. https://supabase.com → プロジェクト `proposal-support-dev` → **SQL Editor**
2. **New query** → 以下を **この順番で** 貼り付け → **Run**

**① 案件詳細カラム** — `supabase/add_case_detail_fields.sql`

**② Storage + ファイルパス** — `supabase/add_storage.sql`

3. 実行後、Table Editor で `proposal_cases` に `checklist_items` 列があることを確認
4. Storage メニューに `proposal-files` バケットがあることを確認

### 未コミット・未 push の変更（2026-06-12 時点）

ローカルに変更あり。**GitHub / Vercel にはまだ反映されていない。**

主な追加・変更:
- `supabase/add_case_detail_fields.sql`
- `app/api/proposal/cases/[id]/seed-checklist/` ほか API 3本
- `lib/proposal/sample-checklist.ts`, `compliance-mock.ts`
- `ChecklistTab.tsx`, `DraftTab.tsx`, `ComplianceTab.tsx`
- セッション用: `docs/proposal-storage-slide.png`, `proposal-storage-explainer.*`

### 案件詳細 DB 化 — ローカル確認手順（SQL 実行後）

1. `npm run dev` → http://localhost:3000/proposal
2. DB 案件を開く（例: `checklistConfirmed: false` の案件）
3. チェックリストタブ →「サンプル採点項目を追加」→ 確定
4. 文案タブ →「初稿を一括生成」
5. 「再取込して適合チェックへ」→ 適合結果表示
6. **F5** → 採点項目・適合結果が残っていること

### 第4回グループセッション（2026-06-12 準備済み）

「何を・どこに保存するか」の共有資料を作成済み:

| 資料 | パス |
|---|---|
| 1枚スライド | `docs/proposal-storage-slide.png` |
| 説明図解（ブラウザ） | `docs/proposal-storage-explainer.html` をダブルクリック |
| 説明図解（画像） | `docs/proposal-storage-explainer.png` |

**セッションで話す軸:** DB＝案件の中身 / GitHub＝アプリの作り方 / Storage＝ファイル（予定）

**フィードバックで聞きたいこと:**
1. 採点項目は 1テーブル＋JSON で十分か？（別案: 別テーブルに正規化）
2. ファイルは Supabase Storage でよいか？（別案: SharePoint / 社内サーバー）
3. 承認者・履歴はどこまで DB に残すか？（別案: 履歴テーブル・認証連携）

### 残りの作業の概要（全体像）

| 領域 | 現状 | 残り |
|---|---|---|
| 案件の基本情報 | DB 保存済み | — |
| チェックリスト確定 | DB 保存済み | 採点項目の PDF 抽出（サンプル追加は DB 保存済み） |
| 文案・Word | Storage にモック Word 保存 + DL | 実 .docx 生成 |
| 適合チェック | チェック結果を DB 保存（モック） | 実 Word 解析 |
| 承認フロー | DB 保存済み | — |
| PDF 出力 | Storage にモック PDF 保存 + DL | 本番品質 PDF |
| 公開 | push 後 Vercel Redeploy 要 | デプロイ後の動作確認 |

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

【完了済み】
- 教材 Step 1〜5、チェックリスト確定、承認フロー DB 保存
- 案件詳細 DB 化 + Storage（Word/PDF モック）のコード実装
- 第4回セッション用説明資料

【次の作業】
1. Supabase SQL 2本の実行済み確認（未なら案内）
2. ローカル動作確認（F5 永続化・Word/PDF DL）
3. 必要なら git push github main → Vercel Redeploy

npm run dev も起動してください。
```

## 作業終了時メモ

### 2026-06-13（作業）

- **Supabase SQL 未実行を確認** — `checklist_items` 列なし（要: SQL 2本）
- **Storage 実装** — Word/PDF を `proposal-files` バケットにモック保存
- 追加 API: `download-word`, `download-pdf`, `generate-pdf`
- **注意:** ポート 3000 が別プロセス占有時は dev が **3001** になる
- **次:** ユーザーが SQL 実行 → ブラウザ確認 → push & Redeploy

### 2026-06-12（作業一時終了・セッション準備）

- **Vercel 確認** — 一覧・API 取得 OK（旧デプロイ。新機能は未反映）
- **案件詳細 DB 化** — コード実装完了（API 3本・UI 連携）
- **第4回セッション準備** — 「何を・どこに保存するか」のスライド・HTML 図解を作成
- **未完了（次回最初）:**
  - Supabase で `add_case_detail_fields.sql` 実行
  - ローカルブラウザ確認（F5 永続化）
  - GitHub push（`git push github main`）→ Vercel Redeploy
- **ローカルに未 push の変更あり**（最新コミットは `57c8d43`）
- **次回:** 上記仕上げ → PDF/Word 生成（Storage）

### 2026-06-12（開発作業）

- **Vercel 確認** — https://proposal-support.vercel.app/proposal および `/api/proposal/cases` で案件一覧取得 OK
- **案件詳細 DB 化** — 採点項目・適合チェック結果・文案生成状態の保存を実装
- **要対応:** Supabase で `add_case_detail_fields.sql` を実行してからローカル/Vercel で動作確認
- **次回:** SQL 実行後のブラウザ確認 → GitHub push → Vercel Redeploy → PDF/Word 生成

### 2026-06-09（作業終了）

- **承認フローの DB 保存** — 申請・承認・差戻しの API と UI 連携を実装
- ブラウザ確認: 部長→支社長承認、差戻し（差戻理由表示・F5 後も残る）
- GitHub push 済み: `git push github main`（コミット `57c8d43`）
- **次回:** Vercel 公開確認 → 案件詳細の DB 化（採点項目・適合チェック）
- Gitea サインイン画面が自動で開くことがある → 閉じて OK（GitHub とは別）

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
