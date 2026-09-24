-- Mentor Notes schema.
-- Paste into Supabase → SQL Editor and run. Safe to run more than once.
--
-- Tables the Lovable app already has (mentors, mentorship_notes) are created only if
-- missing and are otherwise left alone, apart from two new optional columns on mentors.
-- New tables: key_notes (My Key Notes), trading_days + live_entries (Trading Desk).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Existing tables (created only in a fresh project)
-- ---------------------------------------------------------------------------

create table if not exists public.mentors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid default auth.uid() references auth.users(id) on delete cascade,
  name        text not null,
  color       text,
  created_at  timestamptz not null default now()
);

-- who runs the mentorship, and a short description
alter table public.mentors add column if not exists mentor text;
alter table public.mentors add column if not exists about  text;

create table if not exists public.mentorship_notes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid default auth.uid() references auth.users(id) on delete cascade,
  mentor_id     uuid references public.mentors(id) on delete set null,
  session_date  date not null default current_date,
  title         text not null,
  summary       text,
  key_notes     text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- Row-level security for those two, only when the table has no policies yet
-- (i.e. we just created it). An existing Lovable table keeps its own policies.
do $$
declare t text;
begin
  foreach t in array array['mentors', 'mentorship_notes'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t)
       and exists (select 1 from information_schema.columns
                   where table_schema = 'public' and table_name = t and column_name = 'user_id') then
      execute format('alter table public.%I enable row level security', t);
      execute format(
        'create policy "Own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. My Key Notes
-- ---------------------------------------------------------------------------

create table if not exists public.key_notes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text              text not null,
  mentor_id         uuid references public.mentors(id) on delete set null,
  -- set when the note was starred from a session's key points
  source_note_id    uuid references public.mentorship_notes(id) on delete set null,
  -- kept when the linked mentorship is deleted
  from_mentor_name  text,
  pinned            boolean not null default false,
  created_at        timestamptz not null default now()
);
create index if not exists key_notes_user_idx on public.key_notes (user_id, created_at desc);

alter table public.key_notes enable row level security;
drop policy if exists "Own key notes" on public.key_notes;
create policy "Own key notes" on public.key_notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Trading Desk
-- ---------------------------------------------------------------------------

create table if not exists public.trading_days (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day         date not null,
  -- levels are kept as typed text so half-typed input never corrupts a value
  pdh         text,
  vah         text,
  poc         text,
  val         text,
  pdl         text,
  open        text,
  m40         text check (m40 in ('above', 'inside', 'below')),
  m30         text check (m30 in ('above', 'inside', 'below')),
  day_type    text,
  notes       text,
  lesson      text,
  updated_at  timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.trading_days enable row level security;
drop policy if exists "Own trading days" on public.trading_days;
create policy "Own trading days" on public.trading_days
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.live_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day         date not null,
  ts          text not null,
  tag         text not null default 'read' check (tag in ('read', 'level', 'entry', 'exit', 'mistake')),
  text        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists live_entries_day_idx on public.live_entries (user_id, day);

alter table public.live_entries enable row level security;
drop policy if exists "Own live entries" on public.live_entries;
create policy "Own live entries" on public.live_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
