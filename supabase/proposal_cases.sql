-- Step 1 で決めた設計どおりのテーブル
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run

create table if not exists public.proposal_cases (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  client text not null,
  location text not null default '',
  schedule text not null default '',
  survey_purpose text not null default '',
  site_known_info text not null default '',
  survey_plan_outline text not null default '',
  assignee_name text not null default '山田 太郎',
  status text not null default 'draft',
  checklist_confirmed boolean not null default false,
  approval_request_reason text,
  return_reason text,
  manager_approved_at timestamptz,
  manager_approver_name text,
  manager_approval_comment text,
  director_approved_at timestamptz,
  director_approver_name text,
  director_approval_comment text,
  form_type text not null default '様式－１０',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 更新日時を自動更新
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists proposal_cases_updated_at on public.proposal_cases;

create trigger proposal_cases_updated_at
before update on public.proposal_cases
for each row
execute function public.set_updated_at();

-- 学習用: 誰でも読み書きできるポリシー（本番では見直す）
alter table public.proposal_cases enable row level security;

drop policy if exists "proposal_cases_dev_all" on public.proposal_cases;

create policy "proposal_cases_dev_all"
on public.proposal_cases
for all
using (true)
with check (true);
