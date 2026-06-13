-- Supabase Storage（proposal-files）とファイルパス用カラム
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run
-- ※ add_case_detail_fields.sql の後に実行

insert into storage.buckets (id, name, public)
values ('proposal-files', 'proposal-files', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "proposal_files_dev_all" on storage.objects;

create policy "proposal_files_dev_all"
on storage.objects
for all
using (bucket_id = 'proposal-files')
with check (bucket_id = 'proposal-files');

alter table public.proposal_cases
add column if not exists word_file_path text,
add column if not exists pdf_file_path text;
