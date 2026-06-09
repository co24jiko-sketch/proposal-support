-- チェックリスト確定を DB に保存するためのカラム追加
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run

alter table public.proposal_cases
add column if not exists checklist_confirmed boolean not null default false;

-- 既に ready_to_generate 以降のステータスなら確定済みに揃える（任意）
update public.proposal_cases
set checklist_confirmed = true
where status in ('ready_to_generate', 'editing', 'pending_manager', 'pending_director', 'approved', 'returned')
  and checklist_confirmed = false;
