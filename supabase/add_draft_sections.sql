-- AI 文案生成結果（4欄テキスト）を保存
-- Supabase SQL Editor で実行

alter table proposal_cases
add column if not exists draft_sections jsonb;

comment on column proposal_cases.draft_sections is
  'AI 生成文案: summary, focusPoints, detail, effects, needsTechnicalReview, generatedAt';
