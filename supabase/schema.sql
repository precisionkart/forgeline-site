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
  -- quote / job reference (also acts as the job number)
  quote_ref     text,
  -- when to chase next (used by the Delayed / Follow-up stages)
  follow_up_at  date,
  -- uploaded CAD/PDF file (stored in the cad-files bucket)
  file_url      text,
  file_name     text,
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

-- Auto-assign a sequential job number (FG-0001, FG-0002, …) to every lead on
-- insert — so website leads and dashboard leads all get numbered automatically.
create sequence if not exists public.leads_ref_seq start 1;

create or replace function public.set_lead_quote_ref()
returns trigger as $$
begin
  if new.quote_ref is null or new.quote_ref = '' then
    new.quote_ref := 'FG-' || lpad(nextval('public.leads_ref_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_lead_quote_ref on public.leads;
create trigger trg_lead_quote_ref
  before insert on public.leads
  for each row execute function public.set_lead_quote_ref();

-- Backfill any existing leads that don't have a number yet (oldest first).
do $$
declare r record;
begin
  for r in select id from public.leads where quote_ref is null or quote_ref = '' order by created_at asc loop
    update public.leads set quote_ref = 'FG-' || lpad(nextval('public.leads_ref_seq')::text, 4, '0') where id = r.id;
  end loop;
end $$;

-- Let the dashboard receive live inserts over Realtime.
alter publication supabase_realtime add table public.leads;


-- ============================================================
-- Orders (the delivery + payment side, managed in orders.html)
-- ============================================================
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  order_ref     text,                 -- order / job number (e.g. FG-0001)
  status        text not null default 'Quote',
  customer      text,
  company       text,
  email         text,
  phone         text,
  title         text,                 -- what the order is for
  value         numeric default 0,    -- total order value
  amount_paid   numeric default 0,    -- paid so far (balance = value - amount_paid)
  payment_terms text,                 -- e.g. "50% upfront, 50% on delivery", "Net 30"
  quote_url     text,
  quote_name    text,
  invoice_url   text,
  invoice_name  text,
  notes         text,
  lead_id       uuid                  -- optional link back to the originating lead
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Orders are internal only: every action requires a logged-in admin.
alter table public.orders enable row level security;

drop policy if exists "admins manage orders (select)" on public.orders;
create policy "admins manage orders (select)" on public.orders for select to authenticated using (true);
drop policy if exists "admins manage orders (insert)" on public.orders;
create policy "admins manage orders (insert)" on public.orders for insert to authenticated with check (true);
drop policy if exists "admins manage orders (update)" on public.orders;
create policy "admins manage orders (update)" on public.orders for update to authenticated using (true) with check (true);
drop policy if exists "admins manage orders (delete)" on public.orders;
create policy "admins manage orders (delete)" on public.orders for delete to authenticated using (true);

alter publication supabase_realtime add table public.orders;


-- ============================================================
-- File storage for uploaded CAD / PDF files
-- ============================================================
-- Create a public bucket named "cad-files".
insert into storage.buckets (id, name, public)
values ('cad-files', 'cad-files', true)
on conflict (id) do nothing;

-- The public website (anon) and logged-in admins may upload into this bucket.
-- Admins use it for saved quotes/invoices from the orders page.
drop policy if exists "public can upload cad files" on storage.objects;
create policy "public can upload cad files"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'cad-files');

-- Anyone with the (unguessable) link can download — required for the
-- Download button. Filenames are randomised so they can't be enumerated.
drop policy if exists "anyone can read cad files" on storage.objects;
create policy "anyone can read cad files"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'cad-files');
