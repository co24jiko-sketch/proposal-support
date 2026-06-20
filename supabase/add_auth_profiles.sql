-- Phase 1: 認証・プロフィール・RLS（本番 / パイロット向け）
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run
-- 前提: proposal_cases テーブル・proposal-files バケットが存在すること

-- 1) ユーザープロフィール（auth.users と 1:1）
create table if not exists public.proposal_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('assignee', 'manager', 'director', 'admin')),
  org text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists proposal_profiles_updated_at on public.proposal_profiles;

create trigger proposal_profiles_updated_at
before update on public.proposal_profiles
for each row
execute function public.set_updated_at();

-- 新規 Auth ユーザー作成時に assignee プロフィールを自動作成
create or replace function public.handle_new_proposal_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.proposal_profiles (id, display_name, role, org)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'assignee',
    coalesce(new.raw_user_meta_data ->> 'org', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_proposal on auth.users;

create trigger on_auth_user_created_proposal
after insert on auth.users
for each row
execute function public.handle_new_proposal_user();

-- 2) 案件に担当者 ID を紐付け
alter table public.proposal_cases
add column if not exists assignee_id uuid references auth.users(id);

-- 3) ロール取得ヘルパー
create or replace function public.current_proposal_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.proposal_profiles
  where id = auth.uid()
$$;

-- 4) proposal_profiles RLS
alter table public.proposal_profiles enable row level security;

drop policy if exists "proposal_profiles_select_own" on public.proposal_profiles;
drop policy if exists "proposal_profiles_update_admin" on public.proposal_profiles;

create policy "proposal_profiles_select_own"
on public.proposal_profiles
for select
using (auth.uid() = id);

create policy "proposal_profiles_update_admin"
on public.proposal_profiles
for update
using (public.current_proposal_role() = 'admin')
with check (public.current_proposal_role() = 'admin');

-- 5) proposal_cases RLS（dev 全開放ポリシーを置き換え）
alter table public.proposal_cases enable row level security;

drop policy if exists "proposal_cases_dev_all" on public.proposal_cases;
drop policy if exists "proposal_cases_select_authenticated" on public.proposal_cases;
drop policy if exists "proposal_cases_insert_authenticated" on public.proposal_cases;
drop policy if exists "proposal_cases_update_authenticated" on public.proposal_cases;

create policy "proposal_cases_select_authenticated"
on public.proposal_cases
for select
using (
  auth.uid() is not null
  and public.current_proposal_role() is not null
);

create policy "proposal_cases_insert_authenticated"
on public.proposal_cases
for insert
with check (
  auth.uid() is not null
  and public.current_proposal_role() in ('assignee', 'manager', 'director', 'admin')
  and assignee_id = auth.uid()
);

create policy "proposal_cases_update_authenticated"
on public.proposal_cases
for update
using (
  auth.uid() is not null
  and public.current_proposal_role() is not null
  and (
    public.current_proposal_role() = 'admin'
    or assignee_id = auth.uid()
    or (
      public.current_proposal_role() = 'manager'
      and status = 'pending_manager'
    )
    or (
      public.current_proposal_role() = 'director'
      and status = 'pending_director'
    )
  )
)
with check (
  auth.uid() is not null
  and public.current_proposal_role() is not null
);

-- 6) Storage を非公開化 + 認証ユーザーのみアクセス
update storage.buckets
set public = false
where id = 'proposal-files';

drop policy if exists "proposal_files_dev_all" on storage.objects;
drop policy if exists "proposal_files_select_authenticated" on storage.objects;
drop policy if exists "proposal_files_insert_authenticated" on storage.objects;
drop policy if exists "proposal_files_update_authenticated" on storage.objects;

create policy "proposal_files_select_authenticated"
on storage.objects
for select
using (
  bucket_id = 'proposal-files'
  and auth.uid() is not null
  and public.current_proposal_role() is not null
);

create policy "proposal_files_insert_authenticated"
on storage.objects
for insert
with check (
  bucket_id = 'proposal-files'
  and auth.uid() is not null
  and public.current_proposal_role() is not null
);

create policy "proposal_files_update_authenticated"
on storage.objects
for update
using (
  bucket_id = 'proposal-files'
  and auth.uid() is not null
  and public.current_proposal_role() is not null
)
with check (
  bucket_id = 'proposal-files'
  and auth.uid() is not null
  and public.current_proposal_role() is not null
);

-- 7) 既存 Auth ユーザー分のプロフィール作成（手動実行用テンプレート）
-- insert into public.proposal_profiles (id, display_name, role, org)
-- select id, split_part(email, '@', 1), 'assignee', '東京支社'
-- from auth.users
-- where id not in (select id from public.proposal_profiles);

-- 8) ロール変更例（パイロット用・UUID は Dashboard → Authentication → Users で確認）
-- update public.proposal_profiles set role = 'manager', display_name = '部長 高橋' where id = '...';
-- update public.proposal_profiles set role = 'director', display_name = '支社長 伊藤' where id = '...';
