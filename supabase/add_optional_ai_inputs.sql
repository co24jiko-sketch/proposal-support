-- Step 8〜9: 過去実績・関連業務メモ・留意事項テキスト
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run

alter table public.proposal_cases
add column if not exists past_performance_notes text not null default '',
add column if not exists related_work_notes text not null default '',
add column if not exists client_notes_text text not null default '';

comment on column public.proposal_cases.past_performance_notes is '過去実績（類似案件・テクリス番号等）。効果欄の根拠引用用';
comment on column public.proposal_cases.related_work_notes is '関連業務メモ。連携・整合の材料';
comment on column public.proposal_cases.client_notes_text is '発注者明示の留意事項テキスト。入札図書 PDF の代替可';
