-- 入札図書 PDF の Storage パス・表示名を DB に保存するためのカラム追加
-- Supabase ダッシュボード → SQL Editor → New query → 貼り付け → Run
-- ※ add_storage.sql 実行済みであること

alter table public.proposal_cases
add column if not exists bid_document_name text,
add column if not exists bid_file_path text;
