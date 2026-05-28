-- ─────────────────────────────────────────────────────────────────────────────
-- Inferno — initial schema
-- Apply with: supabase db push   (or paste into the SQL editor)
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  country text,
  city text,
  avatar_url text,
  is_pro boolean not null default false,
  pro_until timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── elo ratings per format ──────────────────────────────────────────────────
create table if not exists public.elo_ratings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  format text not null,
  rating int not null default 1200,
  games_played int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, format)
);

-- ── matches ───────────────────────────────────────────────────────────────-
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  format text not null,
  mode text not null,
  p1_id uuid references public.profiles(id) on delete set null,
  p2_id uuid references public.profiles(id) on delete set null,
  bot_level text,
  status text not null default 'playing',
  winner int,
  moves jsonb not null default '[]'::jsonb,
  time_control jsonb,
  ranked boolean not null default false,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create index if not exists matches_player_idx on public.matches (p1_id, p2_id);

-- ── friendships ───────────────────────────────────────────────────────────-
create table if not exists public.friendships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

-- ── rooms (link / QR multiplayer) ───────────────────────────────────────────
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id uuid references public.profiles(id) on delete set null,
  guest_id uuid references public.profiles(id) on delete set null,
  format text not null,
  mode text not null,
  settings jsonb not null default '{}'::jsonb,
  status text not null default 'waiting',
  state jsonb,
  created_at timestamptz not null default now()
);

-- ── daily puzzles ───────────────────────────────────────────────────────────
create table if not exists public.puzzles (
  date date primary key,
  position jsonb not null,
  solution jsonb not null,
  difficulty text not null default 'medium',
  theme text
);

create table if not exists public.puzzle_attempts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  puzzle_date date not null references public.puzzles(date) on delete cascade,
  solved boolean not null default false,
  moves_taken int,
  shareable_grid text,
  attempted_at timestamptz not null default now(),
  primary key (user_id, puzzle_date)
);

-- ── coach reviews ───────────────────────────────────────────────────────────
create table if not exists public.coach_reviews (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  persona text not null default 'analyst',
  content jsonb not null,
  created_at timestamptz not null default now()
);

-- ── entitlements (skins + pro grants) ───────────────────────────────────────
create table if not exists public.entitlements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  sku text not null,
  source text,
  granted_at timestamptz not null default now(),
  primary key (user_id, sku)
);

-- ── subscriptions ───────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  plan text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- ── skins catalog ───────────────────────────────────────────────────────────
create table if not exists public.skins (
  sku text primary key,
  kind text not null,
  name text not null,
  description text,
  price_cents int not null,
  asset jsonb,
  season text,
  created_at timestamptz not null default now()
);

-- ── battle pass ─────────────────────────────────────────────────────────────
create table if not exists public.battle_passes (
  season text primary key,
  title text,
  starts_at timestamptz,
  ends_at timestamptz,
  tiers jsonb
);

create table if not exists public.battle_pass_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  season text not null references public.battle_passes(season) on delete cascade,
  xp int not null default 0,
  tier int not null default 0,
  has_premium boolean not null default false,
  claimed jsonb not null default '[]'::jsonb,
  primary key (user_id, season)
);

-- ── tournaments ─────────────────────────────────────────────────────────────
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text,
  kind text not null default 'free',
  format text,
  scheduled_at timestamptz,
  status text not null default 'scheduled',
  bracket jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tournament_entries (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  seed int,
  eliminated_at timestamptz,
  placement int,
  primary key (tournament_id, user_id)
);

-- ── ELO update RPC (server-side, atomic) ────────────────────────────────────
create or replace function public.apply_elo(
  p_winner uuid, p_loser uuid, p_format text
) returns void language plpgsql security definer set search_path = public as $$
declare
  w_rating int; l_rating int; w_exp numeric; l_exp numeric;
begin
  insert into public.elo_ratings(user_id, format) values (p_winner, p_format) on conflict do nothing;
  insert into public.elo_ratings(user_id, format) values (p_loser, p_format) on conflict do nothing;
  select rating into w_rating from public.elo_ratings where user_id = p_winner and format = p_format;
  select rating into l_rating from public.elo_ratings where user_id = p_loser and format = p_format;
  w_exp := 1.0 / (1.0 + power(10, (l_rating - w_rating)/400.0));
  l_exp := 1.0 / (1.0 + power(10, (w_rating - l_rating)/400.0));
  update public.elo_ratings
    set rating = rating + round(32 * (1 - w_exp)), games_played = games_played + 1, wins = wins + 1, updated_at = now()
    where user_id = p_winner and format = p_format;
  update public.elo_ratings
    set rating = rating + round(32 * (0 - l_exp)), games_played = games_played + 1, losses = losses + 1, updated_at = now()
    where user_id = p_loser and format = p_format;
end;
$$;

-- ── leaderboard view ────────────────────────────────────────────────────────
create or replace view public.leaderboard as
  select p.id, p.display_name, p.country, p.city, e.format, e.rating, e.games_played, e.wins
  from public.profiles p
  join public.elo_ratings e on e.user_id = p.id;

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.elo_ratings enable row level security;
alter table public.matches enable row level security;
alter table public.friendships enable row level security;
alter table public.rooms enable row level security;
alter table public.puzzles enable row level security;
alter table public.puzzle_attempts enable row level security;
alter table public.coach_reviews enable row level security;
alter table public.entitlements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.skins enable row level security;
alter table public.battle_passes enable row level security;
alter table public.battle_pass_progress enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_entries enable row level security;

create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

create policy "elo public read" on public.elo_ratings for select using (true);

create policy "matches read own or finished" on public.matches for select
  using (status = 'won' or status = 'draw' or auth.uid() = p1_id or auth.uid() = p2_id);
create policy "matches insert own" on public.matches for insert with check (auth.uid() = p1_id or auth.uid() = p2_id);
create policy "matches update own" on public.matches for update using (auth.uid() = p1_id or auth.uid() = p2_id);

create policy "friendships read own" on public.friendships for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "friendships write own" on public.friendships for insert with check (auth.uid() = user_id);
create policy "friendships update own" on public.friendships for update using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "friendships delete own" on public.friendships for delete using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "rooms read all" on public.rooms for select using (true);
create policy "rooms insert own" on public.rooms for insert with check (auth.uid() = host_id or host_id is null);
create policy "rooms update participant" on public.rooms for update using (auth.uid() = host_id or auth.uid() = guest_id or host_id is null);

create policy "puzzles public read" on public.puzzles for select using (true);

create policy "attempts own" on public.puzzle_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "coach own" on public.coach_reviews for select using (auth.uid() = user_id);
create policy "coach insert own" on public.coach_reviews for insert with check (auth.uid() = user_id);

create policy "entitlements own" on public.entitlements for select using (auth.uid() = user_id);

create policy "subscriptions own" on public.subscriptions for select using (auth.uid() = user_id);

create policy "skins public read" on public.skins for select using (true);
create policy "battle_passes public read" on public.battle_passes for select using (true);
create policy "bp progress own" on public.battle_pass_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tournaments public read" on public.tournaments for select using (true);
create policy "tournament entries read all" on public.tournament_entries for select using (true);
create policy "tournament entries insert own" on public.tournament_entries for insert with check (auth.uid() = user_id);

-- ── Realtime ────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.matches;
