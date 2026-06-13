-- 採点項目・適合チェック結果・文案生成状態を DB に保存するためのカラム追加
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run

alter table public.proposal_cases
add column if not exists checklist_items jsonb not null default '[]'::jsonb,
add column if not exists compliance_items jsonb not null default '[]'::jsonb,
add column if not exists generated_sections jsonb not null default '{"summary":false,"focusPoints":false,"detail":false,"effects":false}'::jsonb,
add column if not exists current_word_version text;
