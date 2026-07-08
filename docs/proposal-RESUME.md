# 技術提案書サポート — 次回再開用メモ

最終更新: 2026-07-02（Phase 5 記載ルールチェック・UI整理・機能全体図解公開）

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
| **パイロット運用手順** | `docs/proposal-pilot-guide.md` |
| **AI 文案入力設計** | `docs/proposal-ai-inputs.md` |
| **機能全体図解（HTML）** | `docs/proposal-overview-explainer.html` |
| 機能全体図解（キャプチャ） | `docs/proposal-overview-screenshots/` |
| キャプチャ再取得スクリプト | `scripts/capture-proposal-screenshots.mjs` |
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
| 承認待ち（部長） | 部長アカウントでログイン → 案件一覧 |
| 承認済み（PDF可） | 担当者でログイン → 承認タブ → PDF 出力 |

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
- PDF/Word は **Supabase Storage に実ファイル保存**（`docx` / `pdf-lib` + 日本語フォント）
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

## 図解・公開 URL

| 内容 | ローカル | 公開 URL |
|---|---|---|
| **機能全体図解（最新）** | `docs/proposal-overview-explainer.html` | https://diagram-proposal-overview.surge.sh |
| 保存場所の図解 | `docs/proposal-storage-explainer.html` | （ローカル／surge 未再公開） |
| 旧ツール案説明 | `creating-visual-explainers/output/proposal-tool-concept.html` | https://diagram-proposal-tool-concept.surge.sh |

### 機能全体図解の見方・更新

```powershell
cd C:\Users\haram\src\workspace-ui-kit
npm run dev
# → http://localhost:3000/docs/proposal-overview-explainer.html
# または
npm run docs:overview:open
```

キャプチャ再取得（件名は ○○地区地質調査業務 等に匿名化）:

```powershell
node scripts/capture-proposal-screenshots.mjs
```

Surge 再公開:

```powershell
$deployDir = Join-Path $env:TEMP "proposal-overview-deploy"
Remove-Item $deployDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
Copy-Item docs\proposal-overview-explainer.html (Join-Path $deployDir "index.html")
Copy-Item docs\proposal-overview-screenshots (Join-Path $deployDir "proposal-overview-screenshots") -Recurse
npx --yes surge $deployDir --domain diagram-proposal-overview.surge.sh
```

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
| 1 | 認証・権限・RLS | ✅ 完了（Supabase + ローカル/Vercel 確認済み） |
| 2 | Word/PDF 実ファイル生成 | ✅ 完了（ローカル + Vercel 確認済み） |
| 3 | 適合チェック本実装 | ✅ 完了（ローカル + Vercel 確認済み） |
| 4 | 監査ログ・版履歴 | ✅ 完了（ローカル + Vercel 確認済み） |
| — | **パイロット運用** | 📋 手順書作成済み・1 人通し確認 OK（`proposal-pilot-guide.md`） |

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

1. ~~**未 push 分のコミット**~~ — 図解 HTML・キャプチャ・`capture-proposal-screenshots.mjs`・`package.json`・ドキュメント整合（2026-07-08 完了）
2. ~~**ドキュメント整合**~~ — `proposal-pilot-guide.md` / `proposal-ai-inputs.md` を現行 UI に合わせて更新（2026-07-08 完了）
3. **関係者パイロット** — 日程が決まったら `docs/proposal-pilot-guide.md` に沿って実施
4. **Step 8〜9（未着手）** — 過去実績・関連業務メモ欄、留意事項テキスト欄（`docs/proposal-ai-inputs.md` 参照）
5. **任意** — Word 手修正再取込、本番 Supabase 環境、記載ルール拡張（留意事項との対応表示）

### Phase 3 実装サマリ（2026-06-20 完了）

| ステップ | 内容 | 主なファイル |
|---|---|---|
| 3-1 | 入札図書 PDF アップロード | `upload-bid` API, `add_bid_document.sql` |
| 3-2 | 採点基準マスタ選択（PDF 抽出は補助） | `scoring-templates.ts`, `apply-scoring-template` API |
| 3-3 | 適合チェック本実装（Word 本文照合） | `compliance-check.ts`, `docx-text.ts`（mammoth） |

**採点項目の正本:** チェックリストタブの「採点基準マスタ」→「適用する」  
**入札図書 PDF:** 参照用アップロード（新規案件 Step 2 の「アップロード」ボタンは未実装・案内文のみ）  
**適合チェック:** Storage の Word を読み、searchKeywords と照合 → ○△×（品質・安全は未記載なら × は正常）  
**Supabase SQL（未実行の場合）:** `supabase/add_bid_document.sql`（bid_document_name / bid_file_path）

### パイロット用アカウント

| ロール | メール | パスワード |
|---|---|---|
| 部長 | `manager@pilot.local` | `PilotManager2026` |
| 支社長 | `director@pilot.local` | `PilotDirector2026` |

※ 支社長ログイン失敗時: Dashboard でユーザーを削除→再作成（Auto Confirm）→ SQL で `role = 'director'` を設定。`Send password recovery` はメール rate limit で失敗することがある。

### 承認〜PDF の流れ（担当者視点・現行 UI）

1. チェックリストで **入札図書 PDF アップロード** → **提案の軸を確定** → **確定して初稿生成へ**
2. 文案タブで **初稿を一括生成**（生成前チェックあり）→ 記載ルールチェックへ
3. **記載ルールチェック**タブで ○△× 確認（初稿生成時に自動実行）→ **承認を申請する**
4. 部長 → 支社長が各アカウントで **承認**タブから承認
5. 担当者で **承認**タブ **「提出版 PDF を出力」**

※ **採点基準マスタ UI は廃止**。チェックは **記載ルール9項目**（`lib/proposal/guideline-rules.ts`）のハイブリッド判定。

### DB 案件の開き方（UUID は画面に出ない）

- 案件一覧 http://localhost:3000/proposal で **工事名の行をクリック**
- 一覧に出ている案件はすべて DB 案件（例: テスト地質調査、A地区地質調査業務）
- UUID は URL バーにのみ表示（例: `/cases/04c8f8ca-...`）

### 適合チェックを試すとき

- 採点項目あり → **採点基準マスタを適用**（仮: 地質調査（標準・仮））後に確定
- 採点項目 **0 件** でも確定→初稿→再取込→適合チェック→承認申請まで可能（スキップ扱いの ○1 件が付く）
- 地質調査（標準・仮）の想定結果: 調査方針・調査方法=○、品質管理・安全管理=×（自動生成 Word に未記載のため）

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
| チェックリスト確定 | DB 保存済み | 採点基準マスタの DB 化・正式基準の登録 |
| 文案・Word | Storage に実 .docx 保存 + DL | 人手編集後の再取込（将来） |
| 適合チェック | Word 本文照合（本実装） | — |
| 承認フロー | DB 保存済み・通し確認 OK | — |
| PDF 出力 | Storage 実 PDF + DL 確認 OK | — |
| 公開 | Vercel 通し確認 OK | 最新 `9077f9f`（JST 履歴表示） |
| パイロット | 手順書・1 人通し確認 OK | 関係者パイロット（日程未定） |

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

【完了済み（〜2026-07-02）】
- Phase 1〜4: 認証・Word/PDF・承認フロー・履歴（公開サイト通し確認 OK）
- Phase 5: AI 文案生成（Claude API）、様式－１０流し込み、生成前チェック
- 記載ルールチェック: 仮採点基準を廃止し固定9ルール＋Claude（`43f4b25`・公開確認 OK）
- UI: 案件一覧タブ統合・「続きから」カード削除、ヘッダーアプリ名をロゴリンク化（`8c4afbf` push 済み）
- 図解: `docs/proposal-overview-explainer.html` 作成、キャプチャ匿名化、Surge 公開
  → https://diagram-proposal-overview.surge.sh
- 設計正本: `docs/proposal-ai-inputs.md`

【現行 UI の前提（重要）】
- チェックリストタブ: 入札図書 PDF ＋ 提案の軸の確定（採点基準マスタ UI は無し）
- 記載ルールチェックタブ: 旧「適合チェック」の代替（採点項目マスタではない）
- push 先: `git push github main`（co24jiko-sketch/proposal-support → Vercel）

【未コミット（ローカルのみ）】
- ~~図解・キャプチャ・スクリプト・package.json~~ → 2026-07-08 コミット済み
- `public/docs` — docs へのジャンクション（**コミットしない**。ローカル専用。図解確認は `npm run docs:overview:open` または Surge）

【パイロット用アカウント】
- 部長: manager@pilot.local / PilotManager2026
- 支社長: director@pilot.local / PilotDirector2026
- 担当者: Supabase で個別作成（assignee ロール）

【次の作業（優先度順）】
1. 未コミット分の push（希望があれば）
2. `proposal-pilot-guide.md` 等のドキュメントを現行 UI に合わせて更新
3. Step 8〜9: 過去実績欄・留意事項テキスト欄
4. 任意: Word 手修正再取込、本番 Supabase、関係者パイロット

【進め方の希望】
手順は1つずつ指示して、できたか確認してから次に進めてください。
npm run dev が止まっていたら起動してください（3000 固まり時は古いプロセスを止めてから）。
図解の確認: https://diagram-proposal-overview.surge.sh
```

## 作業終了時メモ

### 2026-07-02（UI整理・機能全体図解・公開）

- **記載ルールチェック** — `43f4b25` push、公開サイトで文案生成・チェック・Word DL 成功確認済み
- **Claude API** — Sonnet 5 対応（temperature 削除、JSON schema）、`ANTHROPIC_API_KEY` 設定済み
- **UI 整理（`8c4afbf` push 済み）**
  - `AppHeader`: アプリ名をロゴリンク化、ナビと Separator で区別
  - `CaseListPage`: 「自分の案件/すべて」「承認待ち」タブ廃止→1表に統合
  - `ResumeCaseCard.tsx` 削除
- **機能全体図解（ローカル・Surge 公開済み、未 git push）**
  - `docs/proposal-overview-explainer.html` — 新入社員向けに再構成（2026-07-03）
    - 保持できるデータ（基本情報・進行・ファイル・履歴）
    - 3つの保存場所（DB / Storage / GitHub）と操作→保存先の対応
    - 画面キャプチャ・設計の意識・今後の拡張
  - `scripts/capture-proposal-screenshots.mjs` — キャプチャ時に件名等を匿名化
  - 公開: https://diagram-proposal-overview.surge.sh
  - ローカル: `npm run dev` → `/docs/proposal-overview-explainer.html`
- **次回最初** — 未コミット分の整理・push

### 2026-06-20（作業終了・Phase 1〜4 完了）

- **Phase 3 push** — `76c4317` → Vercel 公開確認 OK
- **Phase 4** — 版履歴・操作ログ（`add_case_history.sql` 実行済み）、ローカル + 公開確認 OK
- **ビルド修正** — `cd8915d`（rowToProposalCase の TypeScript エラー）
- **パイロット準備** — `proposal-pilot-guide.md`、図解 HTML 更新、`067a61d` push
- **1 人通し確認** — 公開サイトで全フロー OK
- **JST 表示** — `9077f9f` push、公開サイト確認 OK
- **PDF アップロード** — 4MB 以下（Vercel 制限）。4.1MB で成功確認
- **後回し** — 関係者パイロット、採点基準正式登録
- **次回** — 上記「次回やること」参照

- **Phase 3-1** — 入札図書 PDF アップロード（Storage + DB、チェックリストタブ）
- **Phase 3-2** — 採点基準マスタ選択（仮マスタ 2 件、PDF 抽出は見送り）
- **Phase 3-3** — 適合チェック本実装（mammoth + キーワード照合、ローカル確認 OK）
- **注意** — 新規案件 Step 2 の「アップロード」は未実装。PDF は案件詳細のチェックリストタブから
- **未 push** — Phase 3 コードはローカルのみ。次回 `git push github main` 推奨
- **次回:** push & Redeploy → Phase 4

- **Vercel PDF** — フォント同梱 + 署名付き URL DL（`46c4b6a`）→ 公開サイトで PDF 出力 OK
- **PDF ファイル名** — 日本語文字化け修正（Blob DL、`e99d17f`）→ `案件名-submission.pdf` OK
- **Phase 2 完了** — Word/PDF 実ファイル、ローカル + Vercel 通し確認済み
- **次回:** Phase 3（適合チェック本実装）または Phase 4（監査ログ）

### 2026-06-20（Phase 2 Word/PDF 実ファイル生成）

- **Word** — `docx` で `.docx` 生成（ローカル確認: 8.92 KB、入力内容一致）
- **PDF** — `pdf-lib` + `@fontpkg/ip-aex-gothic`（ローカル確認: 4.0 MB、日本語表示 OK）
- **UX** — 採点項目 0 件でも適合チェック→承認申請可能に修正
- **承認フロー** — 新規案件で部長→支社長承認→PDF 出力まで通し確認 OK
- **Supabase** — 支社長ユーザー再作成 + ロール SQL（password recovery rate limit 回避）
- **次:** `git push github main` → Vercel Redeploy → 公開サイト確認

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
