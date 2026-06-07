# 技術提案書サポート — 次回再開用メモ

最終更新: 2026-06-07

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
| 5 | Vercel に公開 | 未着手 |

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
- `lib/proposal/case-repository.ts` — DB 読み書き
- `lib/proposal/map-case-row.ts` — DB行 → ProposalCase 変換
- `app/api/proposal/cases/route.ts` — GET一覧 / POST作成
- `components/proposal/NewCaseWizard.tsx` — フォーム入力→API保存
- `components/proposal/CaseListPage.tsx` — API から一覧取得

## 次回やること（優先度順）

1. **Step 5: Vercel 公開**（GitHub push → Vercel → 環境変数設定）
2. ~~ブラウザでの最終確認~~ ✅ 完了
4. 以降: チェックリスト確定・承認などの状態遷移を DB に保存
5. PDF / Word 生成、参照パネル、テスト、図解更新

## 再開手順（自分で始める場合）

```powershell
cd C:\Users\haram\src\workspace-ui-kit
npm run dev
```

1. http://localhost:3000/proposal が開くか確認
2. エラーが出たら `.env.local` があるか確認（`.env.local.example` ではない）
3. 上記 Step 3 の動作確認から再開

## Cursor で再開するときの依頼例（コピペ用）

```
C:\Users\haram\src\workspace-ui-kit\docs\proposal-RESUME.md を読んで、
技術提案書サポートの続きを進めてください。
Step 3（新規案件の保存・一覧表示・リロード確認）からお願いします。
npm run dev も起動してください。
```
