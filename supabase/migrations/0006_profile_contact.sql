-- Phase 4 — profile_contact (PII for sellers)
-- Separate table from public.profiles so the public columns
-- (username, city, reputation) stay readable by all users while
-- the personal info (cédula, whatsapp, real name) is restricted
-- to the owner only.

create table if not exists public.profile_contact (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  first_name   text not null,
  last_name    text not null,
  national_id  text not null,
  whatsapp     text not null,
  city         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profile_contact enable row level security;

drop policy if exists "contact_select_self"  on public.profile_contact;
drop policy if exists "contact_insert_self"  on public.profile_contact;
drop policy if exists "contact_update_self"  on public.profile_contact;

create policy "contact_select_self"
  on public.profile_contact for select
  using (auth.uid() = user_id);

create policy "contact_insert_self"
  on public.profile_contact for insert
  with check (auth.uid() = user_id);

create policy "contact_update_self"
  on public.profile_contact for update
  using (auth.uid() = user_id);

drop trigger if exists profile_contact_set_updated_at on public.profile_contact;
create trigger profile_contact_set_updated_at
  before update on public.profile_contact
  for each row execute function public.set_updated_at();
