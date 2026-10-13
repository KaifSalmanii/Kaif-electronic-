-- Run this once in Supabase → SQL Editor.
-- Each table stores one row per item; the app data lives in `payload` (jsonb),
-- so you never need to change the schema when you add fields.

create table if not exists kf_transactions (
  id text primary key,
  owner text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at bigint not null,
  deleted boolean not null default false
);
create table if not exists kf_reminders (
  id text primary key,
  owner text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at bigint not null,
  deleted boolean not null default false
);
create table if not exists kf_tasks (
  id text primary key,
  owner text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at bigint not null,
  deleted boolean not null default false
);

create index if not exists kf_transactions_owner_idx on kf_transactions (owner, updated_at);
create index if not exists kf_reminders_owner_idx on kf_reminders (owner, updated_at);
create index if not exists kf_tasks_owner_idx on kf_tasks (owner, updated_at);

-- Row Level Security
alter table kf_transactions enable row level security;
alter table kf_reminders enable row level security;
alter table kf_tasks enable row level security;

-- Personal-use policy: the anon key may read/write rows.
-- Data is separated by the secret "sync code" (owner column), which only you know.
-- ⚠️ Anyone who has the anon key AND guesses a sync code could read that data.
-- For stronger privacy later, switch to Supabase Auth and use auth.uid() in policies.
drop policy if exists "kf_tx_anon" on kf_transactions;
drop policy if exists "kf_rem_anon" on kf_reminders;
drop policy if exists "kf_task_anon" on kf_tasks;
create policy "kf_tx_anon" on kf_transactions for all to anon using (true) with check (true);
create policy "kf_rem_anon" on kf_reminders for all to anon using (true) with check (true);
create policy "kf_task_anon" on kf_tasks for all to anon using (true) with check (true);
