-- Skema database undangan digital.
-- Jalankan sekali di Supabase → SQL Editor.
--
-- Nama tabel diberi awalan "undangan_" agar aman dipasang di project Supabase
-- yang sudah berisi tabel lain. Satu database bisa menampung banyak pasangan
-- (dibedakan lewat kolom wedding_slug).

create extension if not exists pgcrypto;

create table if not exists undangan_rsvp (
  id uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  guest_name text not null check (char_length(guest_name) between 1 and 50),
  attendance text not null check (attendance in ('hadir', 'tidak', 'ragu')),
  guest_count int not null default 1 check (guest_count between 0 and 5),
  created_at timestamptz not null default now()
);

create table if not exists undangan_wishes (
  id uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  guest_name text not null check (char_length(guest_name) between 1 and 50),
  message text not null check (char_length(message) between 1 and 500),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists undangan_rsvp_slug_created_idx on undangan_rsvp (wedding_slug, created_at desc);
create index if not exists undangan_wishes_slug_created_idx on undangan_wishes (wedding_slug, created_at desc);

-- Row Level Security: tanpa policy, anon key tidak bisa membaca/menulis apa pun.
-- Semua tulis dilakukan lewat API route dengan service role key (server-only).
alter table undangan_rsvp enable row level security;
alter table undangan_wishes enable row level security;

-- Publik hanya boleh membaca ucapan yang tidak disembunyikan.
-- Data RSVP sengaja tidak punya policy select → tidak bisa dibaca publik.
drop policy if exists "public read visible wishes" on undangan_wishes;
create policy "public read visible wishes" on undangan_wishes
  for select using (is_hidden = false);
