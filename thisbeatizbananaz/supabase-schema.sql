-- ================================================
-- THISBEATIZBANANAZ — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- BEATS TABLE
create table if not exists beats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  bpm integer,
  key text,
  tags text[] default '{}',
  section text not null check (section in ('beats_for_sale','free','in_the_lab','produced_by')),
  license_type text check (license_type in ('mp3_lease','mp3_wav_lease','free')),
  mp3_price numeric(10,2) not null default 0,
  wav_price numeric(10,2) not null default 0,
  mp3_url text not null,
  wav_url text,
  cover_url text,
  purchase_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- BEAT TAPES TABLE
create table if not exists beat_tapes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  price numeric(10,2) not null default 0,
  is_free boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- BEAT TAPE TRACKS (junction)
create table if not exists beat_tape_tracks (
  id uuid primary key default gen_random_uuid(),
  tape_id uuid references beat_tapes(id) on delete cascade,
  beat_id uuid references beats(id) on delete cascade,
  order_index integer not null default 0,
  unique(tape_id, beat_id)
);

-- PURCHASES TABLE
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  beat_id uuid references beats(id) on delete set null,
  beattape_id uuid references beat_tapes(id) on delete set null,
  buyer_email text,
  license_type text not null,
  amount_paid numeric(10,2) not null,
  stripe_session_id text unique not null,
  download_token uuid,
  token_expires_at timestamptz,
  notified_owner boolean not null default false,
  created_at timestamptz not null default now()
);

-- Function to increment purchase count
create or replace function increment_purchase_count(beat_id uuid)
returns void as $$
  update beats set purchase_count = purchase_count + 1 where id = beat_id;
$$ language sql;

-- ================================================
-- RLS POLICIES (public read, no public write)
-- ================================================

alter table beats enable row level security;
alter table beat_tapes enable row level security;
alter table beat_tape_tracks enable row level security;
alter table purchases enable row level security;

-- Public can read active beats
create policy "Public read beats" on beats for select using (is_active = true);
create policy "Public read tapes" on beat_tapes for select using (is_active = true);
create policy "Public read tape tracks" on beat_tape_tracks for select using (true);

-- Purchases: only service role can write (via API routes)
-- No public insert on purchases — handled server-side via webhook

-- ================================================
-- STORAGE BUCKETS
-- Run these or create manually in Supabase dashboard:
-- Storage > New bucket
-- ================================================

-- Bucket: beats (public) — stores mp3 and wav files
-- Bucket: covers (public) — stores cover art images

-- Create them in dashboard or via:
-- insert into storage.buckets (id, name, public) values ('beats', 'beats', true);
-- insert into storage.buckets (id, name, public) values ('covers', 'covers', true);

-- Storage policies (run after creating buckets):
create policy "Public read beats storage"
  on storage.objects for select
  using (bucket_id = 'beats');

create policy "Public read covers storage"
  on storage.objects for select
  using (bucket_id = 'covers');
