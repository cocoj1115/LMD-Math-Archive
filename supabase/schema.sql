-- Run this once in Supabase → SQL Editor → New query → Run.
-- Prototype-testing setup: no logins, anyone with the anon key can read/write.
-- Data is separated by class_code. Do NOT reuse this setup for real student data at scale.

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  topic text not null,              -- e.g. 'law-of-cosines'
  title text not null,
  kind text not null default 'Board notes',
  lesson text,
  lines jsonb not null default '[]', -- corrected lines [{type, value}]
  original_lines jsonb,              -- AI transcription before teacher edits (version history)
  diagram text,
  photo_url text,
  student_work jsonb not null default '[]', -- shared student attempts [{post_id, photo_url, caption, author}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  topic text not null,
  note_id text,                      -- which class note the question is about (optional)
  title text not null,
  body text not null default '',
  photo_url text,                    -- photo of the student's paper attempt (optional)
  photo_lines jsonb,                 -- transcription of that photo
  voice boolean not null default false,
  author_name text not null,
  author_id text not null,
  role text not null,                -- 'student' | 'teacher'
  share_status text,                 -- null | 'asked' | 'yes' | 'no'
  created_at timestamptz not null default now()
);

create table if not exists replies (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  post_id uuid not null references posts(id) on delete cascade,
  body text not null,
  author_name text not null,
  author_id text not null,
  role text not null,
  created_at timestamptz not null default now()
);

alter table notes enable row level security;
alter table posts enable row level security;
alter table replies enable row level security;

drop policy if exists "prototype all" on notes;
drop policy if exists "prototype all" on posts;
drop policy if exists "prototype all" on replies;
create policy "prototype all" on notes for all using (true) with check (true);
create policy "prototype all" on posts for all using (true) with check (true);
create policy "prototype all" on replies for all using (true) with check (true);

-- Live updates between the teacher and student computers
alter publication supabase_realtime add table notes, posts, replies;

-- Photo storage (board photos, student work photos)
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
on conflict (id) do nothing;
drop policy if exists "prototype uploads read" on storage.objects;
drop policy if exists "prototype uploads write" on storage.objects;
create policy "prototype uploads read" on storage.objects for select using (bucket_id = 'uploads');
create policy "prototype uploads write" on storage.objects for insert with check (bucket_id = 'uploads');
