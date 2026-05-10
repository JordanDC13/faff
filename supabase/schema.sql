-- Faff — Supabase schema
-- Run this in the Supabase SQL editor to set up the database

-- ── profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── swipe_events ──────────────────────────────────────────────────────────────
create table if not exists public.swipe_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_id text not null,
  direction text check (direction in ('left', 'right')) not null,
  energy_level_at_time int check (energy_level_at_time between 1 and 5),
  budget_at_time int,
  time_of_day int check (time_of_day between 0 and 23),
  feedback_reason text check (feedback_reason in (
    'not_my_thing', 'wrong_energy', 'too_far', 'too_expensive', 'never_show'
  )),
  created_at timestamptz default now()
);

alter table public.swipe_events enable row level security;

create policy "Users can insert own swipe events"
  on public.swipe_events for insert
  with check (auth.uid() = user_id);

create policy "Users can read own swipe events"
  on public.swipe_events for select
  using (auth.uid() = user_id);

-- ── saved_activities ──────────────────────────────────────────────────────────
create table if not exists public.saved_activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_id text not null,
  saved_at timestamptz default now(),
  completed_at timestamptz,
  unique(user_id, activity_id)
);

alter table public.saved_activities enable row level security;

create policy "Users can manage own saved activities"
  on public.saved_activities for all
  using (auth.uid() = user_id);

-- ── user_preference_profiles ──────────────────────────────────────────────────
create table if not exists public.user_preference_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  preferred_energy_avg float,
  preferred_budget_avg float,
  favourite_categories text[],
  favourite_tags text[],
  streak_count int default 0,
  total_activities_completed int default 0,
  settings_json jsonb default '{}',
  updated_at timestamptz default now()
);

-- Allow updating feedback_reason on own swipe events
create policy "Users can update own swipe events"
  on public.swipe_events for update
  using (auth.uid() = user_id);

alter table public.user_preference_profiles enable row level security;

create policy "Users can manage own preference profile"
  on public.user_preference_profiles for all
  using (auth.uid() = user_id);
