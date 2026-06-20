# 技術提案書サポート — 次回再開用メモ

最終更新: 2026-06-20（Phase 1 認証実装・通し確認完了）

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
| 案件詳細（DB・編集中） | http://localhost:3000/proposal/cases/04c8f8ca-6b22-4c3d-bb21-2c37e6397542?tab=draft |
| 案件詳細（モック） | http://localhost:3000/proposal/cases/case-1?tab=draft |
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
- **Supabase SQL 2本実行済み**（`add_case_detail_fields.sql` + `add_storage.sql`）
- PDF/Word は **Supabase Storage にモック保存**（実 .docx / 本番 PDF は未実装）
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

### 案件詳細 DB 化 + Storage（2026-06-13 ローカル確認済み）

- Supabase SQL 実行済み: `add_case_detail_fields.sql`, `add_storage.sql`
- **確認済み案件:** `04c8f8ca-6b22-4c3d-bb21-2c37e6397542`（テスト地質調査）
  - チェックリスト確定（採点項目 0件のまま）→ 初稿生成 → F5 後も残る ✅
  - `generated_sections` 全 true、`status=editing`
  - Storage: `cases/.../proposal-v1.docx` 保存済み
- **通し確認済み（2026-06-20）:** 新規案件 `48acaa1a-5f3e-483c-90c1-61ef21564b83`（通し確認テスト）
  - 採点項目4件 → 確定 → 初稿(v1) → 適合(v2, compliance 4件) → 承認申請 → 部長/支社長承認 → PDF → 一覧再取得で永続化 OK
  - Word DL: 377 bytes / PDF DL: 600 bytes（モック）
- GitHub push 済み: `090206b`

追加 API（Storage 含む）:
  - `POST .../seed-checklist` / `generate-draft` / `run-compliance`
  - `GET .../download-word` / `download-pdf`
  - `POST .../generate-pdf`

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

## 完成品化ロードマップ

| Phase | 内容 | 状態 |
|---|---|---|
| 1 | 認証・権限・RLS | **コード実装済み**（要: Supabase SQL + Auth ユーザー作成） |
| 2 | Word/PDF 実ファイル生成 | 未着手 |
| 3 | 適合チェック本実装 | 未着手 |
| 4 | パイロット運用（監査ログ等） | 未着手 |

### Phase 1 — 認証（2026-06-20 実装）

**コード側（完了）**
- ログイン `/proposal/login`（メール + パスワード）
- Middleware で `/proposal/*` `/api/proposal/*` を保護
- ヘッダーのロール切替を廃止 → ログインユーザーの role 表示
- API はセッション必須。承認/差戻しは **サーバー側の role** で判定（クライアント送信不可）
- 新規案件は `assignee_id` = ログインユーザー

**Supabase で実行すること（必須）**

1. **Authentication → Providers → Email** を ON
2. **SQL Editor** で `supabase/add_auth_profiles.sql` を実行
3. **Authentication → Users** でパイロットユーザーを作成（3〜4人）
4. プロフィールのロール設定（SQL 例）:

```sql
-- UUID は Dashboard → Authentication → Users で確認
update public.proposal_profiles
set role = 'manager', display_name = '部長 高橋'
where id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

update public.proposal_profiles
set role = 'director', display_name = '支社長 伊藤'
where id = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy';
```

5. 既存案件を編集可能にする場合（任意）:

```sql
update public.proposal_cases
set assignee_id = '担当者ユーザーの UUID'
where assignee_id is null;
```

6. **GitHub push → Vercel Redeploy**（環境変数は既存のまま）

**Phase 1 完了の確認**
- 未ログインで `/proposal` → ログイン画面へリダイレクト
- 担当者でログイン → 部長承認ボタンが出ない
- 部長でログイン → 承認待ち案件のみ承認可
- `/api/proposal/cases` 直叩き → 401

## 次回やること（優先度順）

1. **Phase 1 仕上げ（Supabase 側）** — 上記 SQL 実行 + パイロットユーザー作成 + push/Redeploy
2. **Phase 2** — Word/PDF 実ファイル生成
3. 外観の修正・図解更新（いつでも可）

### DB 案件の開き方（UUID は画面に出ない）

- 案件一覧 http://localhost:3000/proposal で **工事名の行をクリック**
- 一覧に出ている案件はすべて DB 案件（例: テスト地質調査、A地区地質調査業務）
- UUID は URL バーにのみ表示（例: `/cases/04c8f8ca-...`）

### 適合チェックを試すとき

- 採点項目が必要 → **新規案件**で「サンプル採点項目を追加」してから確定
- 確定済み案件（テスト地質調査）は採点項目追加不可 → 新規案件を使う

### Supabase SQL 実行手順（✅ 2026-06-13 実行済み）

参考: `supabase/add_case_detail_fields.sql` → `supabase/add_storage.sql`

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
| 適合チェック | DB 保存済み・通し確認 OK | 実 PDF 抽出（将来） |
| 承認フロー | DB 保存済み・通し確認 OK | — |
| PDF 出力 | Storage モック + DL 確認 OK | 本番 PDF 生成 |
| 公開 | Vercel 通し確認 OK（`090206b` デプロイ） | 未コミット変更の push（任意） |

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
- Supabase SQL 2本実行済み、GitHub push 済み（090206b）
- ローカル確認: テスト地質調査で確定→初稿生成→F5 永続化 OK
- Storage に Word モック保存 OK

【次の作業】
1. 新規案件で適合チェック〜承認〜PDF の通し確認（F5 永続化）
2. Vercel 公開サイト（proposal-support.vercel.app）の動作確認
3. Word ダウンロードの確認（任意）

npm run dev も起動してください。
```

## 作業終了時メモ

### 2026-06-20（Phase 1 認証実装）

- **認証基盤** — `@supabase/ssr`、Middleware、ログインページ、API セッション検証
- **RLS 用 SQL** — `supabase/add_auth_profiles.sql`（profiles / assignee_id / Storage 非公開）
- **UI** — ロール切替廃止、ログアウト、ユーザー名表示
- **要ユーザー作業** — Supabase で Email Auth ON + SQL 実行 + ユーザー作成 + ロール設定 + push

### 2026-06-20（通し確認完了）

- **dev サーバー起動** — http://localhost:3000/proposal
- **ローカル通し確認（API）** — 案件 `48acaa1a-5f3e-483c-90c1-61ef21564b83`
  - seed-checklist → confirm → generate-draft → run-compliance → request-approval → approve×2 → generate-pdf
  - 一覧再取得で `status=approved`, `complianceItems=4`, `pdfFilePath` 残存 OK
  - Word/PDF DL: HTTP 200
- **Vercel 通し確認（API）** — 案件 `8363baad-a4a5-4ec3-903b-f4eac85ee130`
  - 同上フロー全ステップ OK / Word 320 bytes / PDF 597 bytes
  - 公開 URL: https://proposal-support.vercel.app/proposal/cases/8363baad-a4a5-4ec3-903b-f4eac85ee130?tab=approval
- **ローカル未コミット変更あり** — `download-*`, `file-storage`, `document-content`, `add_storage.sql`, 本ファイル
- **次回（任意）:** ブラウザ UI での目視確認、未コミット変更の整理・`git push github main`

### 2026-06-13（作業一時終了）

- **Supabase SQL 2本実行** — ユーザー実施、`checklist_items` 列・`proposal-files` バケット OK
- **ローカル確認** — テスト地質調査（`04c8f8ca-...`）: 確定→初稿生成→F5 OK、Word Storage 保存 OK
- 採点項目はスキップ（0件のまま確定）
- GitHub push 済み: `090206b`
- **次回:** 新規案件で適合〜承認〜PDF 通し確認、Vercel 確認

### 2026-06-13（開発・push）

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
