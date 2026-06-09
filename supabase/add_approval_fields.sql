-- 承認フローを DB に保存するためのカラム追加
-- Supabase ダッシュボード → SQL Editor → 新しいタブ → 貼り付け → Run

alter table public.proposal_cases
add column if not exists approval_request_reason text,
add column if not exists return_reason text,
add column if not exists manager_approved_at timestamptz,
add column if not exists manager_approver_name text,
add column if not exists manager_approval_comment text,
add column if not exists director_approved_at timestamptz,
add column if not exists director_approver_name text,
add column if not exists director_approval_comment text;
