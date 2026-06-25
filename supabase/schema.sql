-- Forgeline lead database
-- Run this once in your Supabase project: SQL Editor → paste → Run.

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text not null default 'New',
  -- from the website form
  name          text,
  email         text,
  phone         text,
  company       text,
  process       text,
  qty           text,
  notes         text,
  -- your team's private working notes (not collected from the customer)
  internal_notes text,
  -- attribution / where the lead came from
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  gclid         text,
  fbclid        text,
  referrer      text,
  page_url      text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- Row Level Security: lock the table down, then grant exactly what we need.
alter table public.leads enable row level security;

-- The public website (anon key) may ONLY insert new leads. It cannot read,
-- update or delete anything — so exposing the anon key in the browser is safe.
drop policy if exists "public can insert leads" on public.leads;
create policy "public can insert leads"
  on public.leads for insert
  to anon
  with check (true);

-- Logged-in admins (you) can read, update and delete.
drop policy if exists "admins can read leads" on public.leads;
create policy "admins can read leads"
  on public.leads for select
  to authenticated
  using (true);

drop policy if exists "admins can update leads" on public.leads;
create policy "admins can update leads"
  on public.leads for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "admins can delete leads" on public.leads;
create policy "admins can delete leads"
  on public.leads for delete
  to authenticated
  using (true);

-- Let the dashboard receive live inserts over Realtime.
alter publication supabase_realtime add table public.leads;
