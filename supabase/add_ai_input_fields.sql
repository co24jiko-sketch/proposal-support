-- Phase 5 準備: 評価テーマ・提案の軸（仮／確定）
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run

alter table public.proposal_cases
add column if not exists evaluation_theme text not null default '',
add column if not exists proposal_axis_draft text not null default '',
add column if not exists proposal_axis_confirmed text,
add column if not exists proposal_axis_confirmed_at timestamptz;

comment on column public.proposal_cases.evaluation_theme is '評価テーマ（例: 品質確保）';
comment on column public.proposal_cases.proposal_axis_draft is '提案の軸（仮）。新規案件 Step 1 で入力';
comment on column public.proposal_cases.proposal_axis_confirmed is '提案の軸（確定）。入札図書確認後に設定（将来 UI）';
