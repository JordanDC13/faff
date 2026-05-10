-- =============================================================================
-- Faff — complete database schema
-- Paste the entire contents of this file into the Supabase SQL Editor and run.
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS and DO blocks for policies.
-- =============================================================================


-- ── Helper: idempotent policy creation ───────────────────────────────────────
-- Wraps every CREATE POLICY in a DO block so re-running the script never
-- fails with "policy already exists".

-- =============================================================================
-- 1. profiles
--    One row per auth user, created automatically on signup via trigger.
--    Stores display name and email cache — no sensitive data.
-- =============================================================================

create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$ begin
  create policy "profiles: users read own row"
    on public.profiles for select
    using (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "profiles: users update own row"
    on public.profiles for update
    using (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- Auto-insert a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop and recreate trigger so re-running the script is safe
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =============================================================================
-- 2. swipe_events
--    Every left/right swipe the user makes, plus optional feedback reason
--    recorded after a left swipe.  id is client-generated (crypto.randomUUID)
--    so the client can later PATCH feedback_reason onto the same row.
-- =============================================================================

create table if not exists public.swipe_events (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references auth.users(id) on delete cascade,
  activity_id          text        not null,
  direction            text        not null check (direction in ('left', 'right')),
  energy_level_at_time int         check (energy_level_at_time between 1 and 5),
  budget_at_time       int,
  time_of_day          int         check (time_of_day between 0 and 23),
  feedback_reason      text        check (feedback_reason in (
                                     'not_my_thing',
                                     'wrong_energy',
                                     'too_far',
                                     'too_expensive',
                                     'never_show'
                                   )),
  created_at           timestamptz not null default now()
);

create index if not exists swipe_events_user_id_idx on public.swipe_events (user_id);
create index if not exists swipe_events_created_at_idx on public.swipe_events (created_at desc);

alter table public.swipe_events enable row level security;

do $$ begin
  create policy "swipe_events: users insert own rows"
    on public.swipe_events for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "swipe_events: users read own rows"
    on public.swipe_events for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "swipe_events: users update own rows"
    on public.swipe_events for update
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;


-- =============================================================================
-- 3. saved_activities
--    Activities the user swiped right on (or tapped "Let's do this").
--    completed_at is set when the user marks an activity as done (Phase 3).
-- =============================================================================

create table if not exists public.saved_activities (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  activity_id  text        not null,
  saved_at     timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, activity_id)
);

create index if not exists saved_activities_user_id_idx on public.saved_activities (user_id);

alter table public.saved_activities enable row level security;

do $$ begin
  create policy "saved_activities: users manage own rows"
    on public.saved_activities for all
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;


-- =============================================================================
-- 4. user_preference_profiles
--    One row per user.  settings_json holds the full Settings blob written by
--    useSettings.js so we don't need individual columns for every preference.
--    The scalar columns (preferred_budget_avg, streak_count, etc.) are kept for
--    future analytics / personalisation queries without unpacking JSON.
-- =============================================================================

create table if not exists public.user_preference_profiles (
  user_id                    uuid        primary key references auth.users(id) on delete cascade,
  preferred_energy_avg       float,
  preferred_budget_avg       float,
  favourite_categories       text[],
  favourite_tags             text[],
  streak_count               int         not null default 0,
  total_activities_completed int         not null default 0,
  settings_json              jsonb       not null default '{}',
  updated_at                 timestamptz not null default now()
);

alter table public.user_preference_profiles enable row level security;

do $$ begin
  create policy "user_preference_profiles: users manage own row"
    on public.user_preference_profiles for all
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
