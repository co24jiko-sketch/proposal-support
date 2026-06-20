-- Phase 4: 版履歴・操作ログ（監査ログ）
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run
-- 前提: add_auth_profiles.sql 実行済み（RLS・current_proposal_role）

-- 1) Word 版履歴
create table if not exists public.proposal_case_versions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.proposal_cases(id) on delete cascade,
  label text not null,
  action text not null,
  file_path text,
  created_by uuid not null references auth.users(id),
  created_by_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists proposal_case_versions_case_id_created_at
  on public.proposal_case_versions (case_id, created_at desc);

-- 2) 操作ログ（監査）
create table if not exists public.proposal_audit_log (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.proposal_cases(id) on delete cascade,
  action text not null,
  detail text,
  user_id uuid not null references auth.users(id),
  user_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists proposal_audit_log_case_id_created_at
  on public.proposal_audit_log (case_id, created_at desc);

-- 3) RLS
alter table public.proposal_case_versions enable row level security;
alter table public.proposal_audit_log enable row level security;

drop policy if exists "proposal_case_versions_select" on public.proposal_case_versions;
drop policy if exists "proposal_case_versions_insert" on public.proposal_case_versions;
drop policy if exists "proposal_audit_log_select" on public.proposal_audit_log;
drop policy if exists "proposal_audit_log_insert" on public.proposal_audit_log;

create policy "proposal_case_versions_select"
on public.proposal_case_versions
for select
using (
  auth.uid() is not null
  and public.current_proposal_role() is not null
);

create policy "proposal_case_versions_insert"
on public.proposal_case_versions
for insert
with check (
  auth.uid() is not null
  and public.current_proposal_role() is not null
  and created_by = auth.uid()
);

create policy "proposal_audit_log_select"
on public.proposal_audit_log
for select
using (
  auth.uid() is not null
  and public.current_proposal_role() is not null
);

create policy "proposal_audit_log_insert"
on public.proposal_audit_log
for insert
with check (
  auth.uid() is not null
  and public.current_proposal_role() is not null
  and user_id = auth.uid()
);
